// ESLint loads plugins under Node in editor integrations, so this file must
// not depend on the Bun global. Keep a pure-JS YAML parser here and export the
// spec limits so Bun tests can import the same constants.
import { parse as parseYaml } from "yaml";

const VALID_MODES = ["primary", "subagent", "all"];
const VALID_COLORS = ["primary", "accent", "warning", "error", "info", "success", "secondary"];
const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;
const VALID_ACTIONS = ["allow", "ask", "deny"];
const MODEL_ID_RE = /^\S[^\s/]*\/\S+$/;
const ALLOWED_TOOLS_RE = /^[A-Z][A-Z0-9]*(?:\([^)]+\))?$/i;
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SKILL_NAME_MAX = 64;
export const COMPATIBILITY_MAX = 500;
export const DESCRIPTION_MAX = 1024;
// OpenCode V2 accepts request.body.temperature from 0 to 2.
export const TEMPERATURE_MAX = 2;
const DEPRECATED_AGENT_KEYS = ["permission", "bash", "task", "tools", "temperature"];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFrontmatter(text) {
  const match = text.match(/^---[ \t]*\n([\s\S]*?)\n?---\s*\n/);
  if (!match) {
    return null;
  }
  try {
    return parseYaml(match[1]);
  }
  catch {
    return null;
  }
}

function getExpectedName(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("/skills/")) {
    const match = normalized.match(/skills\/([^/]+)\/SKILL\.md$/);
    return match ? match[1] : null;
  }
  if (normalized.includes("/agents/")) {
    const match = normalized.match(/agents\/(.+)\.md$/);
    return match ? match[1] : null;
  }
  return null;
}

function isSkillFile(filePath) {
  return /\/skills\/[^/]+\/SKILL\.md$/.test(filePath.replace(/\\/g, "/"));
}

function isAgentFile(filePath) {
  return /\/agents\/.+\.md$/.test(filePath.replace(/\\/g, "/"));
}

/**
 * Reads and parses frontmatter for a file of the given target type.
 *
 * @param {object} context ESLint rule context.
 * @param {"skill" | "agent" | "any"} target File types the rule applies to.
 * @returns {{ frontmatter: object | null, expectedName: string | null } | null} Parsed frontmatter and expected name, or null when the file is out of scope.
 */
function readFrontmatter(context, target) {
  const filename = context.filename;
  const isSkill = isSkillFile(filename);
  const isAgent = isAgentFile(filename);
  if (target === "skill" && !isSkill) {
    return null;
  }
  if (target === "agent" && !isAgent) {
    return null;
  }
  if (target === "any" && !isSkill && !isAgent) {
    return null;
  }
  return {
    frontmatter: extractFrontmatter(context.sourceCode.getText()),
    expectedName: getExpectedName(filename),
  };
}

/**
 * Reports each required frontmatter field that is missing from the document.
 *
 * @param {object} context ESLint rule context.
 * @param {object} node Program node used as the report location.
 * @param {object} frontmatter Parsed frontmatter to inspect.
 * @param {string[]} requiredFields Fields that must be present.
 */
function checkRequiredFields(context, node, frontmatter, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in frontmatter)) {
      context.report({ node, messageId: "requiredField", data: { field } });
    }
  }
}

