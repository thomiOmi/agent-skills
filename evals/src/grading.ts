/**
 * Deterministic assertion grading for agent skill evals.
 *
 * Extracted from scripts/evals/run-evals.ts during the evals/src refactor
 * (behavior-preserving). The assertion object form exists because the
 * iteration-2 review found two failure modes the plain string form cannot
 * express: convention tokens are case-sensitive (`BREAKING CHANGE` must not
 * pass for `Breaking change:`), and a candidate can satisfy keywords while
 * only asking for the missing input, so deferral hides behind partial credit.
 */

/**
 * A graded assertion. Plain strings keep the original behaviour (case-insensitive
 * substring match), so existing case files and their recorded results stay valid.
 */
export type Assertion = string | {
  /** Literal substring, or a regular expression when `regex` is true. */
  text: string
  /** Compile `text` with `new RegExp` instead of substring matching. */
  regex?: boolean
  /** Match case-sensitively. Required for convention tokens like BREAKING CHANGE. */
  caseSensitive?: boolean
  /** Assert the pattern is absent. Used for anti-deferral guards. */
  negate?: boolean
};

export interface GradeResult {
  passed: number
  total: number
  details: { assertion: Assertion, passed: boolean }[]
}

/**
 * Evaluate one assertion against executor output. Throws on an invalid regex
 * so a malformed case file fails loudly instead of silently passing everything.
 */
function evaluateAssertion(output: string, assertion: Assertion): boolean {
  if (typeof assertion === "string") {
    return output.toLowerCase().includes(assertion.toLowerCase());
  }
  if (assertion.regex) {
    // Regex flag combos are validated in validateAssertions; keep the flags in
    // one place so the validator and evaluator cannot drift.
    const flags = assertion.caseSensitive ? "" : "i";
    return assertion.negate
      ? !new RegExp(assertion.text, flags).test(output)
      : new RegExp(assertion.text, flags).test(output);
  }
  const found = assertion.caseSensitive
    ? output.includes(assertion.text)
    : output.toLowerCase().includes(assertion.text.toLowerCase());
  return assertion.negate ? !found : found;
}

/**
 * Reject malformed object assertions at run start, before any executor spend.
 * Plain strings are always valid.
 */
export function validateAssertions(assertions: Assertion[] | undefined, context: string): string[] {
  const errors: string[] = [];
  for (const assertion of assertions ?? []) {
    if (typeof assertion === "string") {
      continue;
    }
    if (typeof assertion.text !== "string" || assertion.text.length === 0) {
      errors.push(`${context}: object assertion needs a non-empty "text"`);
      continue;
    }
    if (assertion.regex) {
      try {
        new RegExp(assertion.text, assertion.caseSensitive ? "" : "i");
      }
      catch (err) {
        errors.push(`${context}: invalid regex "${assertion.text}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return errors;
}

export function gradeOutput(output: string, assertions: Assertion[] | undefined): GradeResult {
  const list = assertions ?? [];
  if (list.length === 0) {
    return { passed: 0, total: 0, details: [] };
  }
  const details = list.map(assertion => ({
    assertion,
    passed: evaluateAssertion(output, assertion),
  }));
  return {
    passed: details.filter(d => d.passed).length,
    total: details.length,
    details,
  };
}

/**
 * Bump when grading semantics change. Results graded under different versions
 * are not comparable, so summary.json records the version that produced them.
 */
export const GRADING_VERSION = 2;
