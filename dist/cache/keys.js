"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREFIX = void 0;
exports.tokenKey = tokenKey;
exports.sortedKey = sortedKey;
exports.snapKey = snapKey;
exports.PREFIX = "tokens";
function tokenKey(address) {
    return `${exports.PREFIX}:token:${address}`;
}
function sortedKey(period, metric) {
    return `${exports.PREFIX}:zset:${period}:${metric}`;
}
function snapKey(address, period) {
    return `${exports.PREFIX}:snap:${address}:${period}`;
}
//# sourceMappingURL=keys.js.map