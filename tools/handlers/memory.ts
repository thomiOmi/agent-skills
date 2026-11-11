interface MemoryStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  remove: (key: string) => Promise<void>;
  scan: (options: unknown) => Promise<unknown>;
}

export interface MemoryInput {
  action: "save" | "recall" | "forget" | "list" | "status" | "enable" | "disable" | "auto" | "purge";
  title?: string;
  summary?: string;
  detail?: string;
  created_by?: "user" | "agent";
  confirm?: boolean;
  auto?: "on" | "off";
}

interface MemoryEntry {
  title: string;
  summary: string;
  detail?: string;
  created_by: "user" | "agent";
  created_at: string;
  updated_at?: string;
}

interface MemoryConfig {
  enabled: boolean;
  auto: boolean;
}

function storageKey(sessionID: string, title: string): string {
  return `memory:${sessionID}:${title}`;
}

function configKey(sessionID: string): string {
  return `memory:config:${sessionID}`;
}

async function getMemoryEntry(
  storage: MemoryStorage,
  sessionID: string,
  title: string,
): Promise<MemoryEntry | undefined> {
  const raw = await storage.get(storageKey(sessionID, title));
  if (!raw) {
    return undefined;
  }
  try {
    return raw as MemoryEntry;
  }
  catch {
    return undefined;
  }
}

async function saveMemoryEntry(
  storage: MemoryStorage,
  sessionID: string,
  title: string,
  summary: string,
  detail: string | undefined,
  createdBy: "user" | "agent",
): Promise<void> {
  const existing = await getMemoryEntry(storage, sessionID, title);
  const now = new Date().toISOString();
  const entry: MemoryEntry = existing
    ? {
        ...existing,
        summary,
        detail: detail !== undefined ? detail : existing.detail,
        updated_at: now,
      }
    : { title, summary, detail, created_by: createdBy, created_at: now };
  await storage.set(storageKey(sessionID, title), entry);
}

async function removeMemoryEntry(
  storage: MemoryStorage,
  sessionID: string,
  title: string,
): Promise<boolean> {
  const exists = await getMemoryEntry(storage, sessionID, title);
  if (!exists) {
    return false;
  }
  await storage.remove(storageKey(sessionID, title));
  return true;
}

async function getMemoryConfig(
  storage: MemoryStorage,
  sessionID: string,
): Promise<MemoryConfig> {
  const raw = await storage.get(configKey(sessionID));
  if (!raw) {
    return { enabled: true, auto: false };
  }
  try {
    return raw as MemoryConfig;
  }
  catch {
    return { enabled: true, auto: false };
  }
}

async function saveMemoryConfig(
  storage: MemoryStorage,
  sessionID: string,
  config: MemoryConfig,
): Promise<void> {
  await storage.set(configKey(sessionID), config);
}

async function listMemoryEntries(
  storage: MemoryStorage,
  sessionID: string,
): Promise<MemoryEntry[]> {
  const raw = await storage.scan({ prefix: `memory:${sessionID}:` });
  const scanResult = raw as { keys?: string[]; values?: unknown[] };
  const entries: MemoryEntry[] = [];
  for (const value of scanResult.values || []) {
    try {
      entries.push(value as MemoryEntry);
    }
    catch {
      // skip invalid entries
    }
  }
  return entries.sort((a, b) =>
    (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at),
  );
}

async function purgeMemoryEntries(
  storage: MemoryStorage,
  sessionID: string,
): Promise<number> {
  const raw = await storage.scan({ prefix: `memory:${sessionID}:` });
  const scanResult = raw as { keys?: string[]; values?: unknown[] };
  let count = 0;
  for (const key of scanResult.keys || []) {
    await storage.remove(key);
    count++;
  }
  return count;
}

export async function handleMemory(
  input: MemoryInput,
  storage: MemoryStorage,
  sessionID: string,
): Promise<string> {
  const {
    action,
    title,
    summary,
    detail,
    created_by,
    confirm,
    auto,
  } = input;
  const creator = created_by ?? "agent";

  if (action === "save") {
    if (!title || !summary) {
      return "Memory save requires a title and summary.";
    }
    await saveMemoryEntry(storage, sessionID, title, summary, detail, creator);
    return `Memory saved: ${title}`;
  }

  if (action === "recall") {
    if (!title) {
      return "Memory recall requires a title.";
    }
    const val = await getMemoryEntry(storage, sessionID, title);
    if (!val) {
      return `Memory not found: ${title}`;
    }
    return val.summary;
  }

  if (action === "forget") {
    if (!title) {
      return "Memory forget requires a title.";
    }
    const deleted = await removeMemoryEntry(storage, sessionID, title);
    return deleted
      ? `Memory forgotten: ${title}`
      : `Memory not found: ${title}`;
  }

  if (action === "list") {
    const entries = await listMemoryEntries(storage, sessionID);
    if (entries.length === 0) {
      return "No memory entries found.";
    }
    return entries
      .map((e) => {
        const marker = e.created_by === "user" ? "[user]" : "[agent]";
        return `${marker} ${e.title}: ${e.summary}`;
      })
      .join("\n");
  }

  if (action === "status") {
    const config = await getMemoryConfig(storage, sessionID);
    const entries = await listMemoryEntries(storage, sessionID);
    return [
      `Memory status:`,
      `  enabled: ${config.enabled}`,
      `  auto: ${config.auto}`,
      `  entries: ${entries.length}`,
    ].join("\n");
  }

  if (action === "enable") {
    const config = await getMemoryConfig(storage, sessionID);
    config.enabled = true;
    await saveMemoryConfig(storage, sessionID, config);
    return "Memory enabled.";
  }

  if (action === "disable") {
    const config = await getMemoryConfig(storage, sessionID);
    config.enabled = false;
    await saveMemoryConfig(storage, sessionID, config);
    return "Memory disabled.";
  }

  if (action === "auto") {
    const config = await getMemoryConfig(storage, sessionID);
    config.auto = auto === "on";
    await saveMemoryConfig(storage, sessionID, config);
    return `Memory auto-save ${config.auto ? "on" : "off"}.`;
  }

  if (action === "purge") {
    if (!confirm) {
      return "Memory purge requires confirm: true.";
    }
    const count = await purgeMemoryEntries(storage, sessionID);
    return `Memory purged: ${count} entries removed.`;
  }

  return `Unknown memory action: ${action}`;
}
