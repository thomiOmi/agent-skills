import process from "node:process";

function detectProvider(): string {
  if (process.env.GITHUB_ACTIONS !== undefined) {
    return "github";
  }
  if (process.env.GITLAB_CI !== undefined) {
    return "gitlab";
  }
  if (process.env.CIRCLECI !== undefined) {
    return "circleci";
  }
  if (process.env.TRAVIS !== undefined) {
    return "travis";
  }
  if (process.env.JENKINS_URL !== undefined) {
    return "jenkins";
  }
  if (process.env.AZURE_HTTP_USER_AGENT !== undefined) {
    return "azure";
  }
  if (process.env.BITBUCKET_BRANCH_NAME !== undefined) {
    return "bitbucket";
  }
  return "unknown";
}

function detectCi(): boolean {
  return !!(
    process.env.CI !== undefined
    || process.env.CONTINUOUS_INTEGRATION !== undefined
    || process.env.BUILD_NUMBER !== undefined
    || process.env.GITHUB_ACTIONS !== undefined
    || process.env.GITLAB_CI !== undefined
    || process.env.CIRCLECI !== undefined
    || process.env.TRAVIS !== undefined
    || process.env.JENKINS_URL !== undefined
  );
}

export const env = {
  ci: detectCi(),
  provider: detectProvider(),
  isWindows: process.platform === "win32",
  platform: process.platform === "win32" ? "windows" : process.platform,
};
