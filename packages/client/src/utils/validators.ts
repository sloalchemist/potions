/**
 * Parses a name to ensure it fits on screen. The name must be less than
 * or equal to 10 characters and not empty. Whitespaces are trimmed.
 * @param name - The name to parse
 * @returns The parsed name if valid or null otherwise
 */
export function parseName(name: string): string | null {
  const trimmedName = name.trim();
  if (trimmedName.length > 0 && trimmedName.length <= 10) {
    return trimmedName;
  }
  return null;
}
