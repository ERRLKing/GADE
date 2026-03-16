"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpretState = interpretState;
const scoreNeeds_1 = require("./scoreNeeds");
const scoreThreat_1 = require("./scoreThreat");
const scoreCombat_1 = require("./scoreCombat");
function interpretState(state) {
    const threatAssessment = (0, scoreThreat_1.scoreThreat)(state);
    const needAssessment = (0, scoreNeeds_1.scoreNeeds)(state);
    const combatAssessment = (0, scoreCombat_1.scoreCombat)(state, threatAssessment.score);
    return {
        threatAssessment,
        needAssessment,
        combatAssessment,
    };
}
