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
exports.Interface = void 0;
const readline = __importStar(require("readline"));
const app_1 = require("./app");
const models_1 = require("./models");
class Interface {
    constructor(config) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.app = new app_1.PizzariaApp(config);
    }
    async iniciar() {
        try {
            await this.app.inicializar();
            console.log('Bem-vindo ao Sistema da Pizzaria!');
            await this.mostrarMenuPrincipal();
        }
        catch (error) {
            console.error('Erro ao iniciar o sistema:', error);
        }
    }
    async mostrarMenuPrincipal() {
        while (true) {
            console.log('\n=== Menu Principal ===');
            console.log('1. Gerenciar Usuários');
            console.log('2. Gerenciar Produtos');
            console.log('3. Gerenciar Pedidos');
            console.log('4. Gerenciar Promoções');
            console.log('5. Relatórios');
            console.log('0. Sair');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.menuUsuarios();
                    break;
                case '2':
                    await this.menuProdutos();
                    break;
                case '3':
                    await this.menuPedidos();
                    break;
                case '4':
                    await this.menuPromocoes();
                    break;
                case '5':
                    await this.menuRelatorios();
                    break;
                case '0':
                    console.log('Saindo do sistema...');
                    this.rl.close();
                    process.exit(0);
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    async menuUsuarios() {
        while (true) {
            console.log('\n=== Gerenciar Usuários ===');
            console.log('1. Cadastrar Usuário');
            console.log('2. Listar Usuários');
            console.log('3. Buscar Usuário');
            console.log('4. Atualizar Usuário');
            console.log('5. Excluir Usuário');
            console.log('0. Voltar');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.cadastrarUsuario();
                    break;
                case '2':
                    await this.listarUsuarios();
                    break;
                case '3':
                    await this.buscarUsuario();
                    break;
                case '4':
                    await this.atualizarUsuario();
                    break;
                case '5':
                    await this.excluirUsuario();
                    break;
                case '0':
                    return;
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    async menuProdutos() {
        while (true) {
            console.log('\n=== Gerenciar Produtos ===');
            console.log('1. Cadastrar Produto');
            console.log('2. Listar Produtos');
            console.log('3. Buscar Produto');
            console.log('4. Atualizar Produto');
            console.log('5. Excluir Produto');
            console.log('0. Voltar');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.cadastrarProduto();
                    break;
                case '2':
                    await this.listarProdutos();
                    break;
                case '3':
                    await this.buscarProduto();
                    break;
                case '4':
                    await this.atualizarProduto();
                    break;
                case '5':
                    await this.excluirProduto();
                    break;
                case '0':
                    return;
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    async menuPedidos() {
        while (true) {
            console.log('\n=== Gerenciar Pedidos ===');
            console.log('1. Criar Pedido');
            console.log('2. Listar Pedidos');
            console.log('3. Buscar Pedido');
            console.log('4. Atualizar Status do Pedido');
            console.log('5. Cancelar Pedido');
            console.log('0. Voltar');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.criarPedido();
                    break;
                case '2':
                    await this.listarPedidos();
                    break;
                case '3':
                    await this.buscarPedido();
                    break;
                case '4':
                    await this.atualizarStatusPedido();
                    break;
                case '5':
                    await this.cancelarPedido();
                    break;
                case '0':
                    return;
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    async menuPromocoes() {
        while (true) {
            console.log('\n=== Gerenciar Promoções ===');
            console.log('1. Criar Promoção');
            console.log('2. Listar Promoções');
            console.log('3. Buscar Promoção');
            console.log('4. Atualizar Promoção');
            console.log('5. Excluir Promoção');
            console.log('0. Voltar');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.criarPromocao();
                    break;
                case '2':
                    await this.listarPromocoes();
                    break;
                case '3':
                    await this.buscarPromocao();
                    break;
                case '4':
                    await this.atualizarPromocao();
                    break;
                case '5':
                    await this.excluirPromocao();
                    break;
                case '0':
                    return;
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    async menuRelatorios() {
        while (true) {
            console.log('\n=== Relatórios ===');
            console.log('1. Relatório de Vendas');
            console.log('2. Emitir Nota Fiscal');
            console.log('0. Voltar');
            const opcao = await this.perguntar('Escolha uma opção: ');
            switch (opcao) {
                case '1':
                    await this.gerarRelatorioVendas();
                    break;
                case '2':
                    await this.emitirNotaFiscal();
                    break;
                case '0':
                    return;
                default:
                    console.log('Opção inválida!');
            }
        }
    }
    // Implementações das funcionalidades de Usuário
    async cadastrarUsuario() {
        console.log('\n=== Cadastrar Usuário ===');
        const nome = await this.perguntar('Nome: ');
        const email = await this.perguntar('Email: ');
        const senha = await this.perguntar('Senha: ');
        const cpf = await this.perguntar('CPF: ');
        const telefone = await this.perguntar('Telefone: ');
        const dataNascimento = await this.perguntar('Data de Nascimento (YYYY-MM-DD): ');
        // Endereço
        console.log('\nEndereço:');
        const rua = await this.perguntar('Rua: ');
        const numero = await this.perguntar('Número: ');
        const bairro = await this.perguntar('Bairro: ');
        const cidade = await this.perguntar('Cidade: ');
        const estado = await this.perguntar('Estado (UF): ');
        const cep = await this.perguntar('CEP: ');
        const complemento = await this.perguntar('Complemento (opcional): ');
        const endereco = new models_1.Endereco(0, // ID será gerado pelo banco
        rua, numero, bairro, complemento || '', cidade, estado, cep);
        // Observação: a ordem de parâmetros em Usuario é (id?, nome, email, senha, cpf, telefone, tipo, dataNascimento, endereco...)
        const usuario = new models_1.Usuario(0, // ID será gerado pelo banco
        nome, email, senha, cpf, telefone, 'cliente', // tipo padrão
        new Date(dataNascimento), endereco);
        try {
            const novoUsuario = await this.app.cadastrarUsuario(usuario);
            console.log('\nUsuário cadastrado com sucesso!');
            console.log('ID:', novoUsuario.id);
        }
        catch (error) {
            console.error('\nErro ao cadastrar usuário:', error);
        }
    }
    async listarUsuarios() {
        try {
            const usuarios = await this.app.listarUsuarios();
            console.log('\n=== Lista de Usuários ===');
            usuarios.forEach(usuario => {
                console.log(`\nID: ${usuario.id}`);
                console.log(`Nome: ${usuario.nome}`);
                console.log(`Email: ${usuario.email}`);
                console.log(`CPF: ${usuario.cpf}`);
                console.log(`Telefone: ${usuario.telefone}`);
                console.log(`Tipo: ${usuario.tipo}`);
                if (usuario.endereco) {
                    console.log('Endereço:');
                    console.log(`  ${usuario.endereco.rua}, ${usuario.endereco.numero}`);
                    console.log(`  ${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}`);
                    console.log(`  CEP: ${usuario.endereco.cep}`);
                }
                console.log('------------------------');
            });
        }
        catch (error) {
            console.error('\nErro ao listar usuários:', error);
        }
    }
    async buscarUsuario() {
        const id = Number(await this.perguntar('ID do usuário: '));
        try {
            const usuario = await this.app.buscarUsuario(id);
            if (usuario) {
                console.log('\n=== Dados do Usuário ===');
                console.log(`ID: ${usuario.id}`);
                console.log(`Nome: ${usuario.nome}`);
                console.log(`Email: ${usuario.email}`);
                console.log(`CPF: ${usuario.cpf}`);
                console.log(`Telefone: ${usuario.telefone}`);
                console.log(`Tipo: ${usuario.tipo}`);
                if (usuario.endereco) {
                    console.log('Endereço:');
                    console.log(`  ${usuario.endereco.rua}, ${usuario.endereco.numero}`);
                    console.log(`  ${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}`);
                    console.log(`  CEP: ${usuario.endereco.cep}`);
                }
            }
            else {
                console.log('\nUsuário não encontrado.');
            }
        }
        catch (error) {
            console.error('\nErro ao buscar usuário:', error);
        }
    }
    // Stubs / implementações mínimas para evitar erros no menu
    async atualizarUsuario() {
        console.log('\nFuncionalidade de atualizar usuário ainda não implementada no menu interativo.');
    }
    async excluirUsuario() {
        console.log('\nFuncionalidade de excluir usuário ainda não implementada no menu interativo.');
    }
    async cadastrarProduto() {
        console.log('\nFuncionalidade de cadastrar produto ainda não implementada.');
    }
    async listarProdutos() {
        console.log('\nFuncionalidade de listar produtos ainda não implementada.');
    }
    async buscarProduto() {
        console.log('\nFuncionalidade de buscar produto ainda não implementada.');
    }
    async atualizarProduto() {
        console.log('\nFuncionalidade de atualizar produto ainda não implementada.');
    }
    async excluirProduto() {
        console.log('\nFuncionalidade de excluir produto ainda não implementada.');
    }
    async criarPedido() {
        console.log('\nFuncionalidade de criar pedido ainda não implementada.');
    }
    async listarPedidos() {
        console.log('\nFuncionalidade de listar pedidos ainda não implementada.');
    }
    async buscarPedido() {
        console.log('\nFuncionalidade de buscar pedido ainda não implementada.');
    }
    async atualizarStatusPedido() {
        console.log('\nFuncionalidade de atualizar status do pedido ainda não implementada.');
    }
    async cancelarPedido() {
        console.log('\nFuncionalidade de cancelar pedido ainda não implementada.');
    }
    async criarPromocao() {
        console.log('\nFuncionalidade de criar promoção ainda não implementada.');
    }
    async listarPromocoes() {
        console.log('\nFuncionalidade de listar promoções ainda não implementada.');
    }
    async buscarPromocao() {
        console.log('\nFuncionalidade de buscar promoção ainda não implementada.');
    }
    async atualizarPromocao() {
        console.log('\nFuncionalidade de atualizar promoção ainda não implementada.');
    }
    async excluirPromocao() {
        console.log('\nFuncionalidade de excluir promoção ainda não implementada.');
    }
    async gerarRelatorioVendas() {
        console.log('\nFuncionalidade de gerar relatório ainda não implementada.');
    }
    async emitirNotaFiscal() {
        console.log('\nFuncionalidade de emitir nota fiscal ainda não implementada.');
    }
    // Helper para fazer perguntas ao usuário
    perguntar(pergunta) {
        return new Promise((resolve) => {
            this.rl.question(pergunta, (resposta) => {
                resolve(resposta);
            });
        });
    }
}
exports.Interface = Interface;
