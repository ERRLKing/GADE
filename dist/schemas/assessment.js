"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentSchema = void 0;
const zod_1 = require("zod");
exports.assessmentSchema = zod_1.z.object({
    threatAssessment: zod_1.z.object({
        level: zod_1.z.enum(['none', 'low', 'medium', 'high', 'critical']),
        score: zod_1.z.number().min(0).max(1),
        primarySource: zod_1.z.string(),
    }),
    needAssessment: zod_1.z.object({
        food: zod_1.z.number().min(0).max(1),
        water: zod_1.z.number().min(0).max(1),
        medical: zod_1.z.number().min(0).max(1),
        rest: zod_1.z.number().min(0).max(1),
        warmth: zod_1.z.number().min(0).max(1),
    }),
    combatAssessment: zod_1.z.object({
        confidence: zod_1.z.number().min(0).max(1),
        recommendedStance: zod_1.z.enum(['avoid', 'observe', 'defensive', 'engage']),
    }),
});
