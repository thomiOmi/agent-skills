export interface Subtask {
  id: string;
  description: string;
  suggestedAgent: string;
  dependencies: string[];
}

interface KeywordGroup {
  agent: string;
  keywords: string[];
}

// Whole-token keywords prevent substrings such as "build" (contains "ui") or
// "author" (contains "auth") from routing to the wrong specialist.
const KEYWORD_GROUPS: KeywordGroup[] = [
  { agent: "qa-engineer", keywords: ["test", "tests", "testing", "qa", "coverage"] },
  { agent: "devops", keywords: ["deploy", "deployment", "ci", "cd", "docker", "infra", "infrastructure"] },
  { agent: "marketing", keywords: ["seo", "content", "copy", "marketing"] },
  { agent: "ui-ux", keywords: ["ui", "ux", "design", "frontend", "accessibility"] },
  { agent: "security-auditor", keywords: ["security", "auth", "authentication", "vulnerability", "vulnerabilities", "owasp"] },
];

/**
 * Suggests a specialist agent from whole-word keywords in a subtask description.
 *
 * @param description - subtask text to classify
 * @returns agent name, defaulting to senior-developer when no keyword matches
 */
export function inferAgent(description: string): string {
  const tokens = new Set(description.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  for (const group of KEYWORD_GROUPS) {
    if (group.keywords.some(keyword => tokens.has(keyword))) {
      return group.agent;
    }
  }
  return "senior-developer";
}

/**
 * Splits a task into sequentially dependent subtasks with suggested agents.
 *
 * @param task - newline-separated subtask descriptions
 * @param _context - unused optional context retained for call-site compatibility
 * @returns subtasks with stable ids and dependencies on the preceding step
 */
export function decomposeTask(task: string, _context?: string): Subtask[] {
  const subtasks: Subtask[] = [];
  const lines = task.split("\n").filter(l => l.trim());

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const id = `step-${index + 1}`;
    subtasks.push({
      id,
      description: trimmed,
      suggestedAgent: inferAgent(trimmed),
      dependencies: index === 0 ? [] : [`step-${index}`],
    });
  });

  return subtasks;
}
