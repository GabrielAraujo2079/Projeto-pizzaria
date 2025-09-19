import * as fs from "fs";    // Importa o módulo "fs" (File System) do Node.js para operações com arquivos e diretórios.
import * as path from "path"; // Importa "path" para manipular caminhos de forma segura (evita problemas de / vs \ em Windows/Linux).

// ==================================================
// Função: ensureDir
// Cria o diretório se ele não existir
// ==================================================
export function ensureDir(dirPath: string): void {
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
export function loadJSON<T>(filePath: string, fallback: T): T {
    try {
        // Se o arquivo não existir, retorna o fallback (ex.: objeto vazio ou configuração padrão).
        if (!fs.existsSync(filePath)) return fallback;

        // Lê o conteúdo do arquivo como string UTF-8.
        const rawData = fs.readFileSync(filePath, 'utf-8');

        // Converte de string JSON para objeto do tipo <T>.
        return JSON.parse(rawData) as T;
    } catch (error) {
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
export function saveJSON(filePath: string, data: any): void {
    try {
        // JSON.stringify(data, null, 4) → converte o objeto em string JSON "bonita"
        // null, 4 → formata com indentação de 4 espaços (melhor leitura humana).
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error(`[ERRO] Falha ao salvar ${filePath}:`, error);
    }
}

// ==================================================
// Função: sanitizeFileName
// Limpa strings para uso como nomes de arquivo:
// - Remove acentos (ex.: "ação" → "acao")
// - Substitui caracteres especiais por "_"
// ==================================================
export function sanitizeFileName(str: string): string {
    return str
        // Normaliza a string para decompor acentos (ex.: "á" vira "a + ´")
        .normalize("NFD")
        // Remove os sinais diacríticos (acentos)
        .replace(/[\u0300-\u036f]/g, "")
        // Substitui qualquer caractere que não seja letra, número, _ ou - por "_"
        .replace(/[^a-zA-Z0-9_\-]/g, "_");
}
