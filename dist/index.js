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
const fs = __importStar(require("fs"));
const input = require("prompt-sync")();
const bcrypt = __importStar(require("bcrypt"));
const path = __importStar(require("path"));
/* ===========================
   DIRETÓRIOS E ARQUIVOS JSON
   - data/usuarios.json
   - data/produtos.json
   - data/pedidos.json
   =========================== */
const dataDir = path.join(__dirname, "..", "data");
const arquivoUsuarios = path.join(dataDir, "usuarios.json");
const arquivoProdutos = path.join(dataDir, "produtos.json");
const arquivoPedidos = path.join(dataDir, "pedidos.json");
// Certifica que a pasta data e os arquivos existem
if (!fs.existsSync(dataDir))
    fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(arquivoUsuarios))
    fs.writeFileSync(arquivoUsuarios, "[]");
if (!fs.existsSync(arquivoProdutos))
    fs.writeFileSync(arquivoProdutos, "[]");
if (!fs.existsSync(arquivoPedidos))
    fs.writeFileSync(arquivoPedidos, "[]");
/* ===========================
   CARREGA DADOS NA MEMÓRIA
   - Carrega JSON para arrays em runtime
   =========================== */
let usuarios = JSON.parse(fs.readFileSync(arquivoUsuarios, "utf-8"));
let produtos = JSON.parse(fs.readFileSync(arquivoProdutos, "utf-8"));
let pedidos = JSON.parse(fs.readFileSync(arquivoPedidos, "utf-8"));
/* ===========================
   FUNÇÕES DE SALVAR (persistência)
   - Reescrevem os arquivos JSON
   =========================== */
function salvarUsuarios() { fs.writeFileSync(arquivoUsuarios, JSON.stringify(usuarios, null, 4)); }
function salvarProdutos() { fs.writeFileSync(arquivoProdutos, JSON.stringify(produtos, null, 4)); }
function salvarPedidos() { fs.writeFileSync(arquivoPedidos, JSON.stringify(pedidos, null, 4)); }
/* ===========================
   GERADORES DE ID SIMPLES
   - Retornam próximo ID incremental para produtos e pedidos
   =========================== */
function proximoIdProduto() { return produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1; }
function proximoIdPedido() { return pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1; }
/* ===========================
   EMISSÃO DE NOTA FISCAL (TXT)
   - Gera arquivo em data/notas-fiscais/nota_pedido_<id>.txt
   - Também imprime no console via emitirNotaFiscal()
   =========================== */
function emitirNotaFiscalTXT(pedido) {
    // pasta de notas dentro da pasta data (raiz do projeto)
    const notasDir = path.join(__dirname, "..", "data", "notas-fiscais");
    if (!fs.existsSync(notasDir)) {
        fs.mkdirSync(notasDir, { recursive: true });
    }
    const filePath = path.join(notasDir, `nota_pedido_${pedido.id}.txt`);
    let conteudo = "";
    conteudo += "=== NOTA FISCAL / COMPROVANTE ===\n";
    conteudo += `Pedido #: ${pedido.id}\n`;
    conteudo += `Cliente: ${pedido.clienteNome}\n`;
    conteudo += `Email: ${pedido.clienteEmail}\n`;
    conteudo += `Telefone: ${pedido.clienteTelefone}\n`;
    conteudo += `Data/Hora: ${new Date(pedido.dataHora).toLocaleString("pt-BR")}\n`;
    conteudo += `Forma de pagamento: ${pedido.formaPagamento?.toUpperCase() ?? "DINHEIRO"}\n\n`;
    conteudo += `Tipo: ${pedido.tipoEntrega.toUpperCase()}\n`;
    if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
        conteudo += `Endereço de entrega: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}\n`;
    }
    conteudo += "\nItens:\n";
    pedido.itens.forEach(item => {
        conteudo += `   ${item.quantidade}x ${item.nomeProduto} - R$ ${item.subtotal.toFixed(2)}\n`;
    });
    conteudo += `\n💰 Total: R$ ${pedido.total.toFixed(2)}\n`;
    if (pedido.observacoes)
        conteudo += `📝 Observações: ${pedido.observacoes}\n`;
    conteudo += "─".repeat(50) + "\n";
    conteudo += "Obrigado pela preferência!\n";
    fs.writeFileSync(filePath, conteudo, { encoding: "utf-8" });
    console.log(`📄 Nota fiscal salva em: ${filePath}`);
}
/* ===========================
   RELATÓRIO DE VENDAS (ADMIN)
   - Gera arquivo em data/Relatorio <mês>/relatorio_vendas.txt
   - Inclui quantidade de produtos e valor por dia e por mês
   =========================== */
