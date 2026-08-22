export interface Subtask {
  id: string
  description: string
  suggestedAgent: string
  dependencies: string[]
}

export function inferAgent(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("test") || lower.includes("qa") || lower.includes("coverage")) return "qa-engineer";
  if (
    lower.includes("deploy")
    || lower.includes("ci")
    || lower.includes("cd")
    || lower.includes("docker")
    || lower.includes("infra")
  )
    return "devops";
  if (lower.includes("seo") || lower.includes("content") || lower.includes("copy") || lower.includes("marketing"))
    return "marketing";
  if (
    lower.includes("ui")
    || lower.includes("ux")
    || lower.includes("design")
    || lower.includes("frontend")
    || lower.includes("accessibility")
  )
    return "ui-ux";
  if (
    lower.includes("security")
    || lower.includes("auth")
    || lower.includes("vulnerability")
    || lower.includes("owasp")
  )
    return "security-auditor";
  return "senior-developer";
}

export function decomposeTask(task: string, _context?: string): Subtask[] {
  const subtasks: Subtask[] = [];
  const lines = task.split("\n").filter(l => l.trim());

  let currentId = "step-1";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    subtasks.push({
      id: currentId,
      description: trimmed,
      suggestedAgent: inferAgent(trimmed),
      dependencies: currentId === "step-1" ? [] : [String(Number(currentId.split("-")[1]) - 1)],
    });

    const num = Number(currentId.split("-")[1]) + 1;
    currentId = `step-${num}`;
  }

  return subtasks;
}
