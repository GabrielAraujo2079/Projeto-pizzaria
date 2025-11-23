"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
// Importa função personalizada para entrada de dados no terminal
const promptUtils_js_1 = require("../utils/promptUtils.js");
// Importa o serviço de usuário, responsável por lógica de criação e login
const Usuario_js_1 = require("../services/Usuario.js");
// Importa os controladores para cliente e administrador
const ClienteController_js_1 = require("./ClienteController.js");
const AdminControllers_js_1 = require("./AdminControllers.js");
// Classe responsável por gerenciar o menu principal do sistema
class MenuController {
    // Método principal que exibe o menu inicial em loop até o usuário sair
    async iniciar() {
        while (true) {
            console.clear(); // Limpa o console para uma nova exibição do menu
            console.log("\n=== 🍕 SISTEMA PIZZARIA ===");
            console.log("[1] Cadastro");
            console.log("[2] Login");
            console.log("[3] Sair");
            const opcao = (0, promptUtils_js_1.input)("Escolha uma opção: ");
            switch (opcao) {
                case "1":
                    await this.cadastro(); // Inicia o processo de cadastro
                    break;
                case "2":
                    await this.login(); // Inicia o processo de login
                    break;
                case "3":
                    // Sai do loop principal, encerrando o sistema
                    console.log("Salvando dados e saindo...");
                    console.log("Até logo! 👋");
                    return;
                default:
                    // Opção inválida, aguarda ENTER para seguir
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    // Método que realiza o cadastro de um novo usuário
    async cadastro() {
        console.clear();
        console.log("\n=== ✍️ CADASTRO ===");
        // Coleta os dados do usuário via prompt
        const nome = (0, promptUtils_js_1.input)("Nome: ").trim();
        const senha = (0, promptUtils_js_1.input)("Senha: ");
        const cpf = (0, promptUtils_js_1.input)("CPF: ").replace(/[^\d]/g, ""); // Remove pontos e traços do CPF
        const email = (0, promptUtils_js_1.input)("Email: ").trim();
        const telefone = (0, promptUtils_js_1.input)("Telefone: ").trim();
        const dataNascmto = (0, promptUtils_js_1.input)("Data de nascimento (DD/MM/AAAA): ").trim();
        // Coleta dados de endereço
        console.log("\n--- 🏠 ENDEREÇO ---");
        const rua = (0, promptUtils_js_1.input)("Rua: ").trim();
        const numero = (0, promptUtils_js_1.input)("Número: ").trim();
        const bairro = (0, promptUtils_js_1.input)("Bairro: ").trim();
        const endereco = { rua, numero, bairro };
        // Chama o serviço responsável por criar um novo usuário
        const result = Usuario_js_1.usuarioService.criarUsuario(nome, senha, cpf, email, telefone, endereco, dataNascmto);
        // Verifica se houve erro no cadastro
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        // Cadastro realizado com sucesso
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario;
        // Pergunta se o usuário deseja permanecer logado após o cadastro
        const continuarLogado = (0, promptUtils_js_1.input)("\nDeseja continuar logado? (s/n): ").toLowerCase() === 's';
        if (continuarLogado && usuario) {
            // Exibe mensagem de boas-vindas e tipo do usuário
            console.log(`\nBem-vindo, ${usuario.nome}!`);
            console.log(`Você está logado como: ${usuario.tipo.toUpperCase()}`);
            // Direciona para o respectivo controller
            if (usuario.tipo === "admin") {
                const adminCtrl = new AdminControllers_js_1.AdminController(usuario);
                await adminCtrl.iniciar();
            }
            else {
                const clienteCtrl = new ClienteController_js_1.ClienteController(usuario);
                await clienteCtrl.iniciar();
            }
        }
        else {
            // Volta ao menu principal
            console.log("Voltando ao menu principal...");
            (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
        }
    }
    // Método responsável pelo login de um usuário
    async login() {
        console.clear();
        console.log("\n=== 🔐 LOGIN ===");
        // Solicita credenciais de login
        const email = (0, promptUtils_js_1.input)("Email: ").trim();
        const senha = (0, promptUtils_js_1.input)("Senha: ");
        // Chama o serviço de login
        const result = Usuario_js_1.usuarioService.login(email, senha);
        // Caso falhe, exibe erro
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        // Login bem-sucedido
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario;
        // Direciona o usuário para a área apropriada (admin ou cliente)
        if (usuario.tipo === "admin") {
            const adminCtrl = new AdminControllers_js_1.AdminController(usuario);
            await adminCtrl.iniciar();
        }
        else {
            const clienteCtrl = new ClienteController_js_1.ClienteController(usuario);
            await clienteCtrl.iniciar();
        }
    }
}
exports.MenuController = MenuController;
