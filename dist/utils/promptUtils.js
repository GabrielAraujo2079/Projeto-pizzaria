"use strict";
// src/utils/promptUtils.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = void 0;
const prompt_sync_1 = __importDefault(require("prompt-sync"));
// Cria instância do prompt-sync com suporte a Ctrl+C (sigint: true)
exports.input = (0, prompt_sync_1.default)({ sigint: true });
