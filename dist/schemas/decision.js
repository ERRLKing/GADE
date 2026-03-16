"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionSchema = void 0;
const zod_1 = require("zod");
exports.decisionSchema = zod_1.z.object({
    intent: zod_1.z.enum([
        'MOVE_TO_POINT',
        'LOOT_NEARBY_STRUCTURE',
        'HIDE',
        'AVOID_ENTITY',
        'ENGAGE_TARGET',
        'HEAL_SELF',
        'SEARCH_FOR_FOOD',
        'SEARCH_FOR_WATER',
        'OBSERVE_AREA',
        'RETREAT',
        'INTERACT',
        'CRAFT',
    ]),
    priority: zod_1.z.enum(['survival', 'safety', 'food', 'water', 'medical', 'exploration', 'combat', 'social']),
    style: zod_1.z.string().min(1).max(50),
    target: zod_1.z.object({
        type: zod_1.z.string().min(1),
        direction: zod_1.z.string().min(1),
        preferredDistance: zod_1.z.number().min(0).max(10000).optional(),
        distance: zod_1.z.number().min(0).max(10000).optional(),
    }),
    subgoals: zod_1.z.array(zod_1.z.string()).max(8),
    constraints: zod_1.z.array(zod_1.z.string()).max(8),
    durationSeconds: zod_1.z.number().int().min(5).max(600),
    reasoningSummary: zod_1.z.string().min(1).max(600),
});
