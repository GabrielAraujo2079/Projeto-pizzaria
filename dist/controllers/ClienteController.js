"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteController = void 0;
const promptUtils_js_1 = require("../utils/promptUtils.js");
const Produto_js_1 = require("../services/Produto.js");
const Pedido_js_1 = require("../services/Pedido.js");
const Usuario_js_1 = require("../services/Usuario.js");
class ClienteController {
    constructor(usuario) {
        this.usuario = usuario;
    }
    async iniciar() {
        while (true) {
            console.clear();
            console.log(`\n=== 👤 MENU CLIENTE (${this.usuario.nome}) ===`);
            console.log("[1] Ver Cardápio e Fazer Pedido");
            console.log("[2] Meus Pedidos");
            console.log("[3] Meu Endereço");
            console.log("[4] Voltar ao Menu Principal");
            const opcao = (0, promptUtils_js_1.input)("Escolha uma opção: ");
            switch (opcao) {
                case "1":
                    await this.fazerPedido();
                    break;
                case "2":
                    await this.listarMeusPedidos();
                    break;
                case "3":
                    await this.gerenciarEndereco();
                    break;
                case "4":
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async fazerPedido() {
        console.clear();
        console.log("\n=== 🍕 FAZER PEDIDO ===");
        const produtos = Produto_js_1.produtoService.listarProdutosDisponiveis();
        if (produtos.length === 0) {
            console.log("Nenhum produto disponível no momento.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log("\n=== 📜 CARDÁPIO ===");
        produtos.forEach(p => {
            console.log(`${p.id}. ${p.nome} - R$ ${p.preco.toFixed(2)} | ${p.descricao}`);
        });
        const itens = [];
        let total = 0;
        while (true) {
            const idStr = (0, promptUtils_js_1.input)("\nDigite o ID do produto (0 para finalizar): ");
            if (idStr === "0") {
                if (itens.length === 0) {
                    console.log("Pedido cancelado.");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
                    return;
                }
                break;
            }
            const id = parseInt(idStr);
            if (isNaN(id)) {
                console.log("ID inválido!");
                continue;
            }
            const produto = Produto_js_1.produtoService.buscarPorId(id);
            if (!produto || !produto.disponivel) {
                console.log("Produto não encontrado ou indisponível!");
                continue;
            }
            const qtdStr = (0, promptUtils_js_1.input)(`Quantidade de "${produto.nome}" (1+): `);
            const quantidade = parseInt(qtdStr);
            if (isNaN(quantidade) || quantidade <= 0) {
                console.log("Quantidade inválida!");
                continue;
            }
            const itemExistente = itens.find(i => i.produtoId === produto.id);
            if (itemExistente) {
                itemExistente.quantidade += quantidade;
                itemExistente.subtotal = itemExistente.quantidade * itemExistente.precoUnitario;
            }
            else {
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
        // Tipo de entrega
        console.clear();
        console.log("\n=== 🚚 TIPO DE ENTREGA ===");
        console.log("[1] Entrega");
        console.log("[2] Retirada no local");
        const tipoEntregaOp = (0, promptUtils_js_1.input)("Escolha: ");
        const tipoEntrega = tipoEntregaOp === "1" ? "entrega" : "retirada";
        let enderecoEntrega;
        if (tipoEntrega === "entrega") {
            console.log(`\nSeu endereço cadastrado: ${this.usuario.endereco.rua}, ${this.usuario.endereco.numero} - ${this.usuario.endereco.bairro}`);
            const usarCadastrado = (0, promptUtils_js_1.input)("Usar este endereço? (s/n): ").toLowerCase() === 's';
            if (usarCadastrado) {
                enderecoEntrega = { ...this.usuario.endereco };
            }
            else {
                console.log("\n--- 📍 NOVO ENDEREÇO DE ENTREGA ---");
                const rua = (0, promptUtils_js_1.input)("Rua: ").trim();
                const numero = (0, promptUtils_js_1.input)("Número: ").trim();
                const bairro = (0, promptUtils_js_1.input)("Bairro: ").trim();
                enderecoEntrega = { rua, numero, bairro };
            }
        }
        // Forma de pagamento
        console.log("\n=== 💳 FORMA DE PAGAMENTO ===");
        console.log("[1] Dinheiro");
        console.log("[2] PIX");
        console.log("[3] Débito");
        console.log("[4] Crédito");
        const pgtoOp = (0, promptUtils_js_1.input)("Escolha: ");
        const formaPagamentoMap = {
            "1": "dinheiro",
            "2": "pix",
            "3": "debito",
            "4": "credito"
        };
        const formaPagamento = formaPagamentoMap[pgtoOp] || "dinheiro";
        const observacoes = (0, promptUtils_js_1.input)("Observações (opcional): ").trim();
        // Confirmação
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
        const confirmar = (0, promptUtils_js_1.input)("\nConfirmar pedido? (s/n): ").toLowerCase() === 's';
        if (!confirmar) {
            console.log("Pedido cancelado.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        // Cria pedido
        const result = Pedido_js_1.pedidoService.criarPedido(this.usuario.email, this.usuario.nome, this.usuario.telefone, itens, total, tipoEntrega, enderecoEntrega, formaPagamento, observacoes || undefined);
        if (!result.sucesso) {
            console.log(`❌ ${result.mensagem}`);
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const pedido = result.pedido;
        console.log(`\n🎉 ${result.mensagem}`);
        console.log(`Status: ${pedido.status.toUpperCase()}`);
        console.log(`Data: ${new Date(pedido.dataHora).toLocaleString('pt-BR')}`);
        // Mostra nota no console
        console.log("\n" + "=".repeat(50));
        console.log(Pedido_js_1.pedidoService.gerarConteudoNotaFiscal(pedido));
        console.log("=".repeat(50));
        // Salva nota em arquivo
        const notaPath = Pedido_js_1.pedidoService.emitirNotaFiscalTXT(pedido);
        if (notaPath) {
            console.log(`📄 Nota salva em: ${notaPath}`);
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async listarMeusPedidos() {
        console.clear();
        console.log("\n=== 📦 MEUS PEDIDOS ===");
        const pedidos = Pedido_js_1.pedidoService.listarPedidosDoCliente(this.usuario.email);
        if (pedidos.length === 0) {
            console.log("Você ainda não fez pedidos.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        pedidos.forEach(p => {
            console.log("\n" + "─".repeat(40));
            console.log(`Pedido #${p.id} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
            console.log(`Data: ${new Date(p.dataHora).toLocaleString('pt-BR')}`);
            p.itens.forEach(i => console.log(`   ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
            if (p.observacoes)
                console.log(`Observações: ${p.observacoes}`);
        });
        (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
    }
    async gerenciarEndereco() {
        console.clear();
        console.log("\n=== 🏠 MEU ENDEREÇO ===");
        const { rua, numero, bairro } = this.usuario.endereco;
        console.log(`Rua: ${rua}`);
        console.log(`Número: ${numero}`);
        console.log(`Bairro: ${bairro}`);
        console.log(`Telefone: ${this.usuario.telefone}`);
        const atualizar = (0, promptUtils_js_1.input)("\nDeseja atualizar? (s/n): ").toLowerCase() === 's';
        if (!atualizar) {
            return;
        }
        console.log("\n--- ✏️ NOVO ENDEREÇO ---");
        const novaRua = (0, promptUtils_js_1.input)(`Rua (${rua}): `).trim() || rua;
        const novoNumero = (0, promptUtils_js_1.input)(`Número (${numero}): `).trim() || numero;
        const novoBairro = (0, promptUtils_js_1.input)(`Bairro (${bairro}): `).trim() || bairro;
        const novoTelefone = (0, promptUtils_js_1.input)(`Telefone (${this.usuario.telefone}): `).trim() || this.usuario.telefone;
        const result = Usuario_js_1.usuarioService.atualizarUsuario(this.usuario.email, {
            telefone: novoTelefone,
            endereco: { rua: novaRua, numero: novoNumero, bairro: novoBairro }
        });
        if (result.sucesso) {
            this.usuario = result.usuario; // Atualiza instância local
            console.log("✅ Endereço atualizado com sucesso!");
        }
        else {
            console.log(`❌ ${result.mensagem}`);
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
}
exports.ClienteController = ClienteController;
