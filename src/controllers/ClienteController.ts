// Importa função personalizada para entrada de dados do terminal
import { input } from "../utils/promptUtils.js";

// Importa serviços que manipulam produtos e pedidos
import { produtoService } from "../services/Produto.js";
import { pedidoService } from "../services/Pedido.js";
import { Usuario } from "../models/index.js";
import { usuarioService } from "../services/Usuario.js";

// Classe responsável por gerenciar o menu e as ações do cliente
export class ClienteController {
    // Recebe um usuário (cliente) autenticado na construção da classe
    constructor(private usuario: Usuario) {}

    // Método principal que exibe o menu de cliente
    async iniciar(): Promise<void> {
        while (true) {
            console.clear();
            console.log(`\n=== 👤 MENU CLIENTE (${this.usuario.nome}) ===`);
            console.log("[1] Ver Cardápio e Fazer Pedido");
            console.log("[2] Meus Pedidos");
            console.log("[3] Meu Endereço");
            console.log("[4] Voltar ao Menu Principal");
            const opcao = input("Escolha uma opção: ");

            switch (opcao) {
                case "1":
                    await this.fazerPedido(); // Inicia fluxo de pedido
                    break;
                case "2":
                    await this.listarMeusPedidos(); // Lista pedidos anteriores
                    break;
                case "3":
                    await this.gerenciarEndereco(); // Permite editar endereço
                    break;
                case "4":
                    return; // Retorna ao menu principal
                default:
                    console.log("Opção inválida!");
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Método para exibir cardápio e realizar um pedido
    private async fazerPedido(): Promise<void> {
        console.clear();
        console.log("\n=== 🍕 FAZER PEDIDO ===");

        const produtos = produtoService.listarProdutosDisponiveis();

        if (produtos.length === 0) {
            console.log("Nenhum produto disponível no momento.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        console.log("\n=== 📜 CARDÁPIO ===");
        produtos.forEach(p => {
            console.log(`${p.id}. ${p.nome} - R$ ${p.preco.toFixed(2)} | ${p.descricao}`);
        });

        const itens: {
            produtoId: number;
            nomeProduto: string;
            quantidade: number;
            precoUnitario: number;
            subtotal: number;
        }[] = [];

        let total = 0;

        // Laço para adicionar itens ao pedido
        while (true) {
            const idStr = input("\nDigite o ID do produto (0 para finalizar): ");
            if (idStr === "0") {
                if (itens.length === 0) {
                    console.log("Pedido cancelado.");
                    input("\nPressione ENTER para voltar...");
                    return;
                }
                break; // Finaliza pedido
            }

            const id = parseInt(idStr);
            if (isNaN(id)) {
                console.log("ID inválido!");
                continue;
            }

            const produto = produtoService.buscarPorId(id);
            if (!produto || !produto.disponivel) {
                console.log("Produto não encontrado ou indisponível!");
                continue;
            }

            const qtdStr = input(`Quantidade de "${produto.nome}" (1+): `);
            const quantidade = parseInt(qtdStr);
            if (isNaN(quantidade) || quantidade <= 0) {
                console.log("Quantidade inválida!");
                continue;
            }

            // Se já existe item igual, acumula quantidade
            const itemExistente = itens.find(i => i.produtoId === produto.id);
            if (itemExistente) {
                itemExistente.quantidade += quantidade;
                itemExistente.subtotal = itemExistente.quantidade * itemExistente.precoUnitario;
            } else {
                itens.push({
                    produtoId: produto.id,
                    nomeProduto: produto.nome,
                    quantidade,
                    precoUnitario: produto.preco,
                    subtotal: produto.preco * quantidade
                });
            }

            total = itens.reduce((sum, item) => sum + item.subtotal, 0);
            console.log(`✅ Adicionado! Total atual: R$ ${total.toFixed(2)}`);
        }

        // Escolha de entrega ou retirada
        console.clear();
        console.log("\n=== 🚚 TIPO DE ENTREGA ===");
        console.log("[1] Entrega");
        console.log("[2] Retirada no local");
        const tipoEntregaOp = input("Escolha: ");
        const tipoEntrega = tipoEntregaOp === "1" ? "entrega" : "retirada";

        let enderecoEntrega;
        if (tipoEntrega === "entrega") {
            // Mostra endereço cadastrado
            console.log(`\nSeu endereço cadastrado: ${this.usuario.endereco.rua}, ${this.usuario.endereco.numero} - ${this.usuario.endereco.bairro}`);
            const usarCadastrado = input("Usar este endereço? (s/n): ").toLowerCase() === 's';

            if (usarCadastrado) {
                enderecoEntrega = { ...this.usuario.endereco };
            } else {
                // Coleta novo endereço
                console.log("\n--- 📍 NOVO ENDEREÇO DE ENTREGA ---");
                const rua = input("Rua: ").trim();
                const numero = input("Número: ").trim();
                const bairro = input("Bairro: ").trim();
                enderecoEntrega = { rua, numero, bairro };
            }
        }

        // Escolha da forma de pagamento
        console.log("\n=== 💳 FORMA DE PAGAMENTO ===");
        console.log("[1] Dinheiro");
        console.log("[2] PIX");
        console.log("[3] Débito");
        console.log("[4] Crédito");
        const pgtoOp = input("Escolha: ");
        const formaPagamentoMap: Record<string, string> = {
            "1": "dinheiro",
            "2": "pix",
            "3": "debito",
            "4": "credito"
        };
        const formaPagamento = (formaPagamentoMap[pgtoOp] as any) || "dinheiro";

        const observacoes = input("Observações (opcional): ").trim();

        // Resumo e confirmação do pedido
        console.clear();
        console.log("\n=== 🧾 RESUMO DO PEDIDO ===");
        console.log(`Tipo: ${tipoEntrega.toUpperCase()}`);
        if (enderecoEntrega) {
            console.log(`Endereço: ${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}`);
        }
        console.log(`Forma de pagamento: ${formaPagamento.toUpperCase()}`);
        console.log(`Total: R$ ${total.toFixed(2)}`);
        console.log("\nItens:");
        itens.forEach(i => console.log(`   ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));

        const confirmar = input("\nConfirmar pedido? (s/n): ").toLowerCase() === 's';
        if (!confirmar) {
            console.log("Pedido cancelado.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        // Criação do pedido via service
        const result = pedidoService.criarPedido(
            this.usuario.email,
            this.usuario.nome,
            this.usuario.telefone,
            itens,
            total,
            tipoEntrega,
            enderecoEntrega,
            formaPagamento,
            observacoes || undefined
        );

        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            input("\nPressione ENTER para voltar...");
            return;
        }

        const pedido = result.pedido!;
        console.log(`\n🎉 ${result.mensagem}`);
        console.log(`Status: ${pedido.status.toUpperCase()}`);
        console.log(`Data: ${new Date(pedido.dataHora).toLocaleString('pt-BR')}`);

        // Mostra e salva nota fiscal
        console.log("\n" + "=".repeat(50));
        console.log(pedidoService.gerarConteudoNotaFiscal(pedido));
        console.log("=".repeat(50));

        const notaPath = pedidoService.emitirNotaFiscalTXT(pedido);
        if (notaPath) {
            console.log(`📄 Nota salva em: ${notaPath}`);
        }

        input("\nPressione ENTER para continuar...");
    }

    // Lista todos os pedidos feitos pelo cliente
    private async listarMeusPedidos(): Promise<void> {
        console.clear();
        console.log("\n=== 📦 MEUS PEDIDOS ===");

        const pedidos = pedidoService.listarPedidosDoCliente(this.usuario.email);
        if (pedidos.length === 0) {
            console.log("Você ainda não fez pedidos.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        pedidos.forEach(p => {
            console.log("\n" + "─".repeat(40));
            console.log(`Pedido #${p.id} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
            console.log(`Data: ${new Date(p.dataHora).toLocaleString('pt-BR')}`);
            p.itens.forEach(i => console.log(`   ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
            if (p.observacoes) console.log(`Observações: ${p.observacoes}`);
        });

        input("\nPressione ENTER para voltar...");
    }

    // Exibe e permite editar o endereço do cliente
    private async gerenciarEndereco(): Promise<void> {
        console.clear();
        console.log("\n=== 🏠 MEU ENDEREÇO ===");
        const { rua, numero, bairro } = this.usuario.endereco;
        console.log(`Rua: ${rua}`);
        console.log(`Número: ${numero}`);
        console.log(`Bairro: ${bairro}`);
        console.log(`Telefone: ${this.usuario.telefone}`);

        const atualizar = input("\nDeseja atualizar? (s/n): ").toLowerCase() === 's';
        if (!atualizar) {
            return;
        }

        // Permite atualizar os campos, mantendo valor atual se vazio
        console.log("\n--- ✏️ NOVO ENDEREÇO ---");
        const novaRua = input(`Rua (${rua}): `).trim() || rua;
        const novoNumero = input(`Número (${numero}): `).trim() || numero;
        const novoBairro = input(`Bairro (${bairro}): `).trim() || bairro;
        const novoTelefone = input(`Telefone (${this.usuario.telefone}): `).trim() || this.usuario.telefone;

        const result = usuarioService.atualizarUsuario(this.usuario.email, {
            telefone: novoTelefone,
            endereco: { rua: novaRua, numero: novoNumero, bairro: novoBairro }
        });

        if (result.sucesso) {
            // Atualiza a instância local com os novos dados
            this.usuario = result.usuario!;
            console.log("✅ Endereço atualizado com sucesso!");
        } else {
            console.log(`❌ ${result.mensagem}`);
        }

        input("\nPressione ENTER para continuar...");
    }
}
