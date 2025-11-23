import * as bcrypt from "bcrypt"; 
// bcrypt → biblioteca para hashing de senhas (garante que senhas não fiquem em texto puro).

import { Usuario } from "../models/index.js"; 
// Importa o tipo/interface Usuario definido nos modelos (garante tipagem forte no TypeScript).

import { dataService } from "../services/DataServices.js"; 
// Serviço responsável por persistir dados (carregar/salvar JSON de usuários).

import { validarEmail, validarCPF, validarDataBR } from "../utils/validators.js"; 
// Funções auxiliares de validação (reaproveitamento, separação de responsabilidades).


// Classe principal que encapsula a lógica de gerenciamento de usuários.
class UsuarioService {
    // ==================================================
    // Lista usuários cadastrados
    // ==================================================
    listarUsuarios(): Usuario[] {
        // Retorna lista de usuários (cópia da fonte de dados).
        return dataService.getUsuarios();
    }

    // ==================================================
    // Busca usuário por email (case-insensitive)
    // ==================================================
    buscarPorEmail(email: string): Usuario | undefined {
        return dataService.findUsuarioByEmail(email);
    }

    // ==================================================
    // Criação de usuário com validações e hash de senha
    // ==================================================
    criarUsuario(
        nome: string,
        senha: string,
        cpf: string,
        email: string,
        telefone: string,
        endereco: Usuario['endereco'],
        dataNascmto: string,
        tipo?: "admin" | "cliente"
    ): { sucesso: boolean; mensagem: string; usuario?: Usuario } {

        // --- Validações de campos obrigatórios
        if (!nome || !senha || !cpf || !email || !telefone) {
            return { sucesso: false, mensagem: "Todos os campos são obrigatórios." };
        }

        if (!validarEmail(email)) return { sucesso: false, mensagem: "Email inválido." };
        if (!validarCPF(cpf)) return { sucesso: false, mensagem: "CPF inválido." };
        if (!validarDataBR(dataNascmto)) return { sucesso: false, mensagem: "Data de nascimento inválida ou futura." };

        // --- Verifica duplicidade (email/CPF)
        const usuarios = dataService.getUsuarios();
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
        const novoUsuario: Usuario = {
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
        dataService.setUsuarios(usuarios);

        return { sucesso: true, mensagem: "Usuário criado com sucesso!", usuario: novoUsuario };
    }

    // ==================================================
    // Autenticação de usuário (login)
    // ==================================================
    login(email: string, senha: string): { sucesso: boolean; mensagem: string; usuario?: Usuario } {
        const usuario = this.buscarPorEmail(email);
        if (!usuario) return { sucesso: false, mensagem: "Usuário não encontrado." };

        // Verifica se a senha fornecida bate com o hash salvo
        if (!bcrypt.compareSync(senha, usuario.senha)) {
            return { sucesso: false, mensagem: "Senha incorreta." };
        }

        return { sucesso: true, mensagem: `Bem-vindo, ${usuario.nome}!`, usuario };
    }

    // ==================================================
    // Atualização parcial do usuário (exceto senha/tipo/data de nascimento)
    // ==================================================
    atualizarUsuario(
        email: string,
        updates: Partial<Omit<Usuario, 'senha' | 'tipo' | 'dataNascmto'>>
    ): { sucesso: boolean; mensagem: string; usuario?: Usuario } {

        const usuarios = dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);

        if (index === -1) return { sucesso: false, mensagem: "Usuário não encontrado." };

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

        dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário atualizado com sucesso!", usuario: usuarios[index] };
    }

    // ==================================================
    // Remoção de usuário (bloqueia admins, a menos que seja forçado)
    // ==================================================
    removerUsuario(email: string, forcarAdmin = false): { sucesso: boolean; mensagem: string } {
        const usuarios = dataService.getUsuarios();
        const index = usuarios.findIndex(u => u.email === email);

        if (index === -1) return { sucesso: false, mensagem: "Usuário não encontrado." };

        // Protege administradores de exclusão acidental
        if (!forcarAdmin && usuarios[index].tipo === "admin") {
            return { sucesso: false, mensagem: "Não é permitido remover administradores por este método." };
        }

        usuarios.splice(index, 1);
        dataService.setUsuarios(usuarios);
        return { sucesso: true, mensagem: "Usuário removido com sucesso!" };
    }

    // ==================================================
    // Lista apenas os clientes
    // ==================================================
    listarClientes(): Usuario[] {
        return this.listarUsuarios().filter(u => u.tipo === "cliente");
    }
}

// Instância única (singleton) para ser usada em toda aplicação
export const usuarioService = new UsuarioService();
