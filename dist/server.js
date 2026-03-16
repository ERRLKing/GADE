"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const evaluate_1 = require("./routes/evaluate");
const react_1 = require("./routes/react");
const decide_1 = require("./routes/decide");
const reflect_1 = require("./routes/reflect");
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 8787);
const provider = process.env.LLM_PROVIDER || 'openai';
const resolvedBaseURL = provider === 'ollama'
    ? process.env.LLM_BASE_URL || 'http://127.0.0.1:11434/v1'
    : 'https://api.openai.com/v1';
console.log('[startup]', {
    port,
    engineMode: process.env.ENGINE_MODE || 'hybrid',
    provider,
    modelName: process.env.MODEL_NAME || '(missing)',
    baseURL: resolvedBaseURL,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    hasLlmApiKey: Boolean(process.env.LLM_API_KEY),
});
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        service: 'game-agent-decision-engine',
        mode: process.env.ENGINE_MODE || 'hybrid',
        provider,
        modelName: process.env.MODEL_NAME || '(missing)',
        baseURL: resolvedBaseURL,
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
        hasLlmApiKey: Boolean(process.env.LLM_API_KEY),
    });
});
app.use('/evaluate', evaluate_1.evaluateRouter);
app.use('/react', react_1.reactRouter);
app.use('/decide', decide_1.decideRouter);
app.use('/reflect', reflect_1.reflectRouter);
app.listen(port, () => {
    console.log(`game-agent-decision-engine listening on http://localhost:${port}`);
});
