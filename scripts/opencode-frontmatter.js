import { parse as parseYaml } from "yaml";

const VALID_MODES = ["primary", "subagent", "all"];
const VALID_COLORS = ["primary", "accent", "warning", "error", "info", "success", "secondary"];
const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;
const VALID_ACTIONS = ["allow", "ask", "deny"];
const MODEL_ID_RE = /^\S[^\s/]*\/\S+$/;
const ALLOWED_TOOLS_RE = /^[A-Z][A-Z0-9]*(?:\([^)]+\))?$/i;
const VALID_PERMISSION_KEYS = [
  "read",
  "edit",
  "glob",
  "grep",
  "list",
  "bash",
  "task",
  "external_directory",
  "todowrite",
  "webfetch",
  "websearch",
  "lsp",
  "skill",
  "question",
  "doom_loop",
];
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_NAME_MAX = 64;
const COMPATIBILITY_MAX = 500;
const DESCRIPTION_WARN_LIMIT = 1024;

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

const validSkillFrontmatter = {
  meta: /** @type {const} */ ({
    type: "problem",
    docs: { description: "Validate skill SKILL.md frontmatter" },
    messages: {
      noFrontmatter: "File must have valid YAML frontmatter",
      nameMismatch: "Frontmatter name '{{actual}}' does not match expected name '{{expected}}'",
      nameInvalidFormat: "Frontmatter name '{{actual}}' must match format: lowercase letters, numbers, and hyphens only",
      nameTooLong: "Frontmatter name '{{actual}}' exceeds max length of {{max}} characters",
      descriptionEmpty: "Description must not be empty",
      requiredField: "Missing required field '{{field}}'",
      compatibilityTooLong: "Compatibility field exceeds max length of {{max}} characters",
      allowedToolsInvalid: "Allowed-tools must be a space-separated string",
      allowedToolsTokenInvalid: "Allowed-tools token '{{token}}' has invalid format. Expected 'ToolName' or 'ToolName(pattern)'",
      metadataInvalid: "Metadata must be an object with string values",
      licenseNotString: "Field 'license' must be a string",
    },
  }),
  create(context) {
    const text = context.sourceCode.getText();
    const filename = context.filename;
    if (!isSkillFile(filename)) {
      return {};
    }
    const expectedName = getExpectedName(filename);
    if (!expectedName) {
      return {};
    }
    const frontmatter = extractFrontmatter(text);
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
        for (const field of requiredFields) {
          if (!(field in frontmatter)) {
            context.report({ node, messageId: "requiredField", data: { field } });
          }
        }
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
        if (frontmatter.description !== undefined) {
          if (typeof frontmatter.description !== "string" || frontmatter.description.trim().length === 0) {
            context.report({ node, messageId: "descriptionEmpty" });
          }
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
            for (const value of Object.values(frontmatter.metadata)) {
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
    docs: { description: "Validate agent .md frontmatter" },
    messages: {
      noFrontmatter: "File must have valid YAML frontmatter",
      nameMismatch: "Frontmatter name '{{actual}}' does not match expected name '{{expected}}'",
      descriptionEmpty: "Description must not be empty",
      requiredField: "Missing required field '{{field}}'",
      invalidMode: "Invalid mode '{{actual}}'. Must be one of: {{expected}}",
      invalidColor: "Invalid color '{{actual}}'. Must be a named color or hex code",
      invalidPermissionKey: "Unknown permission key '{{key}}'",
      invalidPermissionValue: "Permission value for '{{field}}' must be 'allow', 'ask', or 'deny'",
      temperatureOutOfRange: "Temperature must be a number between 0.0 and 1.0",
      topPOutOfRange: "top_p must be a number between 0.0 and 1.0",
      fieldNotBoolean: "Field '{{field}}' must be a boolean",
      fieldNotPositiveInt: "Field '{{field}}' must be a positive integer",
      fieldNotString: "Field '{{field}}' must be a string",
      fieldNotArrayOfStrings: "Field '{{field}}' must be an array of strings",
      maxStepsDeprecated: "Field 'maxSteps' is deprecated. Use 'steps' instead",
      toolsDeprecated: "Field 'tools' is deprecated. Use 'permission' instead",
      hiddenOnlySubagent: "Field 'hidden' is only valid for agents with mode 'subagent'",
      modelFormatInvalid: "Field 'model' should follow the format 'provider/model-id' (e.g. 'anthropic/claude-sonnet-4')",
    },
  }),
  create(context) {
    const text = context.sourceCode.getText();
    const filename = context.filename;
    if (!isAgentFile(filename)) {
      return {};
    }
    const expectedName = getExpectedName(filename);
    if (!expectedName) {
      return {};
    }
    const frontmatter = extractFrontmatter(text);
    if (!frontmatter) {
      return {
        Program(node) {
          context.report({ node, messageId: "noFrontmatter" });
        },
      };
    }
    const requiredFields = ["name", "description", "mode"];
    return {
      Program(node) {
        for (const field of requiredFields) {
          if (!(field in frontmatter)) {
            context.report({ node, messageId: "requiredField", data: { field } });
          }
        }
        if (frontmatter.name && frontmatter.name !== expectedName) {
          context.report({ node, messageId: "nameMismatch", data: { actual: frontmatter.name, expected: expectedName } });
        }
        if (frontmatter.description !== undefined) {
          if (typeof frontmatter.description !== "string" || frontmatter.description.trim().length === 0) {
            context.report({ node, messageId: "descriptionEmpty" });
          }
        }
        if (frontmatter.mode && !VALID_MODES.includes(frontmatter.mode)) {
          context.report({ node, messageId: "invalidMode", data: { actual: frontmatter.mode, expected: VALID_MODES.join(", ") } });
        }
        if (frontmatter.color && !VALID_COLORS.includes(frontmatter.color) && !HEX_COLOR_RE.test(frontmatter.color)) {
          context.report({ node, messageId: "invalidColor", data: { actual: frontmatter.color } });
        }
        if (frontmatter.permission !== undefined) {
          if (typeof frontmatter.permission === "string") {
            if (!VALID_ACTIONS.includes(frontmatter.permission)) {
              context.report({ node, messageId: "invalidPermissionValue", data: { field: "permission" } });
            }
          }
          else if (typeof frontmatter.permission === "object" && frontmatter.permission !== null && !Array.isArray(frontmatter.permission)) {
            for (const [key, value] of Object.entries(frontmatter.permission)) {
              if (key !== "*" && !VALID_PERMISSION_KEYS.includes(key)) {
                context.report({ node, messageId: "invalidPermissionKey", data: { key } });
              }
              if (typeof value === "string") {
                if (!VALID_ACTIONS.includes(value)) {
                  context.report({ node, messageId: "invalidPermissionValue", data: { field: key } });
                }
              }
              else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                for (const [pattern, action] of Object.entries(value)) {
                  if (typeof action !== "string" || !VALID_ACTIONS.includes(action)) {
                    context.report({ node, messageId: "invalidPermissionValue", data: { field: `${key}.${pattern}` } });
                  }
                }
              }
              else {
                context.report({ node, messageId: "invalidPermissionValue", data: { field: key } });
              }
            }
          }
          else {
            context.report({ node, messageId: "invalidPermissionValue", data: { field: "permission" } });
          }
        }
        if (frontmatter.temperature !== undefined) {
          if (typeof frontmatter.temperature !== "number" || frontmatter.temperature < 0 || frontmatter.temperature > 1) {
            context.report({ node, messageId: "temperatureOutOfRange" });
          }
        }
        if (frontmatter.top_p !== undefined) {
          if (typeof frontmatter.top_p !== "number" || frontmatter.top_p < 0 || frontmatter.top_p > 1) {
            context.report({ node, messageId: "topPOutOfRange" });
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
        if (frontmatter.maxSteps !== undefined) {
          context.report({ node, messageId: "maxStepsDeprecated" });
          if (!Number.isInteger(frontmatter.maxSteps) || frontmatter.maxSteps <= 0) {
            context.report({ node, messageId: "fieldNotPositiveInt", data: { field: "maxSteps" } });
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
        if (frontmatter.tools !== undefined) {
          context.report({ node, messageId: "toolsDeprecated" });
          if (typeof frontmatter.tools !== "object" || frontmatter.tools === null || Array.isArray(frontmatter.tools)) {
            context.report({ node, messageId: "fieldNotArrayOfStrings", data: { field: "tools" } });
          }
          else {
            for (const value of Object.values(frontmatter.tools)) {
              if (typeof value !== "boolean") {
                context.report({ node, messageId: "fieldNotArrayOfStrings", data: { field: "tools" } });
                break;
              }
            }
          }
        }
      },
    };
  },
};

const descriptionLength = {
  meta: /** @type {const} */ ({
    type: "suggestion",
    docs: { description: "Warn when frontmatter description exceeds max length" },
    messages: {
      tooLong: "Description is {{length}} characters (max {{limit}})",
    },
  }),
  create(context) {
    const text = context.sourceCode.getText();
    const filename = context.filename;
    if (!isAgentFile(filename) && !isSkillFile(filename)) {
      return {};
    }
    const frontmatter = extractFrontmatter(text);
    if (!frontmatter || !frontmatter.description || typeof frontmatter.description !== "string") {
      return {};
    }
    if (frontmatter.description.length <= DESCRIPTION_WARN_LIMIT) {
      return {};
    }
    return {
      Program(node) {
        context.report({
          node,
          messageId: "tooLong",
          data: { length: frontmatter.description.length, limit: DESCRIPTION_WARN_LIMIT },
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
        "opencode/description-length": "warn",
      },
    },
  ],
});

export default plugin;
