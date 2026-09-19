/**
 * Shared targets and constants for the eval runner.
 *
 * Extracted from scripts/evals/run-evals.ts during the evals/src refactor
 * (behavior-preserving). Fase 4 will extend this module with eval target
 * agent support (--target flag, target resolution between skills/ and agents/).
 */

import { resolve } from "pathe";

import type { Assertion } from "./grading";

export type EvalMode = "with_skill" | "without_skill";

export const MODES: EvalMode[] = ["with_skill", "without_skill"];

export const WORKSPACE_ROOT = resolve(process.cwd(), "evals", "workspace");
export const CASES_DIR = resolve(process.cwd(), "evals", "cases");
export const SKILLS_ROOT = resolve(process.cwd(), "skills");

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
  skill_name: string
  evals: EvalCase[]
}

export interface EntryStatus {
  status: string
  passed: number
  total: number
}
