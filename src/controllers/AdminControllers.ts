// Importa funções utilitárias e serviços
import { input } from "../utils/promptUtils.js";
import { usuarioService } from "../services/Usuario.js";
import { produtoService } from "../services/Produto.js";
import { pedidoService } from "../services/Pedido.js";
import { Usuario } from "../models/index.js";

// Controlador para funcionalidades exclusivas do administrador
export class AdminController {
    // Recebe o usuário logado como admin
    constructor(private admin: Usuario) {}

    // Menu principal do administrador
    async iniciar(): Promise<void> {
        while (true) {
            console.clear();
            console.log(`\n=== 👨‍💼 MENU ADMIN (${this.admin.nome}) ===`);
            console.log("[1] Gerenciar Clientes");
            console.log("[2] Gerenciar Produtos");
            console.log("[3] Gerenciar Pedidos");
            console.log("[4] Gerar Relatório de Vendas");
            console.log("[5] Voltar ao Menu Principal");

            const opcao = input("Escolha uma opção: ");

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
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Submenu de gerenciamento de clientes
    private async menuClientes(): Promise<void> {
        while (true) {
            console.clear();
            console.log("\n=== 👥 GERENCIAR CLIENTES ===");
            console.log("[1] Listar Clientes");
            console.log("[2] Atualizar Cliente");
            console.log("[3] Remover Cliente");
            console.log("[4] Voltar");

            const opcao = input("Escolha: ");

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
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Lista todos os clientes cadastrados
    private async listarClientes(): Promise<void> {
        console.clear();
        console.log("\n=== 📋 LISTA DE CLIENTES ===");
        const clientes = usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente cadastrado.");
        } else {
            clientes.forEach(c => {
                console.log(`Nome: ${c.nome} | Email: ${c.email} | Tel: ${c.telefone} | CPF: ${c.cpf}`);
            });
        }
        input("\nPressione ENTER para voltar...");
    }

    // Permite atualizar os dados de um cliente específico
    private async atualizarCliente(): Promise<void> {
        console.clear();
        console.log("\n=== ✏️ ATUALIZAR CLIENTE ===");

        const clientes = usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente para atualizar.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        clientes.forEach(c => console.log(`- ${c.email} (${c.nome})`));
        const email = input("\nEmail do cliente a atualizar: ").trim();

        const cliente = usuarioService.buscarPorEmail(email);
        if (!cliente || cliente.tipo !== "cliente") {
            console.log("Cliente não encontrado.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        // Coleta novos dados (mantém os atuais se não preenchidos)
        const nome = input(`Nome (${cliente.nome}): `).trim() || cliente.nome;
        const novoEmail = input(`Email (${cliente.email}): `).trim() || cliente.email;
        const cpf = input(`CPF (${cliente.cpf}): `).trim() || cliente.cpf;
        const telefone = input(`Telefone (${cliente.telefone}): `).trim() || cliente.telefone;

        const atualizarEndereco = input("Atualizar endereço? (s/n): ").toLowerCase() === 's';
        let endereco = cliente.endereco;
        if (atualizarEndereco) {
            endereco = {
                rua: input(`Rua (${cliente.endereco.rua}): `).trim() || cliente.endereco.rua,
                numero: input(`Número (${cliente.endereco.numero}): `).trim() || cliente.endereco.numero,
                bairro: input(`Bairro (${cliente.endereco.bairro}): `).trim() || cliente.endereco.bairro
            };
        }

        const result = usuarioService.atualizarUsuario(email, {
            nome, email: novoEmail, cpf, telefone, endereco
        });

        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Remove um cliente
    private async removerCliente(): Promise<void> {
        console.clear();
        console.log("\n=== 🗑️ REMOVER CLIENTE ===");

        const clientes = usuarioService.listarClientes();
        if (clientes.length === 0) {
            console.log("Nenhum cliente para remover.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        clientes.forEach(c => console.log(`- ${c.email} (${c.nome})`));
        const email = input("\nEmail do cliente a remover: ").trim();

        const cliente = usuarioService.buscarPorEmail(email);
        if (!cliente || cliente.tipo !== "cliente") {
            console.log("Cliente não encontrado.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const confirmar = input(`Tem certeza que deseja remover "${cliente.nome}"? (s/n): `).toLowerCase() === 's';
        if (!confirmar) {
            console.log("Remoção cancelada.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const result = usuarioService.removerUsuario(email);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Submenu de gerenciamento de produtos
    private async menuProdutos(): Promise<void> {
        while (true) {
            console.clear();
            console.log("\n=== 🍕 GERENCIAR PRODUTOS ===");
            console.log("[1] Adicionar Produto");
            console.log("[2] Listar Produtos");
            console.log("[3] Atualizar Produto");
            console.log("[4] Remover Produto");
            console.log("[5] Voltar");

            const opcao = input("Escolha: ");

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
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Adiciona um novo produto ao cardápio
    private async adicionarProduto(): Promise<void> {
        console.clear();
        console.log("\n=== ➕ ADICIONAR PRODUTO ===");

        const nome = input("Nome: ").trim();
        const descricao = input("Descrição: ").trim();
        const precoStr = input("Preço (R$): ");
        const preco = parseFloat(precoStr);

        if (isNaN(preco) || preco <= 0) {
            console.log("Preço inválido!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        // Escolha da categoria
        console.log("\nCategorias: [1] Pizza [2] Bebida [3] Sobremesa");
        const catOp = input("Categoria: ");
        const categorias: Record<string, "pizza" | "bebida" | "sobremesa"> = {
            "1": "pizza",
            "2": "bebida",
            "3": "sobremesa"
        };
        const categoria = categorias[catOp];

        if (!categoria) {
            console.log("Categoria inválida!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const result = produtoService.criarProduto(nome, descricao, preco, categoria);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Lista todos os produtos cadastrados
    private async listarProdutos(): Promise<void> {
        console.clear();
        console.log("\n=== 📋 LISTA DE PRODUTOS ===");

        const produtos = produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto cadastrado.");
        } else {
            produtos.forEach(p => {
                const status = p.disponivel ? "✅ Disponível" : "❌ Indisponível";
                console.log(`ID: ${p.id} | ${p.nome} | R$ ${p.preco.toFixed(2)} | ${p.categoria} | ${status}`);
                console.log(`   ${p.descricao}\n`);
            });
        }
        input("\nPressione ENTER para voltar...");
    }

    // Atualiza dados de um produto existente
    private async atualizarProduto(): Promise<void> {
        console.clear();
        console.log("\n=== ✏️ ATUALIZAR PRODUTO ===");

        const produtos = produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto para atualizar.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        produtos.forEach(p => console.log(`${p.id}. ${p.nome} (R$ ${p.preco.toFixed(2)})`));
        const idStr = input("\nID do produto: ");
        const id = parseInt(idStr);

        if (isNaN(id)) {
            console.log("ID inválido!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const produto = produtoService.buscarPorId(id);
        if (!produto) {
            console.log("Produto não encontrado!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        console.log("\nO que deseja atualizar?");
        console.log("[1] Nome");
        console.log("[2] Descrição");
        console.log("[3] Preço");
        console.log("[4] Categoria");
        console.log("[5] Disponibilidade");
        console.log("[6] Tudo");

        const opcao = input("Escolha: ");
        let updates: Partial<any> = {};

        // Aplica a atualização com base na opção
        switch (opcao) {
            case "1":
                updates.nome = input(`Novo nome (${produto.nome}): `).trim() || produto.nome;
                break;
            case "2":
                updates.descricao = input(`Nova descrição (${produto.descricao}): `).trim() || produto.descricao;
                break;
            case "3":
                const preco = parseFloat(input(`Novo preço (${produto.preco}): `));
                if (!isNaN(preco) && preco > 0) updates.preco = preco;
                break;
            case "4":
                console.log("Categorias: [1] Pizza [2] Bebida [3] Sobremesa");
                const catOp = input("Nova categoria: ");
                const cats: Record<string, any> = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
                if (catOp in cats) updates.categoria = cats[catOp];
                break;
            case "5":
                updates.disponivel = input("Disponível? (s/n): ").toLowerCase() === 's';
                break;
            case "6":
                updates.nome = input(`Nome (${produto.nome}): `).trim() || produto.nome;
                updates.descricao = input(`Descrição (${produto.descricao}): `).trim() || produto.descricao;
                const novoPreco = parseFloat(input(`Preço (${produto.preco}): `));
                if (!isNaN(novoPreco) && novoPreco > 0) updates.preco = novoPreco;
                const catNova = input("Categoria (1=pizza,2=bebida,3=sobremesa): ");
                const cats2: Record<string, any> = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
                if (catNova in cats2) updates.categoria = cats2[catNova];
                updates.disponivel = input("Disponível? (s/n): ").toLowerCase() === 's';
                break;
            default:
                console.log("Opção inválida!");
                input("\nPressione ENTER para voltar...");
                return;
        }

        const result = produtoService.atualizarProduto(id, updates);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Remove um produto do cardápio
    private async removerProduto(): Promise<void> {
        console.clear();
        console.log("\n=== 🗑️ REMOVER PRODUTO ===");

        const produtos = produtoService.listarProdutos();
        if (produtos.length === 0) {
            console.log("Nenhum produto para remover.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        produtos.forEach(p => console.log(`${p.id}. ${p.nome}`));
        const idStr = input("\nID do produto: ");
        const id = parseInt(idStr);

        if (isNaN(id)) {
            console.log("ID inválido!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const produto = produtoService.buscarPorId(id);
        if (!produto) {
            console.log("Produto não encontrado!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const confirmar = input(`Remover "${produto.nome}"? (s/n): `).toLowerCase() === 's';
        if (!confirmar) {
            console.log("Remoção cancelada.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const result = produtoService.removerProduto(id);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Submenu de gerenciamento de pedidos
    private async menuPedidos(): Promise<void> {
        while (true) {
            console.clear();
            console.log("\n=== 📦 GERENCIAR PEDIDOS ===");
            console.log("[1] Listar Todos os Pedidos");
            console.log("[2] Atualizar Status de Pedido");
            console.log("[3] Voltar");

            const opcao = input("Escolha: ");

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
                    input("\nPressione ENTER para continuar...");
            }
        }
    }

    // Lista todos os pedidos cadastrados
    private async listarTodosPedidos(): Promise<void> {
        console.clear();
        console.log("\n=== 📋 TODOS OS PEDIDOS ===");

        const pedidos = pedidoService.listarPedidos();
        if (pedidos.length === 0) {
            console.log("Nenhum pedido cadastrado.");
        } else {
            pedidos.forEach(p => {
                console.log(`\nPedido #${p.id} | Cliente: ${p.clienteNome} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
                console.log(`   Data: ${new Date(p.dataHora).toLocaleString('pt-BR')} | Pagamento: ${(p.formaPagamento || 'dinheiro').toUpperCase()}`);
                if (p.dataHoraStatus) {
                    console.log(`   Última alteração: ${new Date(p.dataHoraStatus).toLocaleString('pt-BR')}`);
                }
                p.itens.forEach(i => console.log(`      ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
                if (p.observacoes) console.log(`   Obs: ${p.observacoes}`);
                console.log("-".repeat(50));
            });
        }

        input("\nPressione ENTER para voltar...");
    }

    // Atualiza o status de um pedido (ex: para "pronto", "entregue", etc.)
    private async atualizarStatusPedido(): Promise<void> {
        console.clear();
        console.log("\n=== 🔄 ATUALIZAR STATUS ===");

        const pedidosAtivos = pedidoService.listarPedidosAtivos();
        if (pedidosAtivos.length === 0) {
            console.log("Nenhum pedido ativo para atualizar.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        pedidosAtivos.forEach(p => console.log(`${p.id}. ${p.clienteNome} - ${p.status.toUpperCase()}`));
        const idStr = input("\nID do pedido: ");
        const id = parseInt(idStr);

        if (isNaN(id)) {
            console.log("ID inválido!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const pedido = pedidoService.buscarPorId(id);
        if (!pedido) {
            console.log("Pedido não encontrado.");
            input("\nPressione ENTER para voltar...");
            return;
        }

        console.log("\nStatus: [1] Pendente [2] Preparando [3] Pronto [4] Entregue [5] Cancelado");
        const statusOp = input("Novo status: ");
        const statusMap: Record<string, any> = {
            "1": "pendente",
            "2": "preparando",
            "3": "pronto",
            "4": "entregue",
            "5": "cancelado"
        };
        const novoStatus = statusMap[statusOp];

        if (!novoStatus) {
            console.log("Status inválido!");
            input("\nPressione ENTER para voltar...");
            return;
        }

        const result = pedidoService.atualizarStatusPedido(id, novoStatus);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        input("\nPressione ENTER para continuar...");
    }

    // Gera relatório de vendas por mês/ano
    private async gerarRelatorio(): Promise<void> {
        console.clear();
        console.log("\n=== 📊 GERAR RELATÓRIO DE VENDAS ===");

        const mesStr = input("Mês (1-12, ENTER para atual): ").trim();
        const anoStr = input("Ano (ENTER para atual): ").trim();

        const mes = mesStr ? parseInt(mesStr) : undefined;
        const ano = anoStr ? parseInt(anoStr) : undefined;

        const result = pedidoService.gerarRelatorioVendas(mes, ano);
        console.log(result.sucesso ? "✅ " + result.mensagem : "❌ " + result.mensagem);
        if (result.caminho) {
            console.log(`📁 Salvo em: ${result.caminho}`);
        }

        input("\nPressione ENTER para continuar...");
    }
}
