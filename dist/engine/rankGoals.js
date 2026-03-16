"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankGoals = rankGoals;
function rankGoals(goals) {
    return [...goals].sort((a, b) => b.priority - a.priority);
}
