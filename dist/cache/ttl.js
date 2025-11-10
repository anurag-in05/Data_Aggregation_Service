"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TTL = void 0;
exports.ttlSeconds = ttlSeconds;
exports.DEFAULT_TTL = 30;
function ttlSeconds(custom) {
    return custom && custom > 0 ? custom : exports.DEFAULT_TTL;
}
//# sourceMappingURL=ttl.js.map