function gerarRelatorioVendas() {
    // Nome do mês atual em português (ex: "setembro")
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });
    // Pasta "data/Relatorio <mês>" na raiz do projeto
    const relatorioDir = path.join(__dirname, "..", "data", `Relatorio ${mesAtual}`);
    if (!fs.existsSync(relatorioDir))
        fs.mkdirSync(relatorioDir, { recursive: true });
    const relatorioPath = path.join(relatorioDir, "relatorio_vendas.txt");
    // Estruturas para armazenar totais por dia e por mês
    const vendasPorDia = {};
    const vendasPorMes = {};
    // Percorre pedidos e acumula
    pedidos.forEach(pedido => {
        const dataObj = new Date(pedido.dataHora);
        const dia = dataObj.toLocaleDateString("pt-BR"); // dd/mm/yyyy
        const mes = dataObj.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }); // mm/yyyy
        const qtd = pedido.itens.reduce((sum, item) => sum + item.quantidade, 0);
        const valor = pedido.total;
        if (!vendasPorDia[dia])
            vendasPorDia[dia] = { qtd: 0, valor: 0 };
        vendasPorDia[dia].qtd += qtd;
        vendasPorDia[dia].valor += valor;
        if (!vendasPorMes[mes])
            vendasPorMes[mes] = { qtd: 0, valor: 0 };
        vendasPorMes[mes].qtd += qtd;
        vendasPorMes[mes].valor += valor;
    });
    // Monta conteúdo do relatório
    let conteudo = "=== RELATÓRIO DE VENDAS ===\n\n";
    conteudo += "📅 Vendas por dia:\n";
    for (const dia in vendasPorDia) {
        conteudo += `   ${dia}: ${vendasPorDia[dia].qtd} produtos vendidos | R$ ${vendasPorDia[dia].valor.toFixed(2)}\n`;
    }
    conteudo += "\n🗓 Vendas por mês:\n";
    for (const mes in vendasPorMes) {
        conteudo += `   ${mes}: ${vendasPorMes[mes].qtd} produtos vendidos | R$ ${vendasPorMes[mes].valor.toFixed(2)}\n`;
    }
    // Total geral consolidado
    const totalGeralQtd = Object.values(vendasPorMes).reduce((s, v) => s + v.qtd, 0);
    const totalGeralValor = Object.values(vendasPorMes).reduce((s, v) => s + v.valor, 0);
    conteudo += `\n🔢 Total geral (todas entradas): ${totalGeralQtd} produtos vendidos | R$ ${totalGeralValor.toFixed(2)}\n`;
    fs.writeFileSync(relatorioPath, conteudo, "utf-8");
    console.log(`✅ Relatório gerado em: ${relatorioPath}`);
}
/* ===========================
   CRUD CLIENTES (ADMIN)
   - Listar, atualizar e remover clientes (tipo 'cliente')
   =========================== */
