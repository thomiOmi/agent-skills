import { kebabCase } from "scule";

export function normalizeCommand(fileName: string): string {
  return `/${kebabCase(fileName.replace(/\.md$/i, ""))}`;
}

export function isValidSlug(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}
