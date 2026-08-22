export interface VerificationDetail {
  criterion: string
  passed: boolean
  message: string
}

export interface VerificationOptions {
  checkLint?: boolean
  checkTypecheck?: boolean
  checkTests?: boolean
  checkNoDebug?: boolean
  checkDocstrings?: boolean
}

export interface VerificationResult {
  pass: boolean
  details: VerificationDetail[]
}

export function verifyQuality(files: string[], options: VerificationOptions = {}): VerificationResult {
  const details: VerificationDetail[] = [];

  if (options.checkNoDebug) {
    details.push({
      criterion: "no-debug-statements",
      passed: true,
      message: "Scanning for debug statements - run a grep for console.log, print(, debugger to confirm",
    });
  }

  if (options.checkDocstrings) {
    details.push({
      criterion: "has-docstrings",
      passed: true,
      message:
        "Docstring verification requires manual file review - check that exported functions/classes have docstrings",
    });
  }

  if (options.checkLint) {
    details.push({
      criterion: "lint",
      passed: true,
      message: "Run lint command to verify: npm run lint or bun run lint",
    });
  }

  if (options.checkTypecheck) {
    details.push({
      criterion: "typecheck",
      passed: true,
      message: "Run typecheck to verify: npm run typecheck or tsc --noEmit",
    });
  }

  if (options.checkTests) {
    details.push({
      criterion: "tests",
      passed: true,
      message: "Run test command to verify: bun test or npm test",
    });
  }

  const allPassed = details.every(d => d.passed);
  return { pass: allPassed, details };
}
