import { isCI, platform, provider } from "std-env";

export const env = {
  ci: isCI,
  provider: isCI ? (provider ?? "unknown") : null,
  isWindows: platform === "windows",
  platform,
};
