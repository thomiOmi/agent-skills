export type {
  OpenCodeConfig,
  OpenCodeTuiConfig,
  PreparedConfig,
  PreparedConfigs,
} from "./install/config-merge";

export {
  hasJsonComments,
  mergeConfigDefaults,
  prepareConfigs,
  writeConfigFile,
} from "./install/config-merge";
