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
exports.dataService = void 0;
// Importa o módulo "path" do Node.js, usado para manipular caminhos de arquivos e pastas
const path = __importStar(require("path"));
// Importa funções utilitárias para manipulação de arquivos JSON e diretórios
const fileUtils_js_1 = require("../utils/fileUtils.js");
// Define o diretório principal de armazenamento dos arquivos de dados
const dataDir = path.join(process.cwd(), "data");
// process.cwd() retorna o diretório onde a aplicação está sendo executada
(0, fileUtils_js_1.ensureDir)(dataDir); // Garante que a pasta "data" exista (se não existir, cria)
// Define os caminhos completos dos arquivos JSON que armazenam os dados
const paths = {
    usuarios: path.join(dataDir, "usuarios.json"),
    produtos: path.join(dataDir, "produtos.json"),
    pedidos: path.join(dataDir, "pedidos.json"),
};
// Classe responsável por gerenciar os dados da aplicação (persistência em JSON)
class DataService {
    // Construtor é chamado ao criar a instância
    constructor() {
        // Listas internas que representam os dados carregados da base
        this.usuarios = [];
        this.produtos = [];
        this.pedidos = [];
        // Carrega os dados de cada arquivo JSON
        // Se o arquivo não existir, retorna um array vazio (fallback padrão)
        this.usuarios = (0, fileUtils_js_1.loadJSON)(paths.usuarios, []);
        this.produtos = (0, fileUtils_js_1.loadJSON)(paths.produtos, []);
        this.pedidos = (0, fileUtils_js_1.loadJSON)(paths.pedidos, []);
    }
    // --- GETTERS ---
    // Métodos que retornam cópias dos dados (não a referência direta, para evitar alterações externas indesejadas)
    getUsuarios() { return [...this.usuarios]; }
    getProdutos() { return [...this.produtos]; }
    getPedidos() { return [...this.pedidos]; }
    // --- SETTERS ---
    // Atualizam os dados em memória e salvam automaticamente no respectivo arquivo JSON
    setUsuarios(usuarios) {
        this.usuarios = usuarios;
        (0, fileUtils_js_1.saveJSON)(paths.usuarios, usuarios); // Persiste no arquivo
    }
    setProdutos(produtos) {
        this.produtos = produtos;
        (0, fileUtils_js_1.saveJSON)(paths.produtos, produtos);
    }
    setPedidos(pedidos) {
        this.pedidos = pedidos;
        (0, fileUtils_js_1.saveJSON)(paths.pedidos, pedidos);
    }
    // --- Geradores de ID ---
    // Cria IDs automáticos para produtos (incrementando o maior ID atual)
    proximoIdProduto() {
        return this.produtos.length > 0
            ? Math.max(...this.produtos.map(p => p.id)) + 1
            : 1;
    }
    // Cria IDs automáticos para pedidos
    proximoIdPedido() {
        return this.pedidos.length > 0
            ? Math.max(...this.pedidos.map(p => p.id)) + 1
            : 1;
    }
    // --- Métodos auxiliares de busca ---
    // Localiza um usuário pelo e-mail (ignora maiúsculas/minúsculas)
    findUsuarioByEmail(email) {
        return this.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    // Localiza um produto pelo seu ID
    findProdutoById(id) {
        return this.produtos.find(p => p.id === id);
    }
    // Localiza um pedido pelo seu ID
    findPedidoById(id) {
        return this.pedidos.find(p => p.id === id);
    }
}
// Exporta uma instância única (singleton) do serviço de dados
// Assim, toda a aplicação compartilha a mesma fonte de dados centralizada
exports.dataService = new DataService();
