"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.react = react;
function nearestThreat(state) {
    return [...state.perception.entities]
        .filter((e) => e.threatScore > 0.2)
        .sort((a, b) => a.distance - b.distance)[0];
}
function react(state, assessment) {
    const threat = nearestThreat(state);
    const highThreat = assessment.threatAssessment.level === 'critical' ||
        assessment.threatAssessment.level === 'high';
    const immediateThreat = threat && threat.distance <= 35;
    const veryCloseThreat = threat && threat.distance <= 12;
    if (highThreat || immediateThreat) {
        return {
            intent: 'AVOID_ENTITY',
            priority: 'safety',
            style: state.agent.traits.caution >= 0.7 ? 'very_cautious' : 'cautious',
            target: {
                type: threat?.type ?? 'threat',
                direction: 'away_from_target',
                preferredDistance: threat?.armed ? 120 : 60,
            },
            subgoals: ['break_line_of_sight', 'reach_cover', 'reduce_exposure'],
            constraints: ['do_not_stop_in_open', 'abort_if_surrounded'],
            durationSeconds: 8,
            reasoningSummary: 'Immediate danger requires a fast defensive reaction.',
        };
    }
    if (state.capabilities.canHeal &&
        (state.body.bleeding || state.body.health <= 35) &&
        assessment.threatAssessment.level !== 'high' &&
        assessment.threatAssessment.level !== 'critical') {
        return {
            intent: 'HEAL_SELF',
            priority: 'medical',
            style: 'urgent',
            target: {
                type: 'safe_cover',
                direction: 'nearest',
                distance: 10,
            },
            subgoals: ['reach_cover', 'stabilize', 'reassess'],
            constraints: ['heal_only_if_temporarily_safe'],
            durationSeconds: 6,
            reasoningSummary: 'Health condition requires immediate stabilization.',
        };
    }
    if (veryCloseThreat &&
        threat?.type === 'hostile_creature' &&
        state.capabilities.canUseWeapons &&
        state.equipment.weapons.length > 0 &&
        state.actionSpace.includes('ENGAGE_TARGET')) {
        return {
            intent: 'ENGAGE_TARGET',
            priority: 'survival',
            style: 'controlled',
            target: {
                type: threat.type,
                direction: threat.direction,
                distance: threat.distance,
            },
            subgoals: ['neutralize_immediate_threat', 'maintain_spacing'],
            constraints: ['disengage_if_multiple_targets_close'],
            durationSeconds: 5,
            reasoningSummary: 'A very close hostile must be handled immediately.',
        };
    }
    if (threat &&
        threat.distance <= 50 &&
        state.capabilities.canHide &&
        state.actionSpace.includes('HIDE')) {
        return {
            intent: 'HIDE',
            priority: 'safety',
            style: 'cautious',
            target: {
                type: 'cover',
                direction: 'nearest',
                preferredDistance: 12,
            },
            subgoals: ['break_visibility', 'hold_position_briefly', 'observe'],
            constraints: ['avoid_noise'],
            durationSeconds: 7,
            reasoningSummary: 'Short concealment is safer than immediate commitment.',
        };
    }
    return null;
}
