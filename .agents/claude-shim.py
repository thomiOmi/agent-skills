#!/usr/bin/env python3
"""Executor shim: translates `claude -p` calls from vendored scripts to `opencode run`.

Vendored tooling under .agents/skills/skill-creator shells out to `claude -p`.
This shim never edits vendored files; it provides a `claude`-compatible CLI on
top of OpenCode. See .agents/README.md for the pinned contract.

Supported modes:
1. stream-json mode (run_eval.py):
   claude -p <prompt> --output-format stream-json --verbose --include-partial-messages [--model M]
   Emits NDJSON events on stdout compatible with run_eval.py's parser:
   - {"type": "stream_event", "event": {...}} forwarded from opencode's raw JSON events
   - fallback synthesized {"type": "assistant", "message": {"content": [{"type": "tool_use", ...}]}}
   - terminating {"type": "result"}
2. text mode (improve_description.py):
   claude -p --output-format text   (prompt on stdin)
   Prints the assistant text response to stdout.

OpenCode mapping:
   opencode run [--model provider/id] [--agent A] --format json <prompt>
Model flag: claude's `--model <name>` is passed through as `--model <name>`
when it contains a provider prefix; bare names are left to opencode config.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys

OPENCODE_BIN = os.environ.get("AGENT_SKILLS_OPENCODE_BIN", "opencode")
DEFAULT_AGENT = os.environ.get("AGENT_SKILLS_OPENCODE_AGENT", "build")
DEFAULT_MODEL = os.environ.get("AGENT_SKILLS_OPENCODE_MODEL", "opencode/mimo-v2.5-free")


def resolve_opencode(bin_name: str) -> list[str]:
    """Return an argv prefix that can be executed directly on this platform.

    On Windows, `opencode` is typically a .ps1 or .cmd shim that Popen cannot
    execute directly; resolve to the real .exe when present, else wrap.
    """
    if os.name != "nt":
        return [bin_name]
    exe = shutil.which(bin_name + ".exe")
    if exe:
        return [exe]
    script = shutil.which(bin_name)
    if script and script.endswith(".cmd"):
        return [script]
    if script and script.endswith(".ps1"):
        return ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script]
    return [bin_name]



def build_opencode_cmd(prompt: list[str], model: str | None, stream: bool) -> list[str]:
    cmd = resolve_opencode(OPENCODE_BIN)
    cmd.extend(["run"])
    resolved = model or DEFAULT_MODEL
    if resolved:
        cmd.extend(["--model", resolved])
    if DEFAULT_AGENT:
        cmd.extend(["--agent", DEFAULT_AGENT])
    if stream:
        cmd.extend(["--format", "json"])
    cmd.extend(prompt)
    return cmd


def clean_env() -> dict:
    # Mirror upstream: drop guard env vars that block nesting.
    env = {k: v for k, v in os.environ.items() if k not in ("CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT")}
    return env


def run_stream_json(prompt: list[str], model: str | None) -> int:
    """Forward opencode raw JSON events as claude-compatible NDJSON."""
    cmd = build_opencode_cmd(prompt, model, stream=True)
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=None,
        env=clean_env(),
    )
    assert proc.stdout is not None
    forwarded_any = False
    try:
        for raw in proc.stdout:
            line = raw.decode("utf-8", errors="replace").strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(event, dict):
                continue
            etype = event.get("type")
            if etype in ("step_start", "step_finish", "tool_use", "tool_result", "message_update"):
                # Forward as a stream_event envelope; opencode part keys differ
                # from anthropic ones, so run_eval.py's early-detection path
                # stays inert and its fallback (assistant message) decides.
                print(json.dumps({"type": "stream_event", "event": event}), flush=True)
                forwarded_any = True
            elif etype == "text":
                # Assistant text message; synthesize the fallback assistant
                # event with no tool_use so detection returns False (text-only
                # replies never count as skill triggers).
                print(
                    json.dumps(
                        {
                            "type": "assistant",
                            "message": {"content": [{"type": "text", "text": event.get("text", "")}]},
                        }
                    ),
                    flush=True,
                )
                forwarded_any = True
            elif etype in ("assistant", "result", "stream_event"):
                # Already-compatible shapes (future-proofing).
                print(json.dumps(event), flush=True)
                forwarded_any = True
            # Anything else: ignore.
    finally:
        if proc.poll() is None:
            proc.kill()
        proc.wait()
    print(json.dumps({"type": "result", "forwarded": forwarded_any}), flush=True)
    return proc.returncode or 0


def run_text(prompt: list[str], model: str | None) -> int:
    """Run opencode and print the final text response (default format)."""
    cmd = build_opencode_cmd(prompt, model, stream=False)
    if not prompt:
        # Upstream passes the prompt on stdin in text mode.
        cmd.append(sys.stdin.read())
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=None, env=clean_env())
    sys.stdout.write(result.stdout.decode("utf-8", errors="replace"))
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(add_help=False, allow_abbrev=False)
    parser.add_argument("-p", "--print", dest="print_mode", action="store_true")
    parser.add_argument("--output-format", default="text", choices=["text", "stream-json", "json"])
    parser.add_argument("--model", default=None)
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--include-partial-messages", action="store_true")
    parser.add_argument("prompt", nargs=argparse.REMAINDER)
    args, _unknown = parser.parse_known_args()

    prompt = [a for a in args.prompt if a != "--"]
    if not prompt:
        prompt = [sys.stdin.read()]

    if args.output_format == "stream-json":
        return run_stream_json(prompt, args.model)
    return run_text(prompt, args.model)


if __name__ == "__main__":
    sys.exit(main())
