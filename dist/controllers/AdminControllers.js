"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const promptUtils_js_1 = require("../utils/promptUtils.js");
const Usuario_js_1 = require("../services/Usuario.js");
const Produto_js_1 = require("../services/Produto.js");
const Pedido_js_1 = require("../services/Pedido.js");
class AdminController {
    constructor(admin) {
        this.admin = admin;
    }
    async iniciar() {
        while (true) {
            console.clear();
            console.log(`\n=== 👨‍💼 MENU ADMIN (${this.admin.nome}) ===`);
            console.log("[1] Gerenciar Clientes");
            console.log("[2] Gerenciar Produtos");
            console.log("[3] Gerenciar Pedidos");
            console.log("[4] Gerar Relatório de Vendas");
            console.log("[5] Voltar ao Menu Principal");
            const opcao = (0, promptUtils_js_1.input)("Escolha uma opção: ");
            switch (opcao) {
                case "1":
                    await this.menuClientes();
                    break;
                case "2":
                    await this.menuProdutos();
                    break;
                case "3":
                    await this.menuPedidos();
                    break;
                case "4":
                    await this.gerarRelatorio();
                    break;
                case "5":
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async menuClientes() {
        while (true) {
            console.clear();
            console.log("\n=== 👥 GERENCIAR CLIENTES ===");
            console.log("[1] Listar Clientes");
            console.log("[2] Atualizar Cliente");
            console.log("[3] Remover Cliente");
            console.log("[4] Voltar");
            const opcao = (0, promptUtils_js_1.input)("Escolha: ");
            switch (opcao) {
                case "1":
                    await this.listarClientes();
                    break;
                case "2":
                    await this.atualizarCliente();
                    break;
                case "3":
                    await this.removerCliente();
                    break;
                case "4":
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async listarClientes() {
        console.clear();
        console.log("\n=== 📋 LISTA DE CLIENTES ===");
        const clientes = Usuario_js_1.usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente cadastrado.");
        }
        else {
            clientes.forEach(c => {
                console.log(`Nome: ${c.nome} | Email: ${c.email} | Tel: ${c.telefone} | CPF: ${c.cpf}`);
            });
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
    }
    async atualizarCliente() {
        console.clear();
        console.log("\n=== ✏️ ATUALIZAR CLIENTE ===");
        const clientes = Usuario_js_1.usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente para atualizar.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        clientes.forEach(c => console.log(`- ${c.email} (${c.nome})`));
        const email = (0, promptUtils_js_1.input)("\nEmail do cliente a atualizar: ").trim();
        const cliente = Usuario_js_1.usuarioService.buscarPorEmail(email);
        if (!cliente || cliente.tipo !== "cliente") {
            console.log("Cliente não encontrado.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const nome = (0, promptUtils_js_1.input)(`Nome (${cliente.nome}): `).trim() || cliente.nome;
        const novoEmail = (0, promptUtils_js_1.input)(`Email (${cliente.email}): `).trim() || cliente.email;
        const cpf = (0, promptUtils_js_1.input)(`CPF (${cliente.cpf}): `).trim() || cliente.cpf;
        const telefone = (0, promptUtils_js_1.input)(`Telefone (${cliente.telefone}): `).trim() || cliente.telefone;
        const atualizarEndereco = (0, promptUtils_js_1.input)("Atualizar endereço? (s/n): ").toLowerCase() === 's';
        let endereco = cliente.endereco;
        if (atualizarEndereco) {
            endereco = {
                rua: (0, promptUtils_js_1.input)(`Rua (${cliente.endereco.rua}): `).trim() || cliente.endereco.rua,
                numero: (0, promptUtils_js_1.input)(`Número (${cliente.endereco.numero}): `).trim() || cliente.endereco.numero,
                bairro: (0, promptUtils_js_1.input)(`Bairro (${cliente.endereco.bairro}): `).trim() || cliente.endereco.bairro
            };
        }
        const result = Usuario_js_1.usuarioService.atualizarUsuario(email, {
            nome,
            email: novoEmail,
            cpf,
            telefone,
            endereco
        });
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async removerCliente() {
        console.clear();
        console.log("\n=== 🗑️ REMOVER CLIENTE ===");
        const clientes = Usuario_js_1.usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente para remover.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        clientes.forEach(c => console.log(`- ${c.email} (${c.nome})`));
        const email = (0, promptUtils_js_1.input)("\nEmail do cliente a remover: ").trim();
        const cliente = Usuario_js_1.usuarioService.buscarPorEmail(email);
        if (!cliente || cliente.tipo !== "cliente") {
            console.log("Cliente não encontrado.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const confirmar = (0, promptUtils_js_1.input)(`Tem certeza que deseja remover "${cliente.nome}"? (s/n): `).toLowerCase() === 's';
        if (!confirmar) {
            console.log("Remoção cancelada.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const result = Usuario_js_1.usuarioService.removerUsuario(email);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async menuProdutos() {
        while (true) {
            console.clear();
            console.log("\n=== 🍕 GERENCIAR PRODUTOS ===");
            console.log("[1] Adicionar Produto");
            console.log("[2] Listar Produtos");
            console.log("[3] Atualizar Produto");
            console.log("[4] Remover Produto");
            console.log("[5] Voltar");
            const opcao = (0, promptUtils_js_1.input)("Escolha: ");
            switch (opcao) {
                case "1":
                    await this.adicionarProduto();
                    break;
                case "2":
                    await this.listarProdutos();
                    break;
                case "3":
                    await this.atualizarProduto();
                    break;
                case "4":
                    await this.removerProduto();
                    break;
                case "5":
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async adicionarProduto() {
        console.clear();
        console.log("\n=== ➕ ADICIONAR PRODUTO ===");
        const nome = (0, promptUtils_js_1.input)("Nome: ").trim();
        const descricao = (0, promptUtils_js_1.input)("Descrição: ").trim();
        const precoStr = (0, promptUtils_js_1.input)("Preço (R$): ");
        const preco = parseFloat(precoStr);
        if (isNaN(preco) || preco <= 0) {
            console.log("Preço inválido!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log("\nCategorias: [1] Pizza [2] Bebida [3] Sobremesa");
        const catOp = (0, promptUtils_js_1.input)("Categoria: ");
        const categorias = {
            "1": "pizza",
            "2": "bebida",
            "3": "sobremesa"
        };
        const categoria = categorias[catOp];
        if (!categoria) {
            console.log("Categoria inválida!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const result = Produto_js_1.produtoService.criarProduto(nome, descricao, preco, categoria);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async listarProdutos() {
        console.clear();
        console.log("\n=== 📋 LISTA DE PRODUTOS ===");
        const produtos = Produto_js_1.produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto cadastrado.");
        }
        else {
            produtos.forEach(p => {
                const status = p.disponivel ? "✅ Disponível" : "❌ Indisponível";
                console.log(`ID: ${p.id} | ${p.nome} | R$ ${p.preco.toFixed(2)} | ${p.categoria} | ${status}`);
                console.log(`   ${p.descricao}\n`);
            });
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
    }
    async atualizarProduto() {
        console.clear();
        console.log("\n=== ✏️ ATUALIZAR PRODUTO ===");
        const produtos = Produto_js_1.produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto para atualizar.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        produtos.forEach(p => console.log(`${p.id}. ${p.nome} (R$ ${p.preco.toFixed(2)})`));
        const idStr = (0, promptUtils_js_1.input)("\nID do produto: ");
        const id = parseInt(idStr);
        if (isNaN(id)) {
            console.log("ID inválido!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const produto = Produto_js_1.produtoService.buscarPorId(id);
        if (!produto) {
            console.log("Produto não encontrado!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log("\nO que deseja atualizar?");
        console.log("[1] Nome");
        console.log("[2] Descrição");
        console.log("[3] Preço");
        console.log("[4] Categoria");
        console.log("[5] Disponibilidade");
        console.log("[6] Tudo");
        const opcao = (0, promptUtils_js_1.input)("Escolha: ");
        let updates = {};
        switch (opcao) {
            case "1":
                updates.nome = (0, promptUtils_js_1.input)(`Novo nome (${produto.nome}): `).trim() || produto.nome;
                break;
            case "2":
                updates.descricao = (0, promptUtils_js_1.input)(`Nova descrição (${produto.descricao}): `).trim() || produto.descricao;
                break;
            case "3":
                const preco = parseFloat((0, promptUtils_js_1.input)(`Novo preço (${produto.preco}): `));
                if (!isNaN(preco) && preco > 0)
                    updates.preco = preco;
                break;
            case "4":
                console.log("Categorias: [1] Pizza [2] Bebida [3] Sobremesa");
                const catOp = (0, promptUtils_js_1.input)("Nova categoria: ");
                const cats = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
                if (catOp in cats)
                    updates.categoria = cats[catOp];
                break;
            case "5":
                updates.disponivel = (0, promptUtils_js_1.input)("Disponível? (s/n): ").toLowerCase() === 's';
                break;
            case "6":
                updates.nome = (0, promptUtils_js_1.input)(`Nome (${produto.nome}): `).trim() || produto.nome;
                updates.descricao = (0, promptUtils_js_1.input)(`Descrição (${produto.descricao}): `).trim() || produto.descricao;
                const novoPreco = parseFloat((0, promptUtils_js_1.input)(`Preço (${produto.preco}): `));
                if (!isNaN(novoPreco) && novoPreco > 0)
                    updates.preco = novoPreco;
                const catNova = (0, promptUtils_js_1.input)("Categoria (1=pizza,2=bebida,3=sobremesa): ");
                const cats2 = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
                if (catNova in cats2)
                    updates.categoria = cats2[catNova];
                updates.disponivel = (0, promptUtils_js_1.input)("Disponível? (s/n): ").toLowerCase() === 's';
                break;
            default:
                console.log("Opção inválida!");
                (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
                return;
        }
        const result = Produto_js_1.produtoService.atualizarProduto(id, updates);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async removerProduto() {
        console.clear();
        console.log("\n=== 🗑️ REMOVER PRODUTO ===");
        const produtos = Produto_js_1.produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto para remover.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        produtos.forEach(p => console.log(`${p.id}. ${p.nome}`));
        const idStr = (0, promptUtils_js_1.input)("\nID do produto: ");
        const id = parseInt(idStr);
        if (isNaN(id)) {
            console.log("ID inválido!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const produto = Produto_js_1.produtoService.buscarPorId(id);
        if (!produto) {
            console.log("Produto não encontrado!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const confirmar = (0, promptUtils_js_1.input)(`Remover "${produto.nome}"? (s/n): `).toLowerCase() === 's';
        if (!confirmar) {
            console.log("Remoção cancelada.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const result = Produto_js_1.produtoService.removerProduto(id);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async menuPedidos() {
        while (true) {
            console.clear();
            console.log("\n=== 📦 GERENCIAR PEDIDOS ===");
            console.log("[1] Listar Todos os Pedidos");
            console.log("[2] Atualizar Status de Pedido");
            console.log("[3] Voltar");
            const opcao = (0, promptUtils_js_1.input)("Escolha: ");
            switch (opcao) {
                case "1":
                    await this.listarTodosPedidos();
                    break;
                case "2":
                    await this.atualizarStatusPedido();
                    break;
                case "3":
                    return;
                default:
                    console.log("Opção inválida!");
                    (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
            }
        }
    }
    async listarTodosPedidos() {
        console.clear();
        console.log("\n=== 📋 TODOS OS PEDIDOS ===");
        const pedidos = Pedido_js_1.pedidoService.listarPedidos();
        if (pedidos.length === 0) {
            console.log("Nenhum pedido cadastrado.");
        }
        else {
            pedidos.forEach(p => {
                console.log(`\nPedido #${p.id} | Cliente: ${p.clienteNome} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
                console.log(`   Data: ${new Date(p.dataHora).toLocaleString('pt-BR')} | Pagamento: ${(p.formaPagamento || 'dinheiro').toUpperCase()}`);
                if (p.dataHoraStatus) {
                    console.log(`   Última alteração: ${new Date(p.dataHoraStatus).toLocaleString('pt-BR')}`);
                }
                p.itens.forEach(i => console.log(`      ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
                if (p.observacoes)
                    console.log(`   Obs: ${p.observacoes}`);
                console.log("-".repeat(50));
            });
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
    }
    async atualizarStatusPedido() {
        console.clear();
        console.log("\n=== 🔄 ATUALIZAR STATUS ===");
        const pedidosAtivos = Pedido_js_1.pedidoService.listarPedidosAtivos();
        if (pedidosAtivos.length === 0) {
            console.log("Nenhum pedido ativo para atualizar.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        pedidosAtivos.forEach(p => console.log(`${p.id}. ${p.clienteNome} - ${p.status.toUpperCase()}`));
        const idStr = (0, promptUtils_js_1.input)("\nID do pedido: ");
        const id = parseInt(idStr);
        if (isNaN(id)) {
            console.log("ID inválido!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const pedido = Pedido_js_1.pedidoService.buscarPorId(id);
        if (!pedido) {
            console.log("Pedido não encontrado.");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        console.log("\nStatus: [1] Pendente [2] Preparando [3] Pronto [4] Entregue [5] Cancelado");
        const statusOp = (0, promptUtils_js_1.input)("Novo status: ");
        const statusMap = {
            "1": "pendente",
            "2": "preparando",
            "3": "pronto",
            "4": "entregue",
            "5": "cancelado"
        };
        const novoStatus = statusMap[statusOp];
        if (!novoStatus) {
            console.log("Status inválido!");
            (0, promptUtils_js_1.input)("\nPressione ENTER para voltar...");
            return;
        }
        const result = Pedido_js_1.pedidoService.atualizarStatusPedido(id, novoStatus);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
    async gerarRelatorio() {
        console.clear();
        console.log("\n=== 📊 GERAR RELATÓRIO DE VENDAS ===");
        const mesStr = (0, promptUtils_js_1.input)("Mês (1-12, ENTER para atual): ").trim();
        const anoStr = (0, promptUtils_js_1.input)("Ano (ENTER para atual): ").trim();
        const mes = mesStr ? parseInt(mesStr) : undefined;
        const ano = anoStr ? parseInt(anoStr) : undefined;
        const result = Pedido_js_1.pedidoService.gerarRelatorioVendas(mes, ano);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        if (result.caminho) {
            console.log(`📁 Salvo em: ${result.caminho}`);
        }
        (0, promptUtils_js_1.input)("\nPressione ENTER para continuar...");
    }
}
exports.AdminController = AdminController;
