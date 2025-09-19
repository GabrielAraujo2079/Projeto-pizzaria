"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
const promptUtils_js_1 = require("../utils/promptUtils.js");
const Usuario_js_1 = require("../services/Usuario.js");
const ClienteController_js_1 = require("./ClienteController.js");
const AdminControllers_js_1 = require("./AdminControllers.js");
class MenuController {
    async iniciar() {
        while (true) {
            console.clear();
            console.log("\n=== 🍕 SISTEMA PIZZARIA ===");
            console.log("[1] Cadastro");
            console.log("[2] Login");
            console.log("[3] Sair");
            const opcao = (0, promptUtils_js_1.input)("Escolha uma opção: ");
            switch (opcao) {
                case "1":
                    await this.cadastro();
                    break;
                case "2":
                    await this.login();
                    break;
                case "3":
                    console.log("Salvando dados e saindo...");
                    console.log("Até logo! 👋");
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async cadastro() {
        console.clear();
        console.log("\n=== ✍️ CADASTRO ===");
        const nome = (0, promptUtils_js_1.input)("Nome: ").trim();
        const senha = (0, promptUtils_js_1.input)("Senha: ");
        const cpf = (0, promptUtils_js_1.input)("CPF: ").replace(/[^\d]/g, "");
        const email = (0, promptUtils_js_1.input)("Email: ").trim();
        const telefone = (0, promptUtils_js_1.input)("Telefone: ").trim();
        const dataNascmto = (0, promptUtils_js_1.input)("Data de nascimento (DD/MM/AAAA): ").trim();
        console.log("\n--- 🏠 ENDEREÇO ---");
        const rua = (0, promptUtils_js_1.input)("Rua: ").trim();
        const numero = (0, promptUtils_js_1.input)("Número: ").trim();
        const bairro = (0, promptUtils_js_1.input)("Bairro: ").trim();
        const endereco = { rua, numero, bairro };
        const result = Usuario_js_1.usuarioService.criarUsuario(nome, senha, cpf, email, telefone, endereco, dataNascmto);
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario;
        // Login automático?
        const continuarLogado = (0, promptUtils_js_1.input)("\nDeseja continuar logado? (s/n): ").toLowerCase() === 's';
        if (continuarLogado && usuario) {
            console.log(`\nBem-vindo, ${usuario.nome}!`);
            console.log(`Você está logado como: ${usuario.tipo.toUpperCase()}`);
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
            console.log("Voltando ao menu principal...");
            (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
        }
    }
    async login() {
        console.clear();
        console.log("\n=== 🔐 LOGIN ===");
        const email = (0, promptUtils_js_1.input)("Email: ").trim();
        const senha = (0, promptUtils_js_1.input)("Senha: ");
        const result = Usuario_js_1.usuarioService.login(email, senha);
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario;
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