// Lista apenas usuários do tipo 'cliente'
function listarClientes() {
    console.log("=== LISTA DE CLIENTES ===");
    const clientes = usuarios.filter(u => u.tipo === "cliente");
    if (clientes.length === 0) {
        console.log("Nenhum cliente cadastrado.");
        return;
    }
    clientes.forEach(c => {
        console.log(`Nome: ${c.nome} | Email: ${c.email} | Tel: ${c.telefone} | CPF: ${c.cpf} | Nasc.: ${c.dataNascmto}`);
    });
}
// Remove cliente pelo email
function removerCliente() {
    console.log("=== REMOVER CLIENTE ===");
    listarClientes();
    const email = input("Digite o email do cliente a remover: ");
    const index = usuarios.findIndex(u => u.email === email && u.tipo === "cliente");
    if (index === -1) {
        console.log("Cliente não encontrado.");
        return;
    }
    if (input(`Tem certeza que deseja remover "${usuarios[index].nome}"? (s/n): `).toLowerCase() === "s") {
        usuarios.splice(index, 1);
        salvarUsuarios();
        console.log("Cliente removido com sucesso!");
    }
    else
        console.log("Remoção cancelada.");
}
// Atualiza dados básicos do cliente (nome, email, cpf)
// Nota: não altera a senha aqui (poderia ser uma função separada)
function atualizarCliente() {
    console.log("=== ATUALIZAR CLIENTE ===");
    listarClientes();
    const email = input("Digite o email do cliente a atualizar: ");
    const cliente = usuarios.find(u => u.email === email && u.tipo === "cliente");
    if (!cliente) {
        console.log("Cliente não encontrado.");
        return;
    }
    cliente.nome = input(`Nome atual (${cliente.nome}) - novo (ENTER para manter): `) || cliente.nome;
    const novoEmail = input(`Email atual (${cliente.email}) - novo (ENTER para manter): `) || cliente.email;
    // verifica se não existe outro usuário com o mesmo email
    if (novoEmail !== cliente.email && usuarios.some(u => u.email === novoEmail)) {
        console.log("Email já em uso por outro usuário. Alteração cancelada.");
        return;
    }
    cliente.email = novoEmail;
    const novoCpf = input(`CPF atual (${cliente.cpf}) - novo (ENTER para manter): `) || cliente.cpf;
    cliente.cpf = novoCpf;
    // Atualiza telefone/endereço se desejar
    const novoTel = input(`Telefone atual (${cliente.telefone}) - novo (ENTER para manter): `) || cliente.telefone;
    cliente.telefone = novoTel;
    const desejaAtualizarEndereco = input("Deseja atualizar o endereço? (s/n): ").toLowerCase() === "s";
    if (desejaAtualizarEndereco) {
        const rua = input(`Rua atual (${cliente.endereco.rua}) - novo (ENTER p/ manter): `) || cliente.endereco.rua;
        const numero = input(`Número atual (${cliente.endereco.numero}) - novo (ENTER p/ manter): `) || cliente.endereco.numero;
        const bairro = input(`Bairro atual (${cliente.endereco.bairro}) - novo (ENTER p/ manter): `) || cliente.endereco.bairro;
        cliente.endereco = { rua, numero, bairro };
    }
    salvarUsuarios();
    console.log("Dados do cliente atualizados com sucesso!");
}
// Submenu de clientes (CRUD)
function menuClientes() {
    while (true) {
        console.log("\n=== CRUD CLIENTES ===");
        console.log("[1] Listar Clientes");
        console.log("[2] Atualizar Cliente");
        console.log("[3] Remover Cliente");
        console.log("[4] Voltar");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                listarClientes();
                break;
            case "2":
                atualizarCliente();
                break;
            case "3":
                removerCliente();
                break;
            case "4": return;
            default: console.log("Opção inválida!");
        }
    }
}
/* ===========================
   CRUD PRODUTOS (ADMIN)
   - Adicionar, listar, atualizar e remover produtos
   =========================== */
