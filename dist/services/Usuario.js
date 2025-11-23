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
// Importa o tipo/interface Usuario definido nos modelos (garante tipagem forte no TypeScript).
const DataServices_js_1 = require("../services/DataServices.js");
// Serviço responsável por persistir dados (carregar/salvar JSON de usuários).
const validators_js_1 = require("../utils/validators.js");
// Funções auxiliares de validação (reaproveitamento, separação de responsabilidades).
// Classe principal que encapsula a lógica de gerenciamento de usuários.
class UsuarioService {
    // ==================================================
    // Lista usuários cadastrados
    // ==================================================
    listarUsuarios() {
        // Retorna lista de usuários (cópia da fonte de dados).
        return DataServices_js_1.dataService.getUsuarios();
    }
    // ==================================================
    // Busca usuário por email (case-insensitive)
    // ==================================================
    buscarPorEmail(email) {
        return DataServices_js_1.dataService.findUsuarioByEmail(email);
    }
    // ==================================================
    // Criação de usuário com validações e hash de senha
    // ==================================================
    criarUsuario(nome, senha, cpf, email, telefone, endereco, dataNascmto, tipo) {
        // --- Validações de campos obrigatórios
        if (!nome || !senha || !cpf || !email || !telefone) {
            return { sucesso: false, mensagem: "Todos os campos são obrigatórios." };
        }
        if (!(0, validators_js_1.validarEmail)(email))
            return { sucesso: false, mensagem: "Email inválido." };
        if (!(0, validators_js_1.validarCPF)(cpf))
            return { sucesso: false, mensagem: "CPF inválido." };
        if (!(0, validators_js_1.validarDataBR)(dataNascmto))
            return { sucesso: false, mensagem: "Data de nascimento inválida ou futura." };
        // --- Verifica duplicidade (email/CPF)
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { sucesso: false, mensagem: "Email já cadastrado." };
        }
        if (usuarios.some(u => u.cpf === cpf)) {
            return { sucesso: false, mensagem: "CPF já cadastrado." };
        }
        // --- Define tipo do usuário
        // Se não informado: o primeiro cadastrado é admin, os demais são clientes.
        if (!tipo) {
            tipo = usuarios.length === 0 ? "admin" : "cliente";
        }
        // --- Hash da senha (10 rounds de salt → seguro)
        const senhaHash = bcrypt.hashSync(senha, 10);
        // --- Converte data BR (dd/mm/aaaa) para formato ISO (aaaa-mm-dd)
        const [dia, mes, ano] = dataNascmto.split("/");
        const dataISO = new Date(`${ano}-${mes}-${dia}`).toISOString().split("T")[0];
        // --- Monta objeto do novo usuário
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
        // --- Salva na base de dados
        usuarios.push(novoUsuario);
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário criado com sucesso!", usuario: novoUsuario };
    }
    // ==================================================
    // Autenticação de usuário (login)
    // ==================================================
    login(email, senha) {
        const usuario = this.buscarPorEmail(email);
        if (!usuario)
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        // Verifica se a senha fornecida bate com o hash salvo
        if (!bcrypt.compareSync(senha, usuario.senha)) {
            return { sucesso: false, mensagem: "Senha incorreta." };
        }
        return { sucesso: true, mensagem: `Bem-vindo, ${usuario.nome}!`, usuario };
    }
    // ==================================================
    // Atualização parcial do usuário (exceto senha/tipo/data de nascimento)
    // ==================================================
    atualizarUsuario(email, updates) {
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);
        if (index === -1)
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        const usuario = usuarios[index];
        // Se email for alterado, valida duplicidade
        if (updates.email !== undefined && updates.email !== usuario.email) {
            const emailLower = updates.email.toLowerCase();
            if (usuarios.some(u => u.email.toLowerCase() === emailLower)) {
                return { sucesso: false, mensagem: "Email já em uso." };
            }
        }
        // Mescla os dados antigos com os novos
        usuarios[index] = {
            ...usuario,
            ...updates,
            endereco: updates.endereco ? { ...usuario.endereco, ...updates.endereco } : usuario.endereco
        };
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário atualizado com sucesso!", usuario: usuarios[index] };
    }
    // ==================================================
    // Remoção de usuário (bloqueia admins, a menos que seja forçado)
    // ==================================================
    removerUsuario(email, forcarAdmin = false) {
        const usuarios = DataServices_js_1.dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);
        if (index === -1)
            return { sucesso: false, mensagem: "Usuário não encontrado." };
        // Protege administradores de exclusão acidental
        if (!forcarAdmin && usuarios[index].tipo === "admin") {
            return { sucesso: false, mensagem: "Não é permitido remover administradores por este método." };
        }
        usuarios.splice(index, 1);
        DataServices_js_1.dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário removido com sucesso!" };
    }
    // ==================================================
    // Lista apenas os clientes
    // ==================================================
    listarClientes() {
        return this.listarUsuarios().filter(u => u.tipo === "cliente");
    }
}
// Instância única (singleton) para ser usada em toda aplicação
exports.usuarioService = new UsuarioService();
