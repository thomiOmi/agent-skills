import process from "node:process";

function detectProvider(): string {
  if (process.env.GITHUB_ACTIONS) {
    return "github";
  }
  if (process.env.GITLAB_CI) {
    return "gitlab";
  }
  if (process.env.CIRCLECI) {
    return "circleci";
  }
  if (process.env.TRAVIS) {
    return "travis";
  }
  if (process.env.JENKINS_URL) {
    return "jenkins";
  }
  if (process.env.AZURE_HTTP_USER_AGENT) {
    return "azure";
  }
  if (process.env.BITBUCKET_BRANCH_NAME) {
    return "bitbucket";
  }
  return "unknown";
}

function detectCi(): boolean {
  return !!(
    process.env.CI
    || process.env.CONTINUOUS_INTEGRATION
    || process.env.BUILD_NUMBER
    || process.env.GITHUB_ACTIONS
    || process.env.GITLAB_CI
    || process.env.CIRCLECI
    || process.env.TRAVIS
    || process.env.JENKINS_URL
  );
}

export const env = {
  ci: detectCi(),
  provider: detectProvider(),
  isWindows: process.platform === "win32",
  platform: process.platform === "win32" ? "windows" : process.platform,
};
