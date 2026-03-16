"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDecisionPrompt = buildDecisionPrompt;
const decisionJsonSchema_1 = require("./decisionJsonSchema");
function buildDecisionPrompt(state, assessment) {
    return `
    You are a survival-agent planner.

    Return ONLY valid JSON.
    Do not include markdown.
    Do not include explanations outside the JSON object.

    Use ONLY these allowed values:

    priority:
    - survival
    - safety
    - food
    - water
    - medical
    - exploration
    - combat
    - social

    style:
    - very_cautious
    - cautious
    - balanced
    - aggressive
    - desperate
    - curious
    - urgent
    - controlled

    intent:
    - MOVE_TO_POINT
    - LOOT_NEARBY_STRUCTURE
    - HIDE
    - AVOID_ENTITY
    - ENGAGE_TARGET
    - HEAL_SELF
    - SEARCH_FOR_FOOD
    - SEARCH_FOR_WATER
    - OBSERVE_AREA
    - RETREAT

    The "target" object MUST use exactly these keys:
    - type
    - direction
    - preferredDistance OR distance

    Use preferredDistance for spacing/avoidance/hiding behaviors.
    Use distance for movement, looting, healing, observation, or direct engagement.

    JSON Schema:
    ${JSON.stringify(decisionJsonSchema_1.decisionJsonSchema, null, 2)}

    State:
    ${JSON.stringify({ state, assessment }, null, 2)}
    `.trim();
}
