interface TodoStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

export interface TodoInput {
  action: "add" | "complete" | "list";
  item?: string;
}

function storageKey(sessionID: string): string {
  return `todo:${sessionID}`;
}

async function getTodos(storage: TodoStorage, sessionID: string): Promise<string[]> {
  const raw = await storage.get(storageKey(sessionID));
  if (!raw) {
    return [];
  }
  try {
    return Array.isArray(raw) ? (raw as string[]) : [];
  }
  catch {
    return [];
  }
}

async function saveTodos(
  storage: TodoStorage,
  sessionID: string,
  todos: string[],
): Promise<void> {
  await storage.set(storageKey(sessionID), todos);
}

export async function handleTodo(
  input: TodoInput,
  storage: TodoStorage,
  sessionID: string,
): Promise<string> {
  const { action, item } = input;

  if (action === "list") {
    const todos = await getTodos(storage, sessionID);
    if (todos.length === 0) {
      return "No todos found.";
    }
    return todos
      .map((t, i) => `${i + 1}. [ ] ${t}`)
      .join("\n");
  }

  if (action === "add") {
    if (!item) {
      return "Todo add requires an item.";
    }
    const todos = await getTodos(storage, sessionID);
    todos.push(item);
    await saveTodos(storage, sessionID, todos);
    return `Todo added: ${item}`;
  }

  if (action === "complete") {
    if (!item) {
      return "Todo complete requires an item.";
    }
    const todos = await getTodos(storage, sessionID);
    const index = todos.findIndex(t => t === item);
    if (index === -1) {
      return `Todo not found: ${item}`;
    }
    todos.splice(index, 1);
    await saveTodos(storage, sessionID, todos);
    return `Todo completed: ${item}`;
  }

  return `Unknown todo action: ${action}`;
}
