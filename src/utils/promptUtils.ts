// src/utils/promptUtils.ts

import promptSync from 'prompt-sync';

// Cria instância do prompt-sync com suporte a Ctrl+C (sigint: true)
export const input = promptSync({ sigint: true });