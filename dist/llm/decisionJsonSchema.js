"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionJsonSchema = void 0;
exports.decisionJsonSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'intent',
        'priority',
        'style',
        'target',
        'subgoals',
        'constraints',
        'durationSeconds',
        'reasoningSummary',
    ],
    properties: {
        intent: {
            type: 'string',
            enum: [
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
            ],
        },
        priority: {
            type: 'string',
            enum: [
                'survival',
                'safety',
                'food',
                'water',
                'medical',
                'exploration',
                'combat',
                'social',
            ],
        },
        style: {
            type: 'string',
            enum: [
                'very_cautious',
                'cautious',
                'balanced',
                'aggressive',
                'desperate',
                'curious',
                'urgent',
                'controlled',
            ],
        },
        target: {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'direction'],
            properties: {
                type: { type: 'string' },
                direction: { type: 'string' },
                preferredDistance: { type: 'number' },
                distance: { type: 'number' },
            },
            anyOf: [
                { required: ['preferredDistance'] },
                { required: ['distance'] },
            ],
        },
        subgoals: {
            type: 'array',
            items: { type: 'string' },
        },
        constraints: {
            type: 'array',
            items: { type: 'string' },
        },
        durationSeconds: {
            type: 'number',
        },
        reasoningSummary: {
            type: 'string',
        },
    },
};