const validSkillFrontmatter = {
  meta: /** @type {const} */ ({
    type: "problem",
    docs: { description: "Validate skill SKILL.md frontmatter" },
    messages: {
      noFrontmatter: "File must have valid YAML frontmatter",
      nameMismatch: "Frontmatter name '{{actual}}' does not match expected name '{{expected}}'",
      nameInvalidFormat: "Frontmatter name '{{actual}}' must match format: lowercase letters, numbers, and hyphens only",
      nameTooLong: "Frontmatter name '{{actual}}' exceeds max length of {{max}} characters",
      descriptionEmpty: "Description must be a non-empty string",
      requiredField: "Missing required field '{{field}}'",
      compatibilityTooLong: "Compatibility field exceeds max length of {{max}} characters",
      allowedToolsInvalid: "Allowed-tools must be a space-separated string",
      allowedToolsTokenInvalid: "Allowed-tools token '{{token}}' has invalid format. Expected 'ToolName' or 'ToolName(pattern)'",
      metadataInvalid: "Metadata must be an object with string values; opencode/autoinvoke may be boolean",
      licenseNotString: "Field 'license' must be a string",
    },
  }),
  create(context) {
    const loaded = readFrontmatter(context, "skill");
    if (!loaded || !loaded.expectedName) {
      return {};
    }
    const frontmatter = loaded.frontmatter;
    const expectedName = loaded.expectedName;
    if (!frontmatter) {
      return {
        Program(node) {
          context.report({ node, messageId: "noFrontmatter" });
        },
      };
    }
    const requiredFields = ["name", "description"];
    return {
      Program(node) {
        checkRequiredFields(context, node, frontmatter, requiredFields);
        if (frontmatter.name) {
          if (frontmatter.name !== expectedName) {
            context.report({ node, messageId: "nameMismatch", data: { actual: frontmatter.name, expected: expectedName } });
          }
          if (!SKILL_NAME_RE.test(frontmatter.name)) {
            context.report({ node, messageId: "nameInvalidFormat", data: { actual: frontmatter.name } });
          }
          if (frontmatter.name.length > SKILL_NAME_MAX) {
            context.report({ node, messageId: "nameTooLong", data: { actual: frontmatter.name, max: SKILL_NAME_MAX } });
          }
        }
        if (frontmatter.description !== undefined
          && (typeof frontmatter.description !== "string" || frontmatter.description.length === 0)) {
          context.report({ node, messageId: "descriptionEmpty" });
        }
        if (frontmatter.license !== undefined && typeof frontmatter.license !== "string") {
          context.report({ node, messageId: "licenseNotString" });
        }
        if (frontmatter.compatibility && frontmatter.compatibility.length > COMPATIBILITY_MAX) {
          context.report({ node, messageId: "compatibilityTooLong", data: { max: COMPATIBILITY_MAX } });
        }
        if (frontmatter["allowed-tools"] !== undefined) {
          if (typeof frontmatter["allowed-tools"] !== "string") {
            context.report({ node, messageId: "allowedToolsInvalid" });
          }
          else {
            const tokens = frontmatter["allowed-tools"].split(/\s+/).filter(Boolean);
            for (const token of tokens) {
              if (!ALLOWED_TOOLS_RE.test(token)) {
                context.report({ node, messageId: "allowedToolsTokenInvalid", data: { token } });
              }
            }
          }
        }
        if (frontmatter.metadata !== undefined) {
          if (typeof frontmatter.metadata !== "object" || frontmatter.metadata === null || Array.isArray(frontmatter.metadata)) {
            context.report({ node, messageId: "metadataInvalid" });
          }
          else {
            for (const [key, value] of Object.entries(frontmatter.metadata)) {
              if (key === "opencode/autoinvoke" && typeof value === "boolean") {
                continue;
              }
              if (typeof value !== "string") {
                context.report({ node, messageId: "metadataInvalid" });
                break;
              }
            }
          }
        }
      },
    };
  },
};

