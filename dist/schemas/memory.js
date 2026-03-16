"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflectResponseSchema = exports.reflectRequestSchema = void 0;
const zod_1 = require("zod");
exports.reflectRequestSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    events: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string().min(1),
        summary: zod_1.z.string().min(1).max(500),
        importance: zod_1.z.number().min(0).max(1).default(0.5),
    })).min(1),
});
exports.reflectResponseSchema = zod_1.z.object({
    ok: zod_1.z.boolean(),
    agentId: zod_1.z.string(),
    storedEvents: zod_1.z.number().int().min(0),
    longTermSummary: zod_1.z.array(zod_1.z.string()),
});
