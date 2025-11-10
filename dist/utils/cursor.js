"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
function encodeCursor(c) {
    const json = JSON.stringify(c);
    return Buffer.from(json, 'utf8').toString('base64url');
}
function decodeCursor(cur) {
    if (!cur)
        return null;
    try {
        const json = Buffer.from(cur, 'base64url').toString('utf8');
        const obj = JSON.parse(json);
        if (typeof obj === 'object' &&
            typeof obj.score === 'number' &&
            typeof obj.id === 'string') {
            return obj;
        }
        return null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=cursor.js.map