const validAgentFrontmatter = {
  meta: /** @type {const} */ ({
    type: "problem",
    docs: { description: "Validate agent .md frontmatter against the OpenCode V2 schema" },
    messages: {
      noFrontmatter: "File must have valid YAML frontmatter",
      nameMismatch: "Frontmatter name '{{actual}}' does not match expected name '{{expected}}'",
      descriptionEmpty: "Description must be a non-empty string",
      requiredField: "Missing required field '{{field}}'",
      invalidMode: "Invalid mode '{{actual}}'. Must be one of: {{expected}}",
      invalidColor: "Invalid color '{{actual}}'. Must be a named color or hex code",
      invalidPermissionsShape: "Field 'permissions' must be an array of { action, resource, effect } entries",
      invalidPermissionEntry: "Permissions entry #{{index}} must be an object with action, resource, and effect",
      invalidPermissionAction: "Permission action must be a non-empty string (for example: read, edit, shell, subagent)",
      invalidPermissionResource: "Permission resource must be a string",
      invalidPermissionEffect: "Permission effect must be 'allow', 'ask', or 'deny'",
      invalidRequestShape: "Field '{{field}}' must be an object",
      temperatureOutOfRange: "Temperature must be a number between 0 and {{max}}",
      fieldNotBoolean: "Field '{{field}}' must be a boolean",
      fieldNotPositiveInt: "Field '{{field}}' must be a positive integer",
      fieldNotString: "Field '{{field}}' must be a string",
      hiddenOnlySubagent: "Field 'hidden' is only valid for agents with mode 'subagent'",
      modelFormatInvalid: "Field 'model' should follow the format 'provider/model-id' (e.g. 'anthropic/claude-sonnet-4')",
    },
  }),
  create(context) {
    const loaded = readFrontmatter(context, "agent");
    if (!loaded || !loaded.expectedName) {
      return {};
    }
    const frontmatter = loaded.frontmatter;
    const expectedName = loaded.expectedName;
    if (!frontmatter) {
      return {
        Program(node) {
          context.report({ node, messageId: "noFrontmatter" });
        },
      };
    }
    const requiredFields = ["name", "description", "mode", "permissions"];
    return {
      Program(node) {
        checkRequiredFields(context, node, frontmatter, requiredFields);
        if (frontmatter.name && frontmatter.name !== expectedName) {
          context.report({ node, messageId: "nameMismatch", data: { actual: frontmatter.name, expected: expectedName } });
        }
        if (frontmatter.description !== undefined
          && (typeof frontmatter.description !== "string" || frontmatter.description.length === 0)) {
          context.report({ node, messageId: "descriptionEmpty" });
        }
        if (frontmatter.mode && !VALID_MODES.includes(frontmatter.mode)) {
          context.report({ node, messageId: "invalidMode", data: { actual: frontmatter.mode, expected: VALID_MODES.join(", ") } });
        }
        if (frontmatter.color && !VALID_COLORS.includes(frontmatter.color) && !HEX_COLOR_RE.test(frontmatter.color)) {
          context.report({ node, messageId: "invalidColor", data: { actual: frontmatter.color } });
        }

        // In V2, `action` names the permission (read, edit, shell, subagent);
        // `effect` carries allow/ask/deny. The V1 `permission` map is reported
        // by the deprecation rule instead of being validated here.
        if (frontmatter.permissions !== undefined) {
          if (!Array.isArray(frontmatter.permissions)) {
            context.report({ node, messageId: "invalidPermissionsShape" });
          }
          else {
            frontmatter.permissions.forEach((entry, index) => {
              if (!isRecord(entry)) {
                context.report({ node, messageId: "invalidPermissionEntry", data: { index: index + 1 } });
                return;
              }
              if (typeof entry.action !== "string" || entry.action.length === 0) {
                context.report({ node, messageId: "invalidPermissionAction" });
              }
              if (typeof entry.resource !== "string") {
                context.report({ node, messageId: "invalidPermissionResource" });
              }
              if (!VALID_ACTIONS.includes(entry.effect)) {
                context.report({ node, messageId: "invalidPermissionEffect" });
              }
            });
          }
        }

        // Provider options moved under request.body in V2. A top-level
        // temperature is reported as a deprecated V1 key, not validated here.
        if (frontmatter.request !== undefined) {
          if (!isRecord(frontmatter.request)) {
            context.report({ node, messageId: "invalidRequestShape", data: { field: "request" } });
          }
          else if (frontmatter.request.body !== undefined) {
            if (!isRecord(frontmatter.request.body)) {
              context.report({ node, messageId: "invalidRequestShape", data: { field: "request.body" } });
            }
            else if (frontmatter.request.body.temperature !== undefined) {
              const temperature = frontmatter.request.body.temperature;
              if (typeof temperature !== "number" || temperature < 0 || temperature > TEMPERATURE_MAX) {
                context.report({ node, messageId: "temperatureOutOfRange", data: { max: TEMPERATURE_MAX } });
              }
            }
          }
        }

        for (const boolField of ["disable", "hidden"]) {
          if (frontmatter[boolField] !== undefined && typeof frontmatter[boolField] !== "boolean") {
            context.report({ node, messageId: "fieldNotBoolean", data: { field: boolField } });
          }
        }
        if (frontmatter.hidden === true && frontmatter.mode !== "subagent") {
          context.report({ node, messageId: "hiddenOnlySubagent" });
        }
        for (const intField of ["steps", "max-steps"]) {
          if (frontmatter[intField] !== undefined) {
            const val = frontmatter[intField];
            if (!Number.isInteger(val) || val <= 0) {
              context.report({ node, messageId: "fieldNotPositiveInt", data: { field: intField } });
            }
          }
        }
        for (const strField of ["model", "prompt"]) {
          if (frontmatter[strField] !== undefined && typeof frontmatter[strField] !== "string") {
            context.report({ node, messageId: "fieldNotString", data: { field: strField } });
          }
        }
        if (frontmatter.model !== undefined && typeof frontmatter.model === "string" && !MODEL_ID_RE.test(frontmatter.model)) {
          context.report({ node, messageId: "modelFormatInvalid" });
        }
      },
    };
  },
};

