import { homedir } from "node:os";
import { join } from "node:path";

export type StorageMode = "project" | "global";

export interface StoragePaths {
  plans: string;
  todos: string;
  tasks: string;
  memory: string;
}

export interface ResolveStorageOptions {
  storage: StorageMode;
  projectDirectory: string;
  paths?: {
    plans?: string;
    todos?: string;
    tasks?: string;
    memory?: string;
  };
}

export function resolveStoragePaths(options: ResolveStorageOptions): StoragePaths {
  const { storage, projectDirectory, paths = {} } = options;

  const baseDir = storage === "global"
    ? join(homedir(), ".config", "opencode")
    : join(projectDirectory, ".opencode");

  return {
    plans: paths.plans ?? join(baseDir, "plans"),
    todos: paths.todos ?? join(baseDir, "todos"),
    tasks: paths.tasks ?? join(baseDir, "tasks"),
    memory: paths.memory ?? join(baseDir, "memory"),
  };
}
