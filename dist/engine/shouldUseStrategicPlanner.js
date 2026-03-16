"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldUseStrategicPlanner = shouldUseStrategicPlanner;
function shouldUseStrategicPlanner(state, assessment) {
    if (process.env.ENGINE_MODE === 'deterministic') {
        return false;
    }
    if (assessment.threatAssessment.level === 'critical' ||
        assessment.threatAssessment.level === 'high') {
        return false;
    }
    if (state.body.bleeding || state.body.health <= 35) {
        return false;
    }
    if (state.currentPlan.status === 'none' ||
        state.currentPlan.status === 'completed' ||
        state.currentPlan.status === 'failed') {
        return true;
    }
    const minAgeSeconds = assessment.threatAssessment.level === 'medium' ? 12 : 25;
    return state.currentPlan.ageSeconds >= minAgeSeconds;
}
