// Importa a biblioteca bcrypt para possíveis funcionalidades de senha (criptografia, comparação, etc.)
import * as bcrypt from "bcrypt";

// Importa função personalizada para entrada de dados no terminal
import { input } from "../utils/promptUtils.js";

// Importa o serviço de usuário, responsável por lógica de criação e login
import { usuarioService } from "../services/Usuario.js";

// Importa os controladores para cliente e administrador
import { ClienteController } from "./ClienteController.js";
import { AdminController } from "./AdminControllers.js";

// Classe responsável por gerenciar o menu principal do sistema
export class MenuController {

    // Método principal que exibe o menu inicial em loop até o usuário sair
    async iniciar(): Promise<void> {
        while (true) {
            console.clear();  // Limpa o console para uma nova exibição do menu
            console.log("\n=== 🍕 SISTEMA PIZZARIA ===");
            console.log("[1] Cadastro");
            console.log("[2] Login");
            console.log("[3] Sair");

            const opcao = input("Escolha uma opção: ");

            switch (opcao) {
                case "1":
                    await this.cadastro(); // Inicia o processo de cadastro
                    break;
                case "2":
                    await this.login();    // Inicia o processo de login
                    break;
                case "3":
                    // Sai do loop principal, encerrando o sistema
                    console.log("Salvando dados e saindo...");
                    console.log("Até logo! 👋");
                    return;
                default:
                    // Opção inválida, aguarda ENTER para seguir
                    console.log("Opção inválida!");
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Método que realiza o cadastro de um novo usuário
    private async cadastro(): Promise<void> {
        console.clear();
        console.log("\n=== ✍️ CADASTRO ===");

        // Coleta os dados do usuário via prompt
        const nome = input("Nome: ").trim();
        const senha = input("Senha: ");
        const cpf = input("CPF: ").replace(/[^\d]/g, ""); // Remove pontos e traços do CPF
        const email = input("Email: ").trim();
        const telefone = input("Telefone: ").trim();
        const dataNascmto = input("Data de nascimento (DD/MM/AAAA): ").trim();

        // Coleta dados de endereço
        console.log("\n--- 🏠 ENDEREÇO ---");
        const rua = input("Rua: ").trim();
        const numero = input("Número: ").trim();
        const bairro = input("Bairro: ").trim();

        const endereco = { rua, numero, bairro };

        // Chama o serviço responsável por criar um novo usuário
        const result = usuarioService.criarUsuario(
            nome,
            senha,
            cpf,
            email,
            telefone,
            endereco,
            dataNascmto
        );

        // Verifica se houve erro no cadastro
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            input("\nPressione ENTER para voltar...");
            return;
        }

        // Cadastro realizado com sucesso
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario!;

        // Pergunta se o usuário deseja permanecer logado após o cadastro
        const continuarLogado = input("\nDeseja continuar logado? (s/n): ").toLowerCase() === 's';

        if (continuarLogado && usuario) {
            // Exibe mensagem de boas-vindas e tipo do usuário
            console.log(`\nBem-vindo, ${usuario.nome}!`);
            console.log(`Você está logado como: ${usuario.tipo.toUpperCase()}`);

            // Direciona para o respectivo controller
            if (usuario.tipo === "admin") {
                const adminCtrl = new AdminController(usuario);
                await adminCtrl.iniciar();
            } else {
                const clienteCtrl = new ClienteController(usuario);
                await clienteCtrl.iniciar();
            }
        } else {
            // Volta ao menu principal
            console.log("Voltando ao menu principal...");
            input("\nPressione ENTER para continuar...");
        }
    }

    // Método responsável pelo login de um usuário
    private async login(): Promise<void> {
        console.clear();
        console.log("\n=== 🔐 LOGIN ===");

        // Solicita credenciais de login
        const email = input("Email: ").trim();
        const senha = input("Senha: ");

        // Chama o serviço de login
        const result = usuarioService.login(email, senha);

        // Caso falhe, exibe erro
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            input("\nPressione ENTER para voltar...");
            return;
        }

        // Login bem-sucedido
        console.log(`✅ ${result.mensagem}`);
        const usuario = result.usuario!;

        // Direciona o usuário para a área apropriada (admin ou cliente)
        if (usuario.tipo === "admin") {
            const adminCtrl = new AdminController(usuario);
            await adminCtrl.iniciar();
        } else {
            const clienteCtrl = new ClienteController(usuario);
            await clienteCtrl.iniciar();
        }
    }
}
