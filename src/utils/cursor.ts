export type CursorPayload = { score: number; id: string };

export function encodeCursor(c: CursorPayload): string {
  const json = JSON.stringify(c);
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeCursor(cur?: string | null): CursorPayload | null {
  if (!cur) return null;
  try {
    const json = Buffer.from(cur, 'base64url').toString('utf8');
    const obj = JSON.parse(json);
    if (
      typeof obj === 'object' &&
      typeof obj.score === 'number' &&
      typeof obj.id === 'string'
    ) {
      return obj as CursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}