function adicionarProduto() {
    console.log("=== ADICIONAR PRODUTO ===");
    const nome = input("Nome do produto: ");
    const descricao = input("Descrição: ");
    const preco = parseFloat(input("Preço (R$): "));
    if (isNaN(preco) || preco <= 0) {
        console.log("Preço inválido!");
        return;
    }
    console.log("Categorias: [1] Pizza [2] Bebida [3] Sobremesa");
    const categoriaInput = input("Escolha a categoria: ");
    let categoria;
    switch (categoriaInput) {
        case "1":
            categoria = "pizza";
            break;
        case "2":
            categoria = "bebida";
            break;
        case "3":
            categoria = "sobremesa";
            break;
        default:
            console.log("Categoria inválida!");
            return;
    }
    const novoProduto = { id: proximoIdProduto(), nome, descricao, preco, categoria, disponivel: true };
    produtos.push(novoProduto);
    salvarProdutos();
    console.log(`Produto "${nome}" adicionado com sucesso! ID: ${novoProduto.id}`);
}
function listarProdutos() {
    console.log("=== LISTA DE PRODUTOS ===");
    if (produtos.length === 0) {
        console.log("Nenhum produto cadastrado.");
        return;
    }
    produtos.forEach(produto => {
        const status = produto.disponivel ? "Disponível" : "Indisponível";
        console.log(`ID: ${produto.id} | ${produto.nome} | R$ ${produto.preco.toFixed(2)} | ${produto.categoria} | ${status}`);
        console.log(`   Descrição: ${produto.descricao}\n`);
    });
}
function atualizarProduto() {
    console.log("=== ATUALIZAR PRODUTO ===");
    listarProdutos();
    if (produtos.length === 0)
        return;
    const id = parseInt(input("Digite o ID do produto para atualizar: "));
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        console.log("Produto não encontrado!");
        return;
    }
    console.log("O que deseja atualizar? [1] Nome [2] Descrição [3] Preço [4] Categoria [5] Disponibilidade [6] Tudo");
    const opcao = input("Escolha uma opção: ");
    switch (opcao) {
        case "1":
            produto.nome = input("Novo nome: ") || produto.nome;
            break;
        case "2":
            produto.descricao = input("Nova descrição: ") || produto.descricao;
            break;
        case "3":
            const novoPreco = parseFloat(input("Novo preço: "));
            if (!isNaN(novoPreco) && novoPreco > 0)
                produto.preco = novoPreco;
            break;
        case "4":
            console.log("Categorias: [1] Pizza [2] Bebida [3] Sobremesa");
            const catInput = input("Nova categoria: ");
            const categorias = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
            if (catInput in categorias)
                produto.categoria = categorias[catInput];
            break;
        case "5":
            console.log("Disponibilidade: [1] Disponível [2] Indisponível");
            produto.disponivel = input("Nova disponibilidade: ") === "1";
            break;
        case "6":
            produto.nome = input(`Nome atual (${produto.nome}): `) || produto.nome;
            produto.descricao = input(`Descrição atual (${produto.descricao}): `) || produto.descricao;
            const precoNovo = parseFloat(input(`Preço atual (${produto.preco}): `));
            if (!isNaN(precoNovo) && precoNovo > 0)
                produto.preco = precoNovo;
            const novaCat = input("Nova categoria: ");
            const cats = { "1": "pizza", "2": "bebida", "3": "sobremesa" };
            if (novaCat in cats)
                produto.categoria = cats[novaCat];
            produto.disponivel = input("Disponibilidade: [1] Disponível [2] Indisponível") === "1";
            break;
        default:
            console.log("Opção inválida!");
            return;
    }
    salvarProdutos();
    console.log("Produto atualizado com sucesso!");
}
function removerProduto() {
    console.log("=== REMOVER PRODUTO ===");
    listarProdutos();
    const id = parseInt(input("Digite o ID do produto para remover: "));
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) {
        console.log("Produto não encontrado!");
        return;
    }
    if (input(`Tem certeza que deseja remover "${produtos[index].nome}"? (s/n): `).toLowerCase() === 's') {
        produtos.splice(index, 1);
        salvarProdutos();
        console.log("Produto removido com sucesso!");
    }
}
// Submenu Produtos
function menuProdutos() {
    while (true) {
        console.log("\n=== CRUD PRODUTOS ===");
        console.log("[1] Adicionar Produto");
        console.log("[2] Listar Produtos");
        console.log("[3] Atualizar Produto");
        console.log("[4] Remover Produto");
        console.log("[5] Voltar");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                adicionarProduto();
                break;
            case "2":
                listarProdutos();
                break;
            case "3":
                atualizarProduto();
                break;
            case "4":
                removerProduto();
                break;
            case "5": return;
            default: console.log("Opção inválida!");
        }
    }
}
/* ===========================
   PEDIDOS (CLIENTE + ADMIN)
   - criarPedido: fluxo completo
   - emitirNotaFiscal: console
   - emitirNotaFiscalTXT: arquivo em data/notas-fiscais
   - listarTodosPedidos, atualizarStatusPedido
   =========================== */
