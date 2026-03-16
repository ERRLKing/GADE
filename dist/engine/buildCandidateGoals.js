"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCandidateGoals = buildCandidateGoals;
function buildCandidateGoals(state, assessment) {
    const goals = [];
    const { needAssessment, threatAssessment, combatAssessment } = assessment;
    if (threatAssessment.level === 'critical' || threatAssessment.level === 'high') {
        goals.push({ intent: 'RETREAT', priority: 0.98, reason: 'Threat level is elevated.' });
        goals.push({ intent: 'AVOID_ENTITY', priority: 0.92, reason: 'Breaking contact improves survival.' });
    }
    if (needAssessment.medical >= 0.55 && state.capabilities.canHeal && state.actionSpace.includes('HEAL_SELF')) {
        goals.push({ intent: 'HEAL_SELF', priority: 0.94, reason: 'Medical condition requires attention.' });
    }
    if (needAssessment.food >= 0.7) {
        goals.push({ intent: 'SEARCH_FOR_FOOD', priority: 0.85, reason: 'Food need is urgent.' });
    }
    if (needAssessment.water >= 0.7) {
        goals.push({ intent: 'SEARCH_FOR_WATER', priority: 0.84, reason: 'Water need is urgent.' });
    }
    if (combatAssessment.recommendedStance === 'engage' && state.actionSpace.includes('ENGAGE_TARGET')) {
        goals.push({ intent: 'ENGAGE_TARGET', priority: 0.6, reason: 'Agent has decent combat confidence.' });
    }
    if (state.actionSpace.includes('LOOT_NEARBY_STRUCTURE')) {
        goals.push({ intent: 'LOOT_NEARBY_STRUCTURE', priority: 0.5, reason: 'Scavenging can improve survivability.' });
    }
    if (state.actionSpace.includes('OBSERVE_AREA')) {
        goals.push({ intent: 'OBSERVE_AREA', priority: 0.35, reason: 'Observation helps clarify risk.' });
    }
    if (state.actionSpace.includes('MOVE_TO_POINT')) {
        goals.push({ intent: 'MOVE_TO_POINT', priority: 0.25, reason: 'Movement maintains exploration momentum.' });
    }
    return goals;
}
