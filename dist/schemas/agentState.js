"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.universalAgentStateSchema = exports.actionNameSchema = void 0;
const zod_1 = require("zod");
exports.actionNameSchema = zod_1.z.enum([
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
]);
exports.universalAgentStateSchema = zod_1.z.object({
    agent: zod_1.z.object({
        id: zod_1.z.string().min(1),
        name: zod_1.z.string().min(1),
        archetype: zod_1.z.string().min(1),
        traits: zod_1.z.object({
            aggression: zod_1.z.number().min(0).max(1),
            caution: zod_1.z.number().min(0).max(1),
            greed: zod_1.z.number().min(0).max(1),
            curiosity: zod_1.z.number().min(0).max(1),
            loyalty: zod_1.z.number().min(0).max(1),
            panic: zod_1.z.number().min(0).max(1),
        }),
    }),
    body: zod_1.z.object({
        health: zod_1.z.number().min(0).max(100),
        stamina: zod_1.z.number().min(0).max(100),
        hunger: zod_1.z.number().min(0).max(100),
        thirst: zod_1.z.number().min(0).max(100),
        temperature: zod_1.z.number().min(0).max(100),
        bleeding: zod_1.z.boolean(),
        fatigue: zod_1.z.number().min(0).max(100),
    }),
    equipment: zod_1.z.object({
        weapons: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string().min(1),
            ammoLoaded: zod_1.z.number().int().min(0),
            reserveAmmo: zod_1.z.number().int().min(0),
            effectiveRange: zod_1.z.number().min(0),
        })),
        medical: zod_1.z.array(zod_1.z.string()),
        food: zod_1.z.array(zod_1.z.string()),
        tools: zod_1.z.array(zod_1.z.string()),
        clothing: zod_1.z.array(zod_1.z.string()),
    }),
    environment: zod_1.z.object({
        biome: zod_1.z.string(),
        weather: zod_1.z.string(),
        lightLevel: zod_1.z.string(),
        cover: zod_1.z.string(),
        visibility: zod_1.z.string(),
        noiseLevel: zod_1.z.string(),
    }),
    positionContext: zod_1.z.object({
        regionType: zod_1.z.string(),
        safetyRating: zod_1.z.number().min(0).max(1),
        pointsOfInterest: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            distance: zod_1.z.number().min(0),
            direction: zod_1.z.string(),
        })),
    }),
    perception: zod_1.z.object({
        entities: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            relation: zod_1.z.string(),
            distance: zod_1.z.number().min(0),
            direction: zod_1.z.string(),
            armed: zod_1.z.boolean(),
            count: zod_1.z.number().int().min(1),
            threatScore: zod_1.z.number().min(0).max(1),
        })),
        events: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            ageSeconds: zod_1.z.number().min(0),
            direction: zod_1.z.string(),
            intensity: zod_1.z.string(),
        })),
    }),
    memory: zod_1.z.object({
        shortTerm: zod_1.z.array(zod_1.z.string()),
        longTerm: zod_1.z.array(zod_1.z.string()),
    }),
    capabilities: zod_1.z.object({
        canMove: zod_1.z.boolean(),
        canLoot: zod_1.z.boolean(),
        canHeal: zod_1.z.boolean(),
        canUseWeapons: zod_1.z.boolean(),
        canHide: zod_1.z.boolean(),
        canInteract: zod_1.z.boolean(),
        canCraft: zod_1.z.boolean(),
    }),
    actionSpace: zod_1.z.array(exports.actionNameSchema).min(1),
    currentPlan: zod_1.z.object({
        intent: zod_1.z.string(),
        ageSeconds: zod_1.z.number().min(0),
        status: zod_1.z.string(),
    }),
});
