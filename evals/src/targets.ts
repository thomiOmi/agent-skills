/**
 * Shared targets and constants for the eval runner.
 *
 * Targets are either skills (skills/<name>/SKILL.md, modes with_skill and
 * without_skill) or agents (agents/<name>.md, modes with_agent and
 * without_agent). Case files default to skill targets for backward
 * compatibility; they opt into agent evaluation with target: "agent".
 */

import { join, resolve } from "pathe";

import type { Assertion } from "./grading";

export type EvalMode = "with_skill" | "without_skill";
export type AgentMode = "with_agent" | "without_agent";
export type RunMode = EvalMode | AgentMode;
export type EvalTarget = "skill" | "agent";

export const MODES: EvalMode[] = ["with_skill", "without_skill"];
export const AGENT_MODES: AgentMode[] = ["with_agent", "without_agent"];

export const WORKSPACE_ROOT = resolve(process.cwd(), "evals", "workspace");
export const CASES_DIR = resolve(process.cwd(), "evals", "cases");
export const SKILLS_ROOT = resolve(process.cwd(), "skills");
export const AGENTS_ROOT = resolve(process.cwd(), "agents");

/** A/B mode pair for a target type: with_skill/without_skill or with_agent/without_agent. */
export function modesForTarget(target: EvalTarget): RunMode[] {
  return target === "agent" ? AGENT_MODES : MODES;
}

/**
 * Where a target's definition lives: the skill directory (SKILL.md inside) or
 * the agent file itself. Existence is checked by the runner with a hint to the
 * other target type, so a mistyped target fails fast instead of silently
 * running an A/B pair where both sides are identical.
 */
export function resolveEvalTarget(name: string, target: EvalTarget): string {
  return target === "agent" ? join(AGENTS_ROOT, `${name}.md`) : join(SKILLS_ROOT, name);
}

/**
 * Pinned default executor. Auto-selection caused quota failures that could not
 * be rerouted because nobody knew which model was in use (small_model in the
 * global config pointed at the wrong model), so the model is pinned explicitly.
 * The build agent makes candidates execute the task instead of answering in
 * plan mode.
 */
export const DEFAULT_EXECUTOR = "opencode run --model opencode/mimo-v2.5-free --agent build --auto";

export interface EvalCase {
  id: number
  prompt: string
  expected_output?: string
  files?: string[]
  assertions?: Assertion[]
}

export interface EvalsFile {
  /**
   * Name of the evaluated target: a skill directory or, when target is
   * "agent", an agent file stem (agents/<skill_name>.md). The field name is
   * kept as skill_name for backward compatibility with existing case files.
   */
  skill_name: string
  target?: EvalTarget
  evals: EvalCase[]
}

export interface EntryStatus {
  status: string
  passed: number
  total: number
}
