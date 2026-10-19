/**
 * Line-hygiene formatting rules for JSON, JSONC, and JSON5 files.
 *
 * @stylistic rules cannot run on these files: @eslint/json produces a
 * `Document` root AST (Document/Object/Member/String/Number) with no `Program`
 * node, so every stylistic rule is a silent no-op there, and @eslint/json
 * itself ships no whitespace rules. These rules are line-based (not
 * token-based), which is all JSON needs for whitespace hygiene: collapsing
 * blank-line runs, stripping trailing spaces, and requiring a final newline.
 */

/**
 * Split raw text into lines with exact offsets, handling CRLF and LF.
 * @param {string} text - full file text
 * @returns {Array<{ text: string, start: number, end: number, eolEnd: number }>} Line records with exact offsets.
 */
function buildLines(text) {
  const lines = [];
  let pos = 0;
  for (;;) {
    let nl = pos;
    while (nl < text.length && text[nl] !== "\n" && text[nl] !== "\r") {
      nl++;
    }
    let eolEnd = nl;
    if (text[nl] === "\r" && text[nl + 1] === "\n") {
      eolEnd = nl + 2;
    }
    else if (nl < text.length) {
      eolEnd = nl + 1;
    }
    lines.push({ text: text.slice(pos, nl), start: pos, end: nl, eolEnd });
    if (nl >= text.length) {
      break;
    }
    pos = eolEnd;
  }
  return lines;
}

/**
 * Remove a whole line including its line terminator.
 * @param {ReturnType<typeof buildLines>} lines
 * @param {number} index - index of the line to remove
 * @param {number} textLength - total text length, for the final line
 * @returns {[number, number]} Range covering the line and its line terminator.
 */
function lineRange(lines, index, textLength) {
  const nextStart = index + 1 < lines.length ? lines[index + 1].start : textLength;
  return [lines[index].start, nextStart];
}

const multipleEmptyLines = {
  meta: /** @type {const} */ ({
    type: "layout",
    docs: { description: "enforce limits on consecutive blank lines in JSON files" },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "integer", minimum: 0 },
          maxBOF: { type: "integer", minimum: 0 },
          maxEOF: { type: "integer", minimum: 0 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      multiple: "Unexpected blank line ({{limit}} allowed here).",
    },
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const max = options.max ?? 1;
    const maxBOF = options.maxBOF ?? 0;
    const maxEOF = options.maxEOF ?? 0;
    return {
      Document() {
        const text = context.sourceCode.text;
        if (!text) {
          return;
        }
        const lines = buildLines(text);
        const real = lines.at(-1)?.start === text.length ? lines.slice(0, -1) : lines;
        let lastContent = -1;
        for (let i = real.length - 1; i >= 0; i--) {
          if (real[i].text.trim() !== "") {
            lastContent = i;
            break;
          }
        }
        if (lastContent === -1) {
          return;
        }
        const report = (index, limit) => {
          const line = real[index];
          context.report({
            loc: {
              start: { line: index + 1, column: 1 },
              end: { line: index + 1, column: line.text.length + 1 },
            },
            messageId: "multiple",
            data: { limit },
            fix: fixer => fixer.removeRange(lineRange(lines, index, text.length)),
          });
        };
        let i = 0;
        while (i <= lastContent) {
          if (real[i].text.trim() !== "") {
            i++;
            continue;
          }
          let j = i;
          while (j <= lastContent && real[j].text.trim() === "") {
            j++;
          }
          const allowed = i === 0 ? maxBOF : max;
          for (let k = i + allowed; k < j; k++) {
            report(k, allowed);
          }
          i = j;
        }
        const eofStart = lastContent + 1;
        for (let k = eofStart + maxEOF; k < real.length; k++) {
          report(k, maxEOF);
        }
      },
    };
  },
};

const trailingSpaces = {
  meta: /** @type {const} */ ({
    type: "layout",
    docs: { description: "disallow trailing whitespace in JSON files" },
    fixable: "whitespace",
    schema: [],
    messages: {
      unexpected: "Trailing spaces not allowed.",
    },
  }),
  create(context) {
    return {
      Document() {
        const text = context.sourceCode.text;
        if (!text) {
          return;
        }
        const lines = buildLines(text);
        for (const [index, line] of lines.entries()) {
          const trimmed = line.text.trimEnd();
          if (trimmed.length === line.text.length) {
            continue;
          }
          context.report({
            loc: {
              start: { line: index + 1, column: trimmed.length + 1 },
              end: { line: index + 1, column: line.text.length + 1 },
            },
            messageId: "unexpected",
            fix: fixer => fixer.removeRange([line.start + trimmed.length, line.end]),
          });
        }
      },
    };
  },
};

const eolLast = {
  meta: /** @type {const} */ ({
    type: "layout",
    docs: { description: "require a newline at the end of JSON files" },
    fixable: "whitespace",
    schema: [],
    messages: {
      missing: "Newline required at end of file but not found.",
    },
  }),
  create(context) {
    return {
      Document() {
        const text = context.sourceCode.text;
        if (!text || /[\r\n]$/.test(text)) {
          return;
        }
        const lines = buildLines(text);
        const last = lines.at(-1);
        context.report({
          loc: {
            start: { line: lines.length, column: Math.max(1, last.text.length) },
            end: { line: lines.length, column: last.text.length + 1 },
          },
          messageId: "missing",
          fix: fixer => fixer.insertTextAfterRange([text.length, text.length], "\n"),
        });
      },
    };
  },
};

const plugin = {
  meta: {
    name: "eslint-plugin-json-formatting",
    version: "0.0.1",
    namespace: "json-formatting",
  },
  rules: {
    "multiple-empty-lines": multipleEmptyLines,
    "trailing-spaces": trailingSpaces,
    "eol-last": eolLast,
  },
};

export default plugin;