const deprecatedAgentFrontmatter = {
  meta: /** @type {const} */ ({
    type: "suggestion",
    docs: { description: "Warn about obsolete V1 agent frontmatter keys" },
    messages: {
      legacyV1Key: "Field '{{field}}' uses the obsolete V1 agent schema; migrate to V2 permissions and request.body",
    },
  }),
  create(context) {
    const loaded = readFrontmatter(context, "agent");
    if (!loaded?.frontmatter) {
      return {};
    }
    const frontmatter = loaded.frontmatter;
    return {
      Program(node) {
        for (const field of DEPRECATED_AGENT_KEYS) {
          if (field in frontmatter) {
            context.report({ node, messageId: "legacyV1Key", data: { field } });
          }
        }
      },
    };
  },
};

const descriptionLength = {
  meta: /** @type {const} */ ({
    type: "problem",
    docs: { description: "Require frontmatter description to stay within the spec limit" },
    messages: {
      tooLong: "Description is {{length}} characters (max {{limit}})",
    },
  }),
  create(context) {
    const loaded = readFrontmatter(context, "any");
    if (!loaded?.frontmatter
      || !loaded.frontmatter.description
      || typeof loaded.frontmatter.description !== "string") {
      return {};
    }
    const frontmatter = loaded.frontmatter;
    if (frontmatter.description.length <= DESCRIPTION_MAX) {
      return {};
    }
    return {
      Program(node) {
        context.report({
          node,
          messageId: "tooLong",
          data: { length: frontmatter.description.length, limit: DESCRIPTION_MAX },
        });
      },
    };
  },
};

const plugin = {
  meta: {
    name: "eslint-plugin-opencode",
    version: "0.0.1",
    namespace: "opencode",
  },
  configs: {},
  rules: {
    "valid-skill-frontmatter": validSkillFrontmatter,
    "valid-agent-frontmatter": validAgentFrontmatter,
    "deprecated-agent-frontmatter": deprecatedAgentFrontmatter,
    "description-length": descriptionLength,
  },
};

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        opencode: plugin,
      },
      rules: {
        "opencode/valid-skill-frontmatter": "error",
        "opencode/valid-agent-frontmatter": "error",
        "opencode/deprecated-agent-frontmatter": "warn",
        "opencode/description-length": "error",
      },
    },
  ],
});

export default plugin;
