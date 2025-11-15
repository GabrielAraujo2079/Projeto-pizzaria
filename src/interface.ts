import * as readline from 'readline';
import { PizzariaApp } from './app';
import { DatabaseConfig } from './types';
import { Usuario, Endereco } from './models';

export class Interface {
    private rl: readline.Interface;
    private app: PizzariaApp;

    constructor(config: DatabaseConfig) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.app = new PizzariaApp(config);
    }

    async iniciar() {
        try {
            await this.app.inicializar();
            console.log('🍕 Bem-vindo ao Sistema da Pizzaria!');
            await this.mostrarMenuPrincipal();
        } catch (error) {
            console.error('❌ Erro ao iniciar o sistema:', error);
        }
    }

    private async mostrarMenuPrincipal() {
        while (true) {
            console.log('\n=== MENU PRINCIPAL ===');
            console.log('1. Gerenciar Usuários');
            console.log('2. Gerenciar Produtos');
            console.log('3. Gerenciar Pedidos');
            console.log('4. Gerenciar Promoções');
            console.log('5. Relatórios');
            console.log('0. Sair');

            const opcao = await this.perguntar('Escolha uma opção: ');

            switch (opcao) {
                case '1': await this.menuUsuarios(); break;
                case '2': await this.menuProdutos(); break;
                case '3': await this.menuPedidos(); break;
                case '4': await this.menuPromocoes(); break;
                case '5': await this.menuRelatorios(); break;
                case '0':
                    console.log('👋 Encerrando o sistema...');
                    await this.app.fechar();
                    this.rl.close();
                    process.exit(0);
                default:
                    console.log('⚠️ Opção inválida. Tente novamente.');
            }
        }
    }

    // ======================================================
    // SUBMENUS
    // ======================================================

    private async menuUsuarios() {
        while (true) {
            console.log('\n=== GERENCIAR USUÁRIOS ===');
            console.log('1. Cadastrar');
            console.log('2. Listar');
            console.log('3. Buscar por ID');
            console.log('0. Voltar');

            const opcao = await this.perguntar('Escolha uma opção: ');

            switch (opcao) {
                case '1': await this.cadastrarUsuario(); break;
                case '2': await this.listarUsuarios(); break;
                case '3': await this.buscarUsuario(); break;
                case '0': return;
                default: console.log('⚠️ Opção inválida.');
            }
        }
    }

    private async menuProdutos() {
        console.log('\n🧩 Módulo de Produtos ainda em desenvolvimento.');
    }

    private async menuPedidos() {
        console.log('\n📦 Módulo de Pedidos ainda em desenvolvimento.');
    }

    private async menuPromocoes() {
        console.log('\n🎁 Módulo de Promoções ainda em desenvolvimento.');
    }

    private async menuRelatorios() {
        console.log('\n📊 Módulo de Relatórios ainda em desenvolvimento.');
    }

    // ======================================================
    // FUNCIONALIDADES DE USUÁRIOS
    // ======================================================

    private async cadastrarUsuario() {
        console.log('\n=== CADASTRAR NOVO USUÁRIO ===');
        const nome = await this.perguntar('Nome: ');
        const email = await this.perguntar('Email: ');
        const senha = await this.perguntar('Senha: ');
        const cpf = await this.perguntar('CPF: ');
        const telefone = await this.perguntar('Telefone: ');
        const nascimento = await this.perguntar('Data de nascimento (YYYY-MM-DD): ');

        console.log('\n--- Endereço ---');
        const rua = await this.perguntar('Rua: ');
        const numero = await this.perguntar('Número: ');
        const bairro = await this.perguntar('Bairro: ');
        const cidade = await this.perguntar('Cidade: ');
        const estado = await this.perguntar('Estado (UF): ');
        const cep = await this.perguntar('CEP: ');

        const endereco = new Endereco(0, rua, numero, bairro, '', cidade, estado, cep);
        const usuario = new Usuario(
            0,
            nome,
            email,
            senha,
            cpf,
            telefone,
            'cliente',
            new Date(nascimento),
            endereco
        );

        try {
            const novoUsuario = await this.app.cadastrarUsuario(usuario);
            console.log(`✅ Usuário cadastrado com sucesso! ID: ${novoUsuario.id}`);
        } catch (error) {
            console.error('❌ Erro ao cadastrar usuário:', error);
        }
    }

    private async listarUsuarios() {
        try {
            const usuarios = await this.app.listarUsuarios();
            console.log('\n=== LISTA DE USUÁRIOS ===');
            if (usuarios.length === 0) {
                console.log('Nenhum usuário cadastrado.');
                return;
            }

            usuarios.forEach((u) => {
                console.log(`\nID: ${u.id}`);
                console.log(`Nome: ${u.nome}`);
                console.log(`Email: ${u.email}`);
                console.log(`CPF: ${u.cpf}`);
                console.log(`Telefone: ${u.telefone}`);
                console.log(`Tipo: ${u.tipo}`);
                if (u.endereco) {
                    console.log(`Endereço: ${u.endereco.rua}, ${u.endereco.numero} - ${u.endereco.bairro}`);
                }
                console.log('-----------------------------------');
            });
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error);
        }
    }

    private async buscarUsuario() {
        const id = Number(await this.perguntar('ID do usuário: '));
        try {
            const usuario = await this.app.buscarUsuario(id);
            if (!usuario) {
                console.log('⚠️ Usuário não encontrado.');
                return;
            }

            console.log('\n=== DETALHES DO USUÁRIO ===');
            console.log(`Nome: ${usuario.nome}`);
            console.log(`Email: ${usuario.email}`);
            console.log(`Telefone: ${usuario.telefone}`);
            console.log(`CPF: ${usuario.cpf}`);
            console.log(`Tipo: ${usuario.tipo}`);
            if (usuario.endereco) {
                console.log(`Endereço: ${usuario.endereco.rua}, ${usuario.endereco.numero}`);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
        }
    }

    // ======================================================
    // UTILITÁRIOS
    // ======================================================

    private perguntar(pergunta: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(pergunta, (resposta) => resolve(resposta.trim()));
        });
    }
}
