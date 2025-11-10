export type CursorPayload = {
    score: number;
    id: string;
};
export declare function encodeCursor(c: CursorPayload): string;
export declare function decodeCursor(cur?: string | null): CursorPayload | null;
//# sourceMappingURL=cursor.d.ts.map