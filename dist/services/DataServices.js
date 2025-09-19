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
const path = __importStar(require("path"));
const fileUtils_js_1 = require("../utils/fileUtils.js");
const dataDir = path.join(process.cwd(), "data");
(0, fileUtils_js_1.ensureDir)(dataDir);
const paths = {
    usuarios: path.join(dataDir, "usuarios.json"),
    produtos: path.join(dataDir, "produtos.json"),
    pedidos: path.join(dataDir, "pedidos.json"),
};
class DataService {
    constructor() {
        this.usuarios = [];
        this.produtos = [];
        this.pedidos = [];
        this.usuarios = (0, fileUtils_js_1.loadJSON)(paths.usuarios, []);
        this.produtos = (0, fileUtils_js_1.loadJSON)(paths.produtos, []);
        this.pedidos = (0, fileUtils_js_1.loadJSON)(paths.pedidos, []);
    }
    // --- GETTERS ---
    getUsuarios() { return [...this.usuarios]; }
    getProdutos() { return [...this.produtos]; }
    getPedidos() { return [...this.pedidos]; }
    // --- SETTERS (com persistência automática) ---
    setUsuarios(usuarios) {
        this.usuarios = usuarios;
        (0, fileUtils_js_1.saveJSON)(paths.usuarios, usuarios);
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
    proximoIdProduto() {
        return this.produtos.length > 0 ? Math.max(...this.produtos.map(p => p.id)) + 1 : 1;
    }
    proximoIdPedido() {
        return this.pedidos.length > 0 ? Math.max(...this.pedidos.map(p => p.id)) + 1 : 1;
    }
    // --- Métodos auxiliares ---
    findUsuarioByEmail(email) {
        return this.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    findProdutoById(id) {
        return this.produtos.find(p => p.id === id);
    }
    findPedidoById(id) {
        return this.pedidos.find(p => p.id === id);
    }
}
exports.dataService = new DataService();
