"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDir = ensureDir;
exports.loadJSON = loadJSON;
exports.saveJSON = saveJSON;
exports.sanitizeFileName = sanitizeFileName;
const fs = __importStar(require("fs")); // Importa o módulo "fs" (File System) do Node.js para operações com arquivos e diretórios.
// ==================================================
// Função: ensureDir
// Cria o diretório se ele não existir
// ==================================================
function ensureDir(dirPath) {
    // Verifica se o diretório já existe
    if (!fs.existsSync(dirPath)) {
        // Se não existir, cria o diretório e todos os subdiretórios necessários (recursive: true).
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
// ==================================================
// Função: loadJSON
// Lê um arquivo JSON e retorna um objeto tipado <T>.
// Caso o arquivo não exista ou dê erro, retorna um valor padrão (fallback).
// ==================================================
function loadJSON(filePath, fallback) {
    try {
        // Se o arquivo não existir, retorna o fallback (ex.: objeto vazio ou configuração padrão).
        if (!fs.existsSync(filePath))
            return fallback;
        // Lê o conteúdo do arquivo como string UTF-8.
        const rawData = fs.readFileSync(filePath, 'utf-8');
        // Converte de string JSON para objeto do tipo <T>.
        return JSON.parse(rawData);
    }
    catch (error) {
        // Em caso de erro (ex.: JSON inválido), mostra mensagem no console
        console.error(`[ERRO] Falha ao carregar ${filePath}:`, error);
        return fallback; // Garante que o programa continue funcionando.
    }
}
// ==================================================
// Função: saveJSON
// Salva um objeto em formato JSON em um arquivo.
// O arquivo será sobrescrito se já existir.
// ==================================================
function saveJSON(filePath, data) {
    try {
        // JSON.stringify(data, null, 4) → converte o objeto em string JSON "bonita"
        // null, 4 → formata com indentação de 4 espaços (melhor leitura humana).
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
    }
    catch (error) {
        console.error(`[ERRO] Falha ao salvar ${filePath}:`, error);
    }
}
// ==================================================
// Função: sanitizeFileName
// Limpa strings para uso como nomes de arquivo:
// - Remove acentos (ex.: "ação" → "acao")
// - Substitui caracteres especiais por "_"
// ==================================================
function sanitizeFileName(str) {
    return str
        // Normaliza a string para decompor acentos (ex.: "á" vira "a + ´")
        .normalize("NFD")
        // Remove os sinais diacríticos (acentos)
        .replace(/[\u0300-\u036f]/g, "")
        // Substitui qualquer caractere que não seja letra, número, _ ou - por "_"
        .replace(/[^a-zA-Z0-9_\-]/g, "_");
}
