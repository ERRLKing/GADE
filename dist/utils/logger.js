"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logError = logError;
function logInfo(message, meta) {
    console.log('[engine]', message, meta ?? '');
}
function logError(message, meta) {
    console.error('[engine][error]', message, meta ?? '');
}