// Imprime nota no console (legível) — útil para terminal
function emitirNotaFiscal(pedido) {
    console.log("\n=== NOTA FISCAL / COMPROVANTE ===");
    console.log(`Pedido #: ${pedido.id}`);
    console.log(`Cliente: ${pedido.clienteNome} | Tel: ${pedido.clienteTelefone} | Email: ${pedido.clienteEmail}`);
    console.log(`Data/Hora: ${new Date(pedido.dataHora).toLocaleString('pt-BR')}`);
    console.log(`Tipo: ${pedido.tipoEntrega.toUpperCase()}`);
    if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
        console.log(`Endereço de entrega: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}`);
    }
    console.log(`Forma de pagamento: ${(pedido.formaPagamento ?? "dinheiro").toUpperCase()}`);
    console.log("Itens:");
    pedido.itens.forEach(item => {
        console.log(`   ${item.quantidade}x ${item.nomeProduto} - R$ ${item.subtotal.toFixed(2)}`);
    });
    console.log(`💰 Total: R$ ${pedido.total.toFixed(2)}`);
    if (pedido.observacoes)
        console.log(`📝 Observações: ${pedido.observacoes}`);
    if (pedido.dataHoraStatus)
        console.log(`Última alteração de status: ${new Date(pedido.dataHoraStatus).toLocaleString('pt-BR')}`);
    console.log("─".repeat(50));
    console.log("✅ Obrigado pela preferência!");
}
// Função principal para criar pedido — recebe dados do usuário (apenas os necessários)
// Nota: clienteEndereco vem do objeto Usuario cadastrado (endereco)
function criarPedido(clienteEmail, clienteNome, clienteTelefone, clienteEndereco) {
    console.log("\n=== FAZER PEDIDO ===");
    const produtosDisponiveis = produtos.filter(p => p.disponivel);
    if (produtosDisponiveis.length === 0) {
        console.log("Nenhum produto disponível.");
        return;
    }
    // Mostra cardápio
    console.log("\n=== CARDÁPIO ===");
    produtosDisponiveis.forEach(p => console.log(`${p.id}. ${p.nome} - R$ ${p.preco.toFixed(2)} | ${p.descricao}`));
    const itens = [];
    let total = 0;
    // Loop para adicionar itens
    while (true) {
        const produtoId = parseInt(input("Digite o ID do produto (0 para finalizar): "));
        if (produtoId === 0) {
            if (itens.length === 0) {
                console.log("Pedido cancelado.");
                return;
            }
            break;
        }
        const produto = produtosDisponiveis.find(p => p.id === produtoId);
        if (!produto) {
            console.log("Produto não encontrado!");
            continue;
        }
        const quantidade = parseInt(input(`Quantidade de "${produto.nome}": `));
        if (isNaN(quantidade) || quantidade <= 0) {
            console.log("Quantidade inválida!");
            continue;
        }
        const itemExistente = itens.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            itemExistente.subtotal = itemExistente.quantidade * itemExistente.precoUnitario;
        }
        else {
            itens.push({ produtoId: produto.id, nomeProduto: produto.nome, quantidade, precoUnitario: produto.preco, subtotal: quantidade * produto.preco });
        }
        total = itens.reduce((sum, item) => sum + item.subtotal, 0);
        console.log(`Total até agora: R$ ${total.toFixed(2)}`);
    }
    // Tipo de entrega (entrega ou retirada)
    console.log("\nTipo de pedido:");
    console.log("[1] Entrega");
    console.log("[2] Retirada no local");
    const tipoEntregaInput = input("Escolha uma opção: ");
    let tipoEntrega;
    let enderecoEntrega;
    if (tipoEntregaInput === "1") {
        tipoEntrega = "entrega";
        // Mostra endereço cadastrado (do usuário) e pergunta se deseja usar
        console.log("\nSeu endereço cadastrado:");
        console.log(`${clienteEndereco.rua}, ${clienteEndereco.numero} - ${clienteEndereco.bairro}`);
        const usarEnderecoCadastrado = input("Usar este endereço? (s/n): ").toLowerCase() === 's';
        if (usarEnderecoCadastrado) {
            enderecoEntrega = clienteEndereco;
        }
        else {
            console.log("\n--- ENDEREÇO DE ENTREGA (temporário) ---");
            const rua = input("Rua: ");
            const numero = input("Número: ");
            const bairro = input("Bairro: ");
            enderecoEntrega = { rua, numero, bairro };
        }
    }
    else if (tipoEntregaInput === "2") {
        tipoEntrega = "retirada";
        enderecoEntrega = undefined;
        console.log("Pedido será retirado no local.");
    }
    else {
        console.log("Opção inválida, definindo como retirada.");
        tipoEntrega = "retirada";
        enderecoEntrega = undefined;
    }
    const observacoes = input("Observações do pedido (opcional): ");
    // Forma de pagamento
    console.log("\nFormas de pagamento:");
    console.log("[1] Dinheiro");
    console.log("[2] PIX");
    console.log("[3] Débito");
    console.log("[4] Crédito");
    const pagamentoInput = input("Escolha a forma de pagamento: ");
    let formaPagamento;
    switch (pagamentoInput) {
        case "1":
            formaPagamento = "dinheiro";
            break;
        case "2":
            formaPagamento = "pix";
            break;
        case "3":
            formaPagamento = "debito";
            break;
        case "4":
            formaPagamento = "credito";
            break;
        default:
            console.log("Opção inválida, usando Dinheiro por padrão.");
            formaPagamento = "dinheiro";
            break;
    }
    // Mostra resumo antes de confirmar
    console.log("\n=== RESUMO DO PEDIDO ===");
    console.log(`Tipo: ${tipoEntrega.toUpperCase()}`);
    if (tipoEntrega === "entrega" && enderecoEntrega) {
        console.log(`Endereço: ${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}`);
    }
    console.log(`Forma de pagamento: ${(formaPagamento ?? "dinheiro").toUpperCase()}`);
    console.log(`Total: R$ ${total.toFixed(2)}`);
    const confirmacao = input("Confirmar pedido? (s/n): ");
    if (confirmacao.toLowerCase() !== 's') {
        console.log("Pedido cancelado.");
        return;
    }
    // Monta objeto pedido final e persiste
    const novoPedido = {
        id: proximoIdPedido(),
        clienteEmail,
        clienteNome,
        clienteTelefone,
        tipoEntrega,
        enderecoEntrega,
        itens,
        total,
        status: "pendente",
        dataHora: new Date().toISOString(),
        formaPagamento,
        observacoes: observacoes || undefined
    };
    // Salva em memória e em arquivo
    pedidos.push(novoPedido);
    salvarPedidos();
    // Feedback para usuário
    console.log(`\n🎉 Pedido #${novoPedido.id} criado com sucesso!`);
    console.log(`Status: ${novoPedido.status.toUpperCase()}`);
    console.log(`📅 Data/Hora do pedido: ${new Date(novoPedido.dataHora).toLocaleString('pt-BR')}`);
    console.log(`💳 Forma de pagamento: ${(novoPedido.formaPagamento ?? "dinheiro").toUpperCase()}`);
    console.log(`Tipo: ${tipoEntrega.toUpperCase()}`);
    if (tipoEntrega === "entrega" && enderecoEntrega) {
        console.log(`Endereço: ${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}`);
    }
    // Emite nota no console e em TXT
    emitirNotaFiscal(novoPedido);
    emitirNotaFiscalTXT(novoPedido);
}
// Lista todos os pedidos (visão administrativa)
function listarTodosPedidos() {
    console.log("\n=== TODOS OS PEDIDOS ===");
    if (pedidos.length === 0) {
        console.log("Nenhum pedido cadastrado.");
        return;
    }
    pedidos.forEach(p => {
        console.log(`Pedido #${p.id} | Cliente: ${p.clienteNome} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
        console.log(`   Data: ${new Date(p.dataHora).toLocaleString('pt-BR')} | Forma: ${(p.formaPagamento ?? 'dinheiro').toUpperCase()}`);
        if (p.dataHoraStatus)
            console.log(`   Última alteração: ${new Date(p.dataHoraStatus).toLocaleString('pt-BR')}`);
        p.itens.forEach(i => console.log(`      ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
        if (p.observacoes)
            console.log(`   Observações: ${p.observacoes}`);
        console.log("-".repeat(40));
    });
}
// Atualiza o status de um pedido (ADMIN)
function atualizarStatusPedido() {
    console.log("\n=== ATUALIZAR STATUS PEDIDO ===");
    if (pedidos.length === 0) {
        console.log("Nenhum pedido cadastrado.");
        return;
    }
    // mostra pedidos que não foram entregues/cancelados
    const pedidosAtivos = pedidos.filter(p => p.status !== "entregue" && p.status !== "cancelado");
    if (pedidosAtivos.length === 0) {
        console.log("Nenhum pedido ativo.");
        return;
    }
    pedidosAtivos.forEach(p => console.log(`${p.id}. ${p.clienteNome} | Status: ${p.status.toUpperCase()}`));
    const pedidoId = parseInt(input("Digite o ID do pedido: "));
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
        console.log("Pedido não encontrado.");
        return;
    }
    console.log("[1] Pendente [2] Preparando [3] Pronto [4] Entregue [5] Cancelado");
    const novoStatusInput = input("Escolha o novo status: ");
    const statusMap = { "1": "pendente", "2": "preparando", "3": "pronto", "4": "entregue", "5": "cancelado" };
    if (!(novoStatusInput in statusMap)) {
        console.log("Status inválido!");
        return;
    }
    const agora = new Date().toISOString();
    pedido.status = statusMap[novoStatusInput];
    pedido.dataHoraStatus = agora; // registra data/hora da alteração
    salvarPedidos();
    console.log(`✅ Status do pedido #${pedido.id} alterado para "${pedido.status.toUpperCase()}"`);
    console.log(`📅 Data/Hora da alteração: ${new Date(pedido.dataHoraStatus).toLocaleString('pt-BR')}`);
}
// Submenu Pedidos (CRUD/Admin)
function menuPedidos() {
    while (true) {
        console.log("\n=== CRUD PEDIDOS ===");
        console.log("[1] Listar Pedidos");
        console.log("[2] Atualizar Status de Pedido");
        console.log("[3] Voltar");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                listarTodosPedidos();
                break;
            case "2":
                atualizarStatusPedido();
                break;
            case "3": return;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
}
/* ===========================
   MENUS PRINCIPAIS
   - menuAdmin e menuCliente
   =========================== */
function menuAdmin() {
    while (true) {
        console.log("\n=== MENU ADMINISTRADOR ===");
        console.log("[1] Clientes");
        console.log("[2] Produtos");
        console.log("[3] Pedidos");
        console.log("[4] Gerar Relatório de Vendas");
        console.log("[5] Voltar ao Menu Principal");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                menuClientes();
                break;
            case "2":
                menuProdutos();
                break;
            case "3":
                menuPedidos();
                break;
            case "4":
                gerarRelatorioVendas();
                break;
            case "5": return;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
}
// Menu do cliente (após login)
function menuCliente(usuario) {
    while (true) {
        console.log("\n=== MENU CLIENTE ===");
        console.log("[1] Ver Cardápio e Fazer Pedido");
        console.log("[2] Meus Pedidos");
        console.log("[3] Meu Endereço");
        console.log("[4] Voltar ao Menu Principal");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                // Passa telefone e endereço do usuário para criarPedido
                criarPedido(usuario.email, usuario.nome, usuario.telefone, usuario.endereco);
                break;
            case "2":
                listarMeusPedidos(usuario.email);
                break;
            case "3":
                mostrarMeuEndereco(usuario);
                break;
            case "4": return;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
}
/* ===========================
   FUNÇÕES AUXILIARES (CLIENTE)
   - mostrarMeuEndereco
   - listarMeusPedidos
   =========================== */
function mostrarMeuEndereco(usuario) {
    console.log("\n=== MEU ENDEREÇO ===");
    console.log(`Rua: ${usuario.endereco.rua}`);
    console.log(`Número: ${usuario.endereco.numero}`);
    console.log(`Bairro: ${usuario.endereco.bairro}`);
    console.log(`Telefone: ${usuario.telefone}`);
    const atualizar = input("\nDeseja atualizar seu endereço? (s/n): ").toLowerCase() === 's';
    if (atualizar) {
        console.log("\n--- NOVO ENDEREÇO ---");
        usuario.endereco.rua = input(`Nova rua (atual: ${usuario.endereco.rua}): `) || usuario.endereco.rua;
        usuario.endereco.numero = input(`Novo número (atual: ${usuario.endereco.numero}): `) || usuario.endereco.numero;
        usuario.endereco.bairro = input(`Novo bairro (atual: ${usuario.endereco.bairro}): `) || usuario.endereco.bairro;
        salvarUsuarios();
        console.log("Endereço atualizado com sucesso!");
    }
}
function listarMeusPedidos(clienteEmail) {
    console.log("\n=== MEUS PEDIDOS ===");
    const meusPedidos = pedidos.filter(p => p.clienteEmail === clienteEmail);
    if (meusPedidos.length === 0) {
        console.log("Você ainda não fez pedidos.");
        return;
    }
    meusPedidos.forEach(p => {
        console.log("\n──────────────────────────────");
        console.log(`Pedido #${p.id} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
        console.log(`Data/Hora: ${new Date(p.dataHora).toLocaleString('pt-BR')}`);
        p.itens.forEach(i => console.log(`   ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
        if (p.observacoes)
            console.log(`Observações: ${p.observacoes}`);
        console.log("──────────────────────────────");
    });
}
/* ===========================
   CADASTRO E LOGIN
   - cadastro() pede telefone e endereço
   - login() direciona para menus
   =========================== */
function cadastro() {
    console.log("\n=== CADASTRO ===");
    const nome = input("Nome: ");
    const senha = input("Senha: ");
    const cpf = input("CPF: ");
    const email = input("Email: ");
    const telefone = input("Telefone: ");
    const dataNascmtoInput = input("Data de nascimento (DD/MM/AAAA): ");
    const [dia, mes, ano] = dataNascmtoInput.split("/");
    const dataNascimento = new Date(`${ano}-${mes}-${dia}`);
    if (isNaN(dataNascimento.getTime())) {
        console.log("Data inválida!");
        return;
    }
    if (dataNascimento > new Date()) {
        console.log("Data inválida! Não pode ser no futuro.");
        return;
    }
    if (usuarios.find(u => u.cpf === cpf)) {
        console.log("Usuário já existe!");
        return;
    }
    // Coleta de endereço
    console.log("\n--- ENDEREÇO ---");
    const rua = input("Rua: ");
    const numero = input("Número: ");
    const bairro = input("Bairro: ");
    const senhaHash = bcrypt.hashSync(senha, 10);
    let tipo;
    if (usuarios.length === 0) {
        tipo = "admin";
        console.log("Primeiro usuário cadastrado como ADMIN.");
    }
    else {
        tipo = input("Chave de admin (vazio para cliente): ") === "1234" ? "admin" : "cliente";
    }
    const novoUsuario = {
        nome,
        senha: senhaHash,
        cpf,
        email,
        telefone,
        endereco: { rua, numero, bairro },
        tipo,
        dataNascmto: dataNascimento.toISOString().split("T")[0]
    };
    usuarios.push(novoUsuario);
    salvarUsuarios();
    console.log("Usuário cadastrado com sucesso!");
    // NOVA FUNCIONALIDADE: Login automático após cadastro
    const continuarLogado = input("\nDeseja continuar logado? (s/n): ").toLowerCase() === 's';
    if (continuarLogado) {
        console.log(`\nBem-vindo ao sistema, ${novoUsuario.nome}!`);
        console.log(`Você está logado como: ${novoUsuario.tipo.toUpperCase()}`);
        // Redireciona para o menu apropriado
        if (novoUsuario.tipo === "admin") {
            menuAdmin();
        }
        else {
            menuCliente(novoUsuario);
        }
    }
    else {
        console.log("Voltando ao menu principal...");
    }
}
function login() {
    console.log("\n=== LOGIN ===");
    const emailLogin = input("Email: ");
    const senhaLogin = input("Senha: ");
    const user = usuarios.find(u => u.email.toLowerCase() === emailLogin.toLowerCase());
    if (user && bcrypt.compareSync(senhaLogin, user.senha)) {
        console.log(`Bem-vindo, ${user.nome}!`);
        if (user.tipo === "admin")
            menuAdmin();
        else
            menuCliente(user);
    }
    else
        console.log("Usuário ou senha incorretos!");
}
/* ===========================
   LOOP PRINCIPAL
   - Menu inicial: cadastro, login, sair
   =========================== */
while (true) {
    console.log("\n=== SISTEMA PIZZARIA ===");
    console.log("[1] Cadastro");
    console.log("[2] Login");
    console.log("[3] Sair");
    const opcao = input("Escolha uma opção: ");
    switch (opcao) {
        case "1":
            cadastro();
            break;
        case "2":
            login();
            break;
        case "3":
            console.log("Saindo do sistema...");
            process.exit(0);
        default:
            console.log("Opção inválida!");
            break;
    }
}
