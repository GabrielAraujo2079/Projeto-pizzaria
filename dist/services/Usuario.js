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
exports.usuarioService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const DataServices_js_1 = require("../services/DataServices.js");
const validators_js_1 = require("../utils/validators.js");
class UsuarioService {
    // Retorna cópia dos usuários para evitar mutação externa
    listarUsuarios() {
        return DataServices_js_1.dataService.getUsuarios();
    }
    // Busca por email (case-insensitive)
    buscarPorEmail(email) {
        return DataServices_js_1.dataService.findUsuarioByEmail(email);
    }
    // Cria novo usuário com validações
    criarUsuario(nome, senha, cpf, email, telefone, endereco, dataNascmto, tipo) {
        // Validações
        if (!nome || !senha || !cpf || !email || !telefone) {
            return { sucesso: false, mensagem: "Todos os campos são obrigatórios." };
        }
        if (!(0, validators_js_1.validarEmail)(email)) {
            return { sucesso: false, mensagem: "Email inválido." };
        }
        if (!(0, validators_js_1.validarCPF)(cpf)) {
            return { sucesso: false, mensagem: "CPF inválido." };
        }
        if (!(0, validators_js_1.validarDataBR)(dataNascmto)) {
            return { sucesso: false, mensagem: "Data de nascimento inválida ou futura." };
        }
        // Verifica duplicidade
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { sucesso: false, mensagem: "Email já cadastrado." };
        }
        if (usuarios.some(u => u.cpf === cpf)) {
            return { sucesso: false, mensagem: "CPF já cadastrado." };
        }
        // Define tipo: primeiro usuário = admin, ou por chave
        if (!tipo) {
            tipo = usuarios.length === 0 ? "admin" : "cliente";
        }
        // Hash da senha
        const senhaHash = bcrypt.hashSync(senha, 10);
        // Formata data para ISO (AAAA-MM-DD)
        const [dia, mes, ano] = dataNascmto.split("/");
        const dataISO = new Date(`${ano}-${mes}-${dia}`).toISOString().split("T")[0];
        // Monta objeto
        const novoUsuario = {
            nome,
            senha: senhaHash,
            cpf,
            email,
            telefone,
            endereco,
            tipo,
            dataNascmto: dataISO
        };
        // Salva
        usuarios.push(novoUsuario);
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário criado com sucesso!", usuario: novoUsuario };
    }
    // Login
    login(email, senha) {
        const usuario = this.buscarPorEmail(email);
        if (!usuario) {
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        }
        if (!bcrypt.compareSync(senha, usuario.senha)) {
            return { sucesso: false, mensagem: "Senha incorreta." };
        }
        return { sucesso: true, mensagem: `Bem-vindo, ${usuario.nome}!`, usuario };
    }
    // Atualiza dados do usuário (exceto senha por enquanto)
    atualizarUsuario(email, updates) {
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);
        if (index === -1) {
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        }
        const usuario = usuarios[index];
        // Se email for alterado, valida duplicidade
        if (updates.email !== undefined && updates.email !== usuario.email) {
            const emailLower = updates.email.toLowerCase();
            if (usuarios.some(u => u.email.toLowerCase() === emailLower)) {
                return { sucesso: false, mensagem: "Email já em uso." };
            }
        }
        // Atualiza campos
        usuarios[index] = {
            ...usuario,
            ...updates,
            endereco: updates.endereco ? { ...usuario.endereco, ...updates.endereco } : usuario.endereco
        };
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário atualizado com sucesso!", usuario: usuarios[index] };
    }
    // Remove usuário (apenas clientes, por segurança)
    removerUsuario(email, forcarAdmin = false) {
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);
        if (index === -1) {
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        }
        if (!forcarAdmin && usuarios[index].tipo === "admin") {
            return { sucesso: false, mensagem: "Não é permitido remover administradores por este método." };
        }
        usuarios.splice(index, 1);
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário removido com sucesso!" };
    }
    // Lista apenas clientes
    listarClientes() {
        return this.listarUsuarios().filter(u => u.tipo === "cliente");
    }
}
exports.usuarioService = new UsuarioService();
