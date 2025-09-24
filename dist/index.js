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
const bcrypt = __importStar(require("bcrypt"));
const path = __importStar(require("path"));
// Importa módulos necessários para manipulação de arquivos, entrada de dados e criptografia de senhas
const input = require("prompt-sync")();
/* ===========================
   DIRETÓRIOS E ARQUIVOS JSON
   =========================== */
const dataDir = path.join(__dirname, "..", "data");
const arquivoUsuarios = path.join(dataDir, "usuarios.json");
const arquivoProdutos = path.join(dataDir, "produtos.json");
const arquivoPedidos = path.join(dataDir, "pedidos.json");
const arquivoPromocoes = path.join(dataDir, "promocoes.json");
// Certifica que a pasta data e os arquivos existem
if (!fs.existsSync(dataDir))
    fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(arquivoUsuarios))
    fs.writeFileSync(arquivoUsuarios, "[]");
if (!fs.existsSync(arquivoProdutos))
    fs.writeFileSync(arquivoProdutos, "[]");
if (!fs.existsSync(arquivoPedidos))
    fs.writeFileSync(arquivoPedidos, "[]");
if (!fs.existsSync(arquivoPromocoes))
    fs.writeFileSync(arquivoPromocoes, "[]");
/* ===========================
   CARREGA DADOS NA MEMÓRIA
   =========================== */
let usuarios = JSON.parse(fs.readFileSync(arquivoUsuarios, "utf-8"));
let produtos = JSON.parse(fs.readFileSync(arquivoProdutos, "utf-8"));
let pedidos = JSON.parse(fs.readFileSync(arquivoPedidos, "utf-8"));
let promocoes = JSON.parse(fs.readFileSync(arquivoPromocoes, "utf-8"));
/* ===========================
   FUNÇÕES DE SALVAR
   =========================== */
function salvarUsuarios() { fs.writeFileSync(arquivoUsuarios, JSON.stringify(usuarios, null, 4)); }
function salvarProdutos() { fs.writeFileSync(arquivoProdutos, JSON.stringify(produtos, null, 4)); }
function salvarPedidos() { fs.writeFileSync(arquivoPedidos, JSON.stringify(pedidos, null, 4)); }
function salvarPromocoes() { fs.writeFileSync(arquivoPromocoes, JSON.stringify(promocoes, null, 4)); }
/* ===========================
   GERADORES DE ID
   =========================== */
function proximoIdProduto() { return produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1; }
function proximoIdPedido() { return pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1; }
function proximoIdPromocao() { return promocoes.length > 0 ? Math.max(...promocoes.map(p => p.id)) + 1 : 1; }
/* ===========================
   SISTEMA DE PROMOÇÕES
   =========================== */
// Inicializa promoções padrão se não existirem
function inicializarPromocoesDefault() {
    if (promocoes.length === 0) {
        const promocoesPadrao = [
            {
                id: 1,
                nome: "Segunda Especial - Pizza Grande",
                descricao: "30% de desconto em todas as pizzas grandes",
                tipoDesconto: "percentual",
                valorDesconto: 30,
                diaSemana: 1,
                categoriaAplicavel: "pizza",
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 2,
                nome: "Terça das Bebidas",
                descricao: "R$ 5,00 de desconto em bebidas",
                tipoDesconto: "valor_fixo",
                valorDesconto: 5,
                diaSemana: 2,
                categoriaAplicavel: "bebida",
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 3,
                nome: "Quarta Doce",
                descricao: "25% off em sobremesas",
                tipoDesconto: "percentual",
                valorDesconto: 25,
                diaSemana: 3,
                categoriaAplicavel: "sobremesa",
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 4,
                nome: "Quinta da Família",
                descricao: "20% em pedidos acima de R$ 50",
                tipoDesconto: "percentual",
                valorDesconto: 20,
                diaSemana: 4,
                categoriaAplicavel: "todos",
                valorMinimoPedido: 50,
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 5,
                nome: "Sexta Premium",
                descricao: "15% em todo o pedido",
                tipoDesconto: "percentual",
                valorDesconto: 15,
                diaSemana: 5,
                categoriaAplicavel: "todos",
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 6,
                nome: "Sábado da Pizza",
                descricao: "R$ 10,00 off em pizzas",
                tipoDesconto: "valor_fixo",
                valorDesconto: 10,
                diaSemana: 6,
                categoriaAplicavel: "pizza",
                ativa: true,
                dataInicio: new Date().toISOString()
            },
            {
                id: 7,
                nome: "Domingo em Família",
                descricao: "25% em pedidos acima de R$ 80",
                tipoDesconto: "percentual",
                valorDesconto: 25,
                diaSemana: 0,
                categoriaAplicavel: "todos",
                valorMinimoPedido: 80,
                ativa: true,
                dataInicio: new Date().toISOString()
            }
        ];
        promocoes = promocoesPadrao;
        salvarPromocoes();
        console.log("Promoções padrão criadas automaticamente!");
    }
}
function obterPromocoesDoDia() {
    const hoje = new Date().getDay();
    const agora = new Date();
    return promocoes.filter(promocao => {
        if (!promocao.ativa)
            return false;
        if (promocao.diaSemana !== hoje)
            return false;
        const dataInicio = new Date(promocao.dataInicio);
        if (agora < dataInicio)
            return false;
        if (promocao.dataFim) {
            const dataFim = new Date(promocao.dataFim);
            if (agora > dataFim)
                return false;
        }
        return true;
    });
}
function exibirPromocoesDoDia() {
    const promocoesDoDia = obterPromocoesDoDia();
    if (promocoesDoDia.length === 0) {
        console.log("🎯 Nenhuma promoção disponível hoje.");
        return;
    }
    console.log("\n🔥 PROMOÇÕES DE HOJE 🔥");
    console.log("═".repeat(50));
    promocoesDoDia.forEach(promocao => {
        console.log(`🎉 ${promocao.nome}`);
        console.log(`   ${promocao.descricao}`);
        if (promocao.valorMinimoPedido) {
            console.log(`   💰 Valor mínimo do pedido: R$ ${promocao.valorMinimoPedido.toFixed(2)}`);
        }
        let aplicavelText = "";
        if (promocao.categoriaAplicavel === "todos") {
            aplicavelText = "Todo o cardápio";
        }
        else if (promocao.categoriaAplicavel) {
            aplicavelText = promocao.categoriaAplicavel.charAt(0).toUpperCase() + promocao.categoriaAplicavel.slice(1) + "s";
        }
        if (promocao.produtoEspecifico) {
            const produto = produtos.find(p => p.id === promocao.produtoEspecifico);
            aplicavelText = produto ? produto.nome : "Produto específico";
        }
        console.log(`   📋 Aplicável em: ${aplicavelText}`);
        console.log("─".repeat(30));
    });
}
function calcularDesconto(produto, quantidade, promocao, precoUnitario) {
    // Verifica se a promoção se aplica ao produto
    if (promocao.produtoEspecifico && promocao.produtoEspecifico !== produto.id) {
        return 0;
    }
    if (promocao.categoriaAplicavel !== "todos" && promocao.categoriaAplicavel !== produto.categoria) {
        return 0;
    }
    const subtotalItem = precoUnitario * quantidade;
    if (promocao.tipoDesconto === "percentual") {
        return subtotalItem * (promocao.valorDesconto / 100);
    }
    else {
        return Math.min(promocao.valorDesconto * quantidade, subtotalItem);
    }
}
/* ===========================
   CRUD PROMOÇÕES (ADMIN)
   =========================== */
function adicionarPromocao() {
    console.log("\n=== ADICIONAR PROMOÇÃO ===");
    const nome = input("Nome da promoção: ");
    const descricao = input("Descrição: ");
    console.log("Tipo de desconto: [1] Percentual [2] Valor fixo");
    const tipoInput = input("Escolha: ");
    const tipoDesconto = tipoInput === "1" ? "percentual" : "valor_fixo";
    let valorDesconto;
    if (tipoDesconto === "percentual") {
        valorDesconto = parseFloat(input("Percentual de desconto (0-100): "));
        if (isNaN(valorDesconto) || valorDesconto < 0 || valorDesconto > 100) {
            console.log("Percentual inválido!");
            return;
        }
    }
    else {
        valorDesconto = parseFloat(input("Valor do desconto (R$): "));
        if (isNaN(valorDesconto) || valorDesconto <= 0) {
            console.log("Valor inválido!");
            return;
        }
    }
    console.log("Dia da semana: [0] Domingo [1] Segunda [2] Terça [3] Quarta [4] Quinta [5] Sexta [6] Sábado");
    const diaSemana = parseInt(input("Escolha o dia: "));
    if (diaSemana < 0 || diaSemana > 6) {
        console.log("Dia inválido!");
        return;
    }
    console.log("Categoria aplicável: [1] Pizzas [2] Bebidas [3] Sobremesas [4] Todos os produtos");
    const categoriaInput = input("Escolha: ");
    let categoriaAplicavel;
    switch (categoriaInput) {
        case "1":
            categoriaAplicavel = "pizza";
            break;
        case "2":
            categoriaAplicavel = "bebida";
            break;
        case "3":
            categoriaAplicavel = "sobremesa";
            break;
        case "4":
            categoriaAplicavel = "todos";
            break;
        default:
            console.log("Categoria inválida!");
            return;
    }
    const valorMinimoInput = input("Valor mínimo do pedido (opcional, ENTER para pular): ");
    const valorMinimoPedido = valorMinimoInput ? parseFloat(valorMinimoInput) : undefined;
    const novaPromocao = {
        id: proximoIdPromocao(),
        nome,
        descricao,
        tipoDesconto,
        valorDesconto,
        diaSemana: diaSemana,
        categoriaAplicavel,
        valorMinimoPedido,
        ativa: true,
        dataInicio: new Date().toISOString()
    };
    promocoes.push(novaPromocao);
    salvarPromocoes();
    console.log("Promoção adicionada com sucesso!");
}
function listarPromocoes() {
    console.log("\n=== LISTA DE PROMOÇÕES ===");
    if (promocoes.length === 0) {
        console.log("Nenhuma promoção cadastrada.");
        return;
    }
    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    promocoes.forEach(promocao => {
        const status = promocao.ativa ? "ATIVA" : "INATIVA";
        console.log(`ID: ${promocao.id} | ${promocao.nome} | ${status}`);
        console.log(`   ${promocao.descricao}`);
        console.log(`   Dia: ${diasSemana[promocao.diaSemana]} | Categoria: ${promocao.categoriaAplicavel}`);
        if (promocao.tipoDesconto === "percentual") {
            console.log(`   Desconto: ${promocao.valorDesconto}%`);
        }
        else {
            console.log(`   Desconto: R$ ${promocao.valorDesconto.toFixed(2)}`);
        }
        if (promocao.valorMinimoPedido) {
            console.log(`   Valor mínimo: R$ ${promocao.valorMinimoPedido.toFixed(2)}`);
        }
        console.log("─".repeat(40));
    });
}
function atualizarPromocao() {
    console.log("\n=== ATUALIZAR PROMOÇÃO ===");
    listarPromocoes();
    if (promocoes.length === 0)
        return;
    const id = parseInt(input("Digite o ID da promoção: "));
    const promocao = promocoes.find(p => p.id === id);
    if (!promocao) {
        console.log("Promoção não encontrada!");
        return;
    }
    console.log("O que deseja atualizar?");
    console.log("[1] Nome [2] Descrição [3] Status (Ativa/Inativa) [4] Valor do desconto [5] Tudo");
    const opcao = input("Escolha: ");
    switch (opcao) {
        case "1":
            promocao.nome = input("Novo nome: ") || promocao.nome;
            break;
        case "2":
            promocao.descricao = input("Nova descrição: ") || promocao.descricao;
            break;
        case "3":
            promocao.ativa = input("Status [1] Ativa [2] Inativa: ") === "1";
            break;
        case "4":
            const novoValor = parseFloat(input("Novo valor: "));
            if (!isNaN(novoValor) && novoValor > 0) {
                promocao.valorDesconto = novoValor;
            }
            break;
        case "5":
            promocao.nome = input(`Nome atual (${promocao.nome}): `) || promocao.nome;
            promocao.descricao = input(`Descrição atual (${promocao.descricao}): `) || promocao.descricao;
            promocao.ativa = input("Status [1] Ativa [2] Inativa: ") === "1";
            const valorNovo = parseFloat(input(`Valor atual (${promocao.valorDesconto}): `));
            if (!isNaN(valorNovo) && valorNovo > 0) {
                promocao.valorDesconto = valorNovo;
            }
            break;
        default:
            console.log("Opção inválida!");
            return;
    }
    salvarPromocoes();
    console.log("Promoção atualizada com sucesso!");
}
function removerPromocao() {
    console.log("\n=== REMOVER PROMOÇÃO ===");
    listarPromocoes();
    if (promocoes.length === 0)
        return;
    const id = parseInt(input("Digite o ID da promoção: "));
    const index = promocoes.findIndex(p => p.id === id);
    if (index === -1) {
        console.log("Promoção não encontrada!");
        return;
    }
    if (input(`Tem certeza que deseja remover "${promocoes[index].nome}"? (s/n): `).toLowerCase() === 's') {
        promocoes.splice(index, 1);
        salvarPromocoes();
        console.log("Promoção removida com sucesso!");
    }
}
function menuPromocoes() {
    while (true) {
        console.log("\n=== CRUD PROMOÇÕES ===");
        console.log("[1] Adicionar Promoção");
        console.log("[2] Listar Promoções");
        console.log("[3] Atualizar Promoção");
        console.log("[4] Remover Promoção");
        console.log("[5] Ver Promoções de Hoje");
        console.log("[6] Voltar");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                adicionarPromocao();
                break;
            case "2":
                listarPromocoes();
                break;
            case "3":
                atualizarPromocao();
                break;
            case "4":
                removerPromocao();
                break;
            case "5":
                exibirPromocoesDoDia();
                break;
            case "6": return;
            default: console.log("Opção inválida!");
        }
    }
}
/* ===========================
   SISTEMA DE PEDIDOS ATUALIZADO
   =========================== */
function criarPedido(clienteEmail, clienteNome, clienteTelefone, clienteEndereco) {
    console.log("\n=== FAZER PEDIDO ===");
    const produtosDisponiveis = produtos.filter(p => p.disponivel);
    if (produtosDisponiveis.length === 0) {
        console.log("Nenhum produto disponível.");
        return;
    }
    // Exibe promoções do dia
    exibirPromocoesDoDia();
    // Mostra cardápio
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║              CARDÁPIO PIZZARIA          ║");
    console.log("╚══════════════════════════════════════════╝\n");
    const categorias = ["pizza", "bebida", "sobremesa"];
    categorias.forEach(cat => {
        let titulo = "";
        if (cat === "pizza")
            titulo = "🍕 PIZZAS";
        if (cat === "bebida")
            titulo = "🥤 BEBIDAS";
        if (cat === "sobremesa")
            titulo = "🍨 SOBREMESAS";
        console.log("\n--- " + titulo + " ---");
        produtosDisponiveis.filter(p => p.categoria === cat).forEach(p => {
            console.log(`${p.id}. ${p.nome} - R$ ${p.preco.toFixed(2)}`);
            console.log(`    ${p.descricao}`);
        });
    });
    const tamanhosPizza = ["Pequena", "Media", "Grande", "Familia"];
    const precosTamanhos = {
        "Pequena": 25, "Media": 35, "Grande": 45, "Familia": 55
    };
    const itens = [];
    const promocoesAplicadas = new Set();
    // Loop para adicionar itens
    while (true) {
        const produtoId = parseInt(input("\nDigite o ID do produto (0 para finalizar): "));
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
        let precoFinal = produto.preco;
        let nomeFinal = produto.nome;
        // Lógica para pizzas (tamanhos)
        if (produto.categoria === "pizza") {
            console.log("Tamanhos disponíveis:");
            tamanhosPizza.forEach((t, i) => {
                console.log(`[${i + 1}] ${t} - R$ ${precosTamanhos[t]}`);
            });
            const tamIdx = parseInt(input("Escolha o tamanho: ")) - 1;
            if (tamIdx >= 0 && tamIdx < tamanhosPizza.length) {
                nomeFinal += ` (${tamanhosPizza[tamIdx]})`;
                precoFinal = precosTamanhos[tamanhosPizza[tamIdx]];
            }
            if (input("Deseja pizza metade-metade? (s/n): ").toLowerCase() === "s") {
                const outroId = parseInt(input("Digite o ID do outro sabor de pizza: "));
                const outroPizza = produtosDisponiveis.find(p => p.id === outroId && p.categoria === "pizza");
                if (outroPizza) {
                    nomeFinal += ` / ${outroPizza.nome}`;
                }
            }
        }
        // Calcula descontos das promoções do dia
        const promocoesDoDia = obterPromocoesDoDia();
        let descontoTotal = 0;
        const promocoesDoItem = [];
        promocoesDoDia.forEach(promocao => {
            const desconto = calcularDesconto(produto, quantidade, promocao, precoFinal);
            if (desconto > 0) {
                descontoTotal += desconto;
                promocoesDoItem.push(promocao.nome);
                promocoesAplicadas.add(promocao.nome);
            }
        });
        const precoOriginal = precoFinal * quantidade;
        const subtotalComDesconto = precoOriginal - descontoTotal;
        const itemExistente = itens.find(item => item.nomeProduto === nomeFinal);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            itemExistente.precoOriginal += precoOriginal;
            itemExistente.descontoAplicado += descontoTotal;
            itemExistente.subtotal += subtotalComDesconto;
            if (promocoesDoItem.length > 0) {
                itemExistente.promocaoAplicada = promocoesDoItem.join(", ");
            }
        }
        else {
            itens.push({
                produtoId: produto.id,
                nomeProduto: nomeFinal,
                quantidade,
                precoUnitario: precoFinal,
                precoOriginal,
                descontoAplicado: descontoTotal,
                subtotal: subtotalComDesconto,
                promocaoAplicada: promocoesDoItem.length > 0 ? promocoesDoItem.join(", ") : undefined
            });
        }
        const totalAtual = itens.reduce((sum, item) => sum + item.subtotal, 0);
        const totalDescontos = itens.reduce((sum, item) => sum + item.descontoAplicado, 0);
        console.log(`Subtotal do item: R$ ${subtotalComDesconto.toFixed(2)}`);
        if (descontoTotal > 0) {
            console.log(`💰 Desconto aplicado: R$ ${descontoTotal.toFixed(2)} (${promocoesDoItem.join(", ")})`);
        }
        console.log(`Total do pedido: R$ ${totalAtual.toFixed(2)}`);
        if (totalDescontos > 0) {
            console.log(`🎉 Total economizado: R$ ${totalDescontos.toFixed(2)}`);
        }
    }
    // Resto da lógica do pedido (tipo entrega, endereço, etc.)
    console.log("\nTipo de pedido:");
    console.log("[1] Entrega");
    console.log("[2] Retirada no local");
    const tipoEntregaInput = input("Escolha uma opção: ");
    let tipoEntrega;
    let enderecoEntrega;
    if (tipoEntregaInput === "1") {
        tipoEntrega = "entrega";
        console.log(`\nSeu endereço cadastrado: ${clienteEndereco.rua}, ${clienteEndereco.numero} - ${clienteEndereco.bairro}`);
        const usarEnderecoCadastrado = input("Usar este endereço? (s/n): ").toLowerCase() === 's';
        if (usarEnderecoCadastrado) {
            enderecoEntrega = clienteEndereco;
        }
        else {
            const rua = input("Rua: ");
            const numero = input("Número: ");
            const bairro = input("Bairro: ");
            enderecoEntrega = { rua, numero, bairro };
        }
    }
    else {
        tipoEntrega = "retirada";
        enderecoEntrega = undefined;
        console.log("Pedido será retirado no local.");
    }
    const observacoes = input("Observações do pedido (opcional): ");
    // Forma de pagamento
    console.log("\nFormas de pagamento:");
    console.log("[1] Dinheiro [2] PIX [3] Débito [4] Crédito");
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
            formaPagamento = "dinheiro";
            break;
    }
    // Verifica promoções que se aplicam ao pedido total
    const subtotalOriginal = itens.reduce((sum, item) => sum + item.precoOriginal, 0);
    let totalDescontos = itens.reduce((sum, item) => sum + item.descontoAplicado, 0);
    let descontoAdicional = 0;
    const promocoesDoDia = obterPromocoesDoDia();
    promocoesDoDia.forEach(promocao => {
        if (promocao.valorMinimoPedido && subtotalOriginal >= promocao.valorMinimoPedido) {
            if (promocao.categoriaAplicavel === "todos") {
                if (promocao.tipoDesconto === "percentual") {
                    descontoAdicional += subtotalOriginal * (promocao.valorDesconto / 100);
                }
                else {
                    descontoAdicional += promocao.valorDesconto;
                }
                promocoesAplicadas.add(promocao.nome);
            }
        }
    });
    const totalFinal = subtotalOriginal - totalDescontos - descontoAdicional;
    // Mostra resumo
    console.log("\n=== RESUMO DO PEDIDO ===");
    console.log(`Tipo: ${tipoEntrega.toUpperCase()}`);
    if (tipoEntrega === "entrega" && enderecoEntrega) {
        console.log(`Endereço: ${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}`);
    }
    console.log(`Forma de pagamento: ${(formaPagamento || "dinheiro").toUpperCase()}`);
    console.log(`Subtotal: R$ ${subtotalOriginal.toFixed(2)}`);
    if (totalDescontos + descontoAdicional > 0) {
        console.log(`Descontos: R$ ${(totalDescontos + descontoAdicional).toFixed(2)}`);
        console.log(`Promoções aplicadas: ${Array.from(promocoesAplicadas).join(", ")}`);
    }
    console.log(`Total final: R$ ${totalFinal.toFixed(2)}`);
    const confirmacao = input("Confirmar pedido? (s/n): ");
    if (confirmacao.toLowerCase() !== 's') {
        console.log("Pedido cancelado.");
        return;
    }
    const novoPedido = {
        id: proximoIdPedido(),
        clienteEmail,
        clienteNome,
        clienteTelefone,
        tipoEntrega,
        enderecoEntrega,
        itens,
        subtotalOriginal,
        totalDescontos: totalDescontos + descontoAdicional,
        total: totalFinal,
        status: "pendente",
        dataHora: new Date().toISOString(),
        formaPagamento,
        observacoes: observacoes || undefined,
        promocoesAplicadas: Array.from(promocoesAplicadas)
    };
    pedidos.push(novoPedido);
    salvarPedidos();
    console.log(`\n🎉 Pedido #${novoPedido.id} criado com sucesso!`);
    console.log(`Status: ${novoPedido.status.toUpperCase()}`);
    console.log(`📅 Data/Hora: ${new Date(novoPedido.dataHora).toLocaleString('pt-BR')}`);
    if (novoPedido.totalDescontos > 0) {
        console.log(`💰 Você economizou: R$ ${novoPedido.totalDescontos.toFixed(2)}`);
    }
    emitirNotaFiscal(novoPedido);
    emitirNotaFiscalTXT(novoPedido);
}
/* ===========================
   FUNÇÕES AUXILIARES ATUALIZADAS
   =========================== */
function emitirNotaFiscalTXT(pedido) {
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
    conteudo += `Forma de pagamento: ${(pedido.formaPagamento || "dinheiro").toUpperCase()}\n\n`;
    conteudo += `Tipo: ${pedido.tipoEntrega.toUpperCase()}\n`;
    if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
        conteudo += `Endereço: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}\n`;
    }
    conteudo += "\nItens:\n";
    pedido.itens.forEach(item => {
        conteudo += `   ${item.quantidade}x ${item.nomeProduto}\n`;
        conteudo += `      Preço original: R$ ${item.precoOriginal.toFixed(2)}\n`;
        if (item.descontoAplicado > 0) {
            conteudo += `      Desconto: R$ ${item.descontoAplicado.toFixed(2)}\n`;
            if (item.promocaoAplicada) {
                conteudo += `      Promoção: ${item.promocaoAplicada}\n`;
            }
        }
        conteudo += `      Subtotal: R$ ${item.subtotal.toFixed(2)}\n`;
    });
    conteudo += `\nSubtotal original: R$ ${pedido.subtotalOriginal.toFixed(2)}\n`;
    if (pedido.totalDescontos > 0) {
        conteudo += `Total de descontos: R$ ${pedido.totalDescontos.toFixed(2)}\n`;
        conteudo += `Promoções aplicadas: ${pedido.promocoesAplicadas.join(", ")}\n`;
    }
    conteudo += `💰 Total final: R$ ${pedido.total.toFixed(2)}\n`;
    if (pedido.observacoes)
        conteudo += `📝 Observações: ${pedido.observacoes}\n`;
    conteudo += "─".repeat(50) + "\n";
    conteudo += "Obrigado pela preferência!\n";
    fs.writeFileSync(filePath, conteudo, { encoding: "utf-8" });
    console.log(`📄 Nota fiscal salva em: ${filePath}`);
}
function emitirNotaFiscal(pedido) {
    console.log("\n=== NOTA FISCAL / COMPROVANTE ===");
    console.log(`Pedido #: ${pedido.id}`);
    console.log(`Cliente: ${pedido.clienteNome} | Tel: ${pedido.clienteTelefone}`);
    console.log(`Data/Hora: ${new Date(pedido.dataHora).toLocaleString('pt-BR')}`);
    console.log(`Tipo: ${pedido.tipoEntrega.toUpperCase()}`);
    if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
        console.log(`Endereço: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}`);
    }
    console.log(`Forma de pagamento: ${(pedido.formaPagamento || "dinheiro").toUpperCase()}`);
    console.log("Itens:");
    pedido.itens.forEach(item => {
        console.log(`   ${item.quantidade}x ${item.nomeProduto}`);
        console.log(`      Preço original: R$ ${item.precoOriginal.toFixed(2)}`);
        if (item.descontoAplicado > 0) {
            console.log(`      Desconto: R$ ${item.descontoAplicado.toFixed(2)}`);
            if (item.promocaoAplicada) {
                console.log(`      Promoção: ${item.promocaoAplicada}`);
            }
        }
        console.log(`      Subtotal: R$ ${item.subtotal.toFixed(2)}`);
    });
    console.log(`\nSubtotal original: R$ ${pedido.subtotalOriginal.toFixed(2)}`);
    if (pedido.totalDescontos > 0) {
        console.log(`Total de descontos: R$ ${pedido.totalDescontos.toFixed(2)}`);
        console.log(`Promoções aplicadas: ${pedido.promocoesAplicadas.join(", ")}`);
    }
    console.log(`💰 Total final: R$ ${pedido.total.toFixed(2)}`);
    if (pedido.observacoes)
        console.log(`📝 Observações: ${pedido.observacoes}`);
    console.log("─".repeat(50));
    console.log("✅ Obrigado pela preferência!");
}
function gerarRelatorioVendas() {
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });
    const relatorioDir = path.join(__dirname, "..", "data", `Relatorio ${mesAtual}`);
    if (!fs.existsSync(relatorioDir))
        fs.mkdirSync(relatorioDir, { recursive: true });
    const relatorioPath = path.join(relatorioDir, "relatorio_vendas.txt");
    const vendasPorDia = {};
    const vendasPorMes = {};
    const promocoesUsadas = {};
    pedidos.forEach(pedido => {
        const dataObj = new Date(pedido.dataHora);
        const dia = dataObj.toLocaleDateString("pt-BR");
        const mes = dataObj.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
        const qtd = pedido.itens.reduce((sum, item) => sum + item.quantidade, 0);
        const valor = pedido.total;
        const descontos = pedido.totalDescontos;
        if (!vendasPorDia[dia])
            vendasPorDia[dia] = { qtd: 0, valor: 0, descontos: 0 };
        vendasPorDia[dia].qtd += qtd;
        vendasPorDia[dia].valor += valor;
        vendasPorDia[dia].descontos += descontos;
        if (!vendasPorMes[mes])
            vendasPorMes[mes] = { qtd: 0, valor: 0, descontos: 0 };
        vendasPorMes[mes].qtd += qtd;
        vendasPorMes[mes].valor += valor;
        vendasPorMes[mes].descontos += descontos;
        // Corrige economia por promoção: soma apenas o desconto do item referente àquela promoção
        pedido.itens.forEach(item => {
            if (item.promocaoAplicada) {
                item.promocaoAplicada.split(",").map(p => p.trim()).forEach(nome => {
                    if (!promocoesUsadas[nome])
                        promocoesUsadas[nome] = { vezes: 0, economia: 0 };
                    promocoesUsadas[nome].vezes += 1;
                    promocoesUsadas[nome].economia += item.descontoAplicado;
                });
            }
        });
    });
    let conteudo = "=== RELATÓRIO DE VENDAS ===\n\n";
    conteudo += "📅 Vendas por dia:\n";
    for (const dia in vendasPorDia) {
        const dados = vendasPorDia[dia];
        conteudo += `   ${dia}: ${dados.qtd} produtos | R$ ${dados.valor.toFixed(2)} | Descontos: R$ ${dados.descontos.toFixed(2)}\n`;
    }
    conteudo += "\n🗓 Vendas por mês:\n";
    for (const mes in vendasPorMes) {
        const dados = vendasPorMes[mes];
        conteudo += `   ${mes}: ${dados.qtd} produtos | R$ ${dados.valor.toFixed(2)} | Descontos: R$ ${dados.descontos.toFixed(2)}\n`;
    }
    conteudo += "\n🎉 Promoções mais usadas:\n";
    Object.entries(promocoesUsadas)
        .sort((a, b) => b[1].vezes - a[1].vezes)
        .forEach(([nome, dados]) => {
        conteudo += `   ${nome}: ${dados.vezes} vezes | Economia total: R$ ${dados.economia.toFixed(2)}\n`;
    });
    const totalGeralQtd = Object.values(vendasPorMes).reduce((s, v) => s + v.qtd, 0);
    const totalGeralValor = Object.values(vendasPorMes).reduce((s, v) => s + v.valor, 0);
    const totalGeralDescontos = Object.values(vendasPorMes).reduce((s, v) => s + v.descontos, 0);
    conteudo += `\n🔢 Total geral:\n`;
    conteudo += `   ${totalGeralQtd} produtos vendidos\n`;
    conteudo += `   R$ ${totalGeralValor.toFixed(2)} em vendas\n`;
    conteudo += `   R$ ${totalGeralDescontos.toFixed(2)} em descontos concedidos\n`;
    conteudo += `   R$ ${(totalGeralValor + totalGeralDescontos).toFixed(2)} seria o total sem promoções\n`;
    fs.writeFileSync(relatorioPath, conteudo, "utf-8");
    console.log(`✅ Relatório gerado em: ${relatorioPath}`);
}
/* ===========================
   CRUD CLIENTES, PRODUTOS E PEDIDOS
   (Mantendo as funções originais)
   =========================== */
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
    else {
        console.log("Remoção cancelada.");
    }
}
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
    if (novoEmail !== cliente.email && usuarios.some(u => u.email === novoEmail)) {
        console.log("Email já em uso por outro usuário. Alteração cancelada.");
        return;
    }
    cliente.email = novoEmail;
    const novoCpf = input(`CPF atual (${cliente.cpf}) - novo (ENTER para manter): `) || cliente.cpf;
    cliente.cpf = novoCpf;
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
    const novoProduto = {
        id: proximoIdProduto(),
        nome,
        descricao,
        preco,
        categoria,
        disponivel: true
    };
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
function listarTodosPedidos() {
    console.log("\n=== TODOS OS PEDIDOS ===");
    if (pedidos.length === 0) {
        console.log("Nenhum pedido cadastrado.");
        return;
    }
    pedidos.forEach(p => {
        console.log(`Pedido #${p.id} | Cliente: ${p.clienteNome} | Status: ${p.status.toUpperCase()} | Total: R$ ${p.total.toFixed(2)}`);
        console.log(`   Data: ${new Date(p.dataHora).toLocaleString('pt-BR')} | Forma: ${(p.formaPagamento || 'dinheiro').toUpperCase()}`);
        if (p.totalDescontos > 0) {
            console.log(`   Desconto total: R$ ${p.totalDescontos.toFixed(2)} | Promoções: ${p.promocoesAplicadas.join(", ")}`);
        }
        if (p.dataHoraStatus)
            console.log(`   Última alteração: ${new Date(p.dataHoraStatus).toLocaleString('pt-BR')}`);
        p.itens.forEach(i => console.log(`      ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`));
        if (p.observacoes)
            console.log(`   Observações: ${p.observacoes}`);
        console.log("-".repeat(40));
    });
}
function atualizarStatusPedido() {
    console.log("\n=== ATUALIZAR STATUS PEDIDO ===");
    if (pedidos.length === 0) {
        console.log("Nenhum pedido cadastrado.");
        return;
    }
    const pedidosAtivos = pedidos.filter(p => p.status !== "entregue" && p.status !== "cancelado");
    if (pedidosAtivos.length === 0) {
        console.log("Nenhum pedido ativo.");
        return;
    }
    pedidosAtivos.forEach(p => {
        console.log(`${p.id}. ${p.clienteNome} | Status: ${p.status.toUpperCase()}`);
    });
    const pedidoId = parseInt(input("Digite o ID do pedido: "));
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
        console.log("Pedido não encontrado.");
        return;
    }
    console.log("[1] Pendente [2] Preparando [3] Pronto [4] Entregue [5] Cancelado");
    const novoStatusInput = input("Escolha o novo status: ");
    const statusMap = {
        "1": "pendente",
        "2": "preparando",
        "3": "pronto",
        "4": "entregue",
        "5": "cancelado"
    };
    if (!(novoStatusInput in statusMap)) {
        console.log("Status inválido!");
        return;
    }
    const agora = new Date().toISOString();
    pedido.status = statusMap[novoStatusInput];
    pedido.dataHoraStatus = agora;
    salvarPedidos();
    console.log(`✅ Status do pedido #${pedido.id} alterado para '${pedido.status.toUpperCase()}'`);
    console.log(`📅 Data/Hora da alteração: ${new Date(pedido.dataHoraStatus).toLocaleString('pt-BR')}`);
}
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
function menuAdmin() {
    while (true) {
        console.log("\n=== MENU ADMINISTRADOR ===");
        console.log("[1] Clientes");
        console.log("[2] Produtos");
        console.log("[3] Pedidos");
        console.log("[4] Promoções");
        console.log("[5] Gerar Relatório de Vendas");
        console.log("[6] Voltar ao Menu Principal");
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
                menuPromocoes();
                break;
            case "5":
                gerarRelatorioVendas();
                break;
            case "6": return;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
}
function menuCliente(usuario) {
    while (true) {
        console.log("\n=== MENU CLIENTE ===");
        console.log("[1] Ver Promoções de Hoje");
        console.log("[2] Ver Cardápio e Fazer Pedido");
        console.log("[3] Meus Pedidos");
        console.log("[4] Meu Endereço");
        console.log("[5] Voltar ao Menu Principal");
        const opcao = input("Escolha uma opção: ");
        switch (opcao) {
            case "1":
                exibirPromocoesDoDia();
                break;
            case "2":
                criarPedido(usuario.email, usuario.nome, usuario.telefone, usuario.endereco);
                break;
            case "3":
                listarMeusPedidos(usuario.email);
                break;
            case "4":
                mostrarMeuEndereco(usuario);
                break;
            case "5": return;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
}
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
        if (p.totalDescontos > 0) {
            console.log(`Desconto aplicado: R$ ${p.totalDescontos.toFixed(2)}`);
            console.log(`Promoções: ${p.promocoesAplicadas.join(", ")}`);
        }
        p.itens.forEach(i => {
            console.log(`   ${i.quantidade}x ${i.nomeProduto} - R$ ${i.subtotal.toFixed(2)}`);
            if (i.promocaoAplicada) {
                console.log(`      (Promoção: ${i.promocaoAplicada})`);
            }
        });
        if (p.observacoes)
            console.log(`Observações: ${p.observacoes}`);
        console.log("──────────────────────────────");
    });
}
function cadastro() {
    console.log("\n=== CADASTRO ===");
    const nome = input("Nome: ");
    const senha = input("Senha: ");
    // CPF
    let cpf = "";
    const cpfRegex = /^\d{11}$/;
    while (true) {
        cpf = input("CPF (apenas números): ");
        if (!cpfRegex.test(cpf) || cpf === "00000000000") {
            console.log("CPF inválido! Digite 11 números válidos.");
        }
        else if (usuarios.find(u => u.cpf === cpf)) {
            console.log("CPF já cadastrado!");
        }
        else {
            break;
        }
    }
    // Email
    let email = "";
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    while (true) {
        email = input("Email: ");
        if (!emailRegex.test(email) || email.length < 6) {
            console.log("Email inválido! Digite um email válido.");
        }
        else {
            break;
        }
    }
    // Telefone
    let telefone = "";
    const telRegex = /^\d{10,11}$/;
    while (true) {
        telefone = input("Telefone (apenas números): ");
        if (!telRegex.test(telefone)) {
            console.log("Telefone inválido! Digite 10 ou 11 números.");
        }
        else {
            break;
        }
    }
    // Data de nascimento
    let dataNascmto = "";
    const dataRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([1-2][0-9]{3})$/;
    while (true) {
        dataNascmto = input("Data de nascimento (DD/MM/AAAA): ");
        if (!dataRegex.test(dataNascmto)) {
            console.log("Data inválida! Use o formato DD/MM/AAAA.");
            continue;
        }
        const [dia, mes, ano] = dataNascmto.split("/").map(Number);
        const dataNascimento = new Date(ano, mes - 1, dia);
        if (dataNascimento > new Date()) {
            console.log("Data inválida! Não pode ser no futuro.");
        }
        else {
            break;
        }
    }
    // Coleta de endereço
    console.log("\n--- ENDEREÇO ---");
    const rua = input("Rua: ");
    const numero = input("Número: ");
    const bairro = input("Bairro: ");
    if (usuarios.find(u => u.cpf === cpf)) {
        console.log("Usuário já existe!");
        return;
    }
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
        dataNascmto
    };
    usuarios.push(novoUsuario);
    salvarUsuarios();
    console.log("Usuário cadastrado com sucesso!");
    const continuar = input("Deseja continuar logado? (s/n): ").toLowerCase();
    if (continuar === "s") {
        if (novoUsuario.tipo === "admin") {
            menuAdmin();
        }
        else {
            menuCliente(novoUsuario);
        }
    }
}
function login() {
    console.log("\n=== LOGIN ===");
    const emailLogin = input("Email: ");
    const senhaLogin = input("Senha: ");
    const user = usuarios.find(u => u.email.toLowerCase() === emailLogin.toLowerCase());
    if (user && bcrypt.compareSync(senhaLogin, user.senha)) {
        console.log(`Bem-vindo, ${user.nome}!`);
        const continuar = input("Deseja continuar? (s/n): ").toLowerCase();
        if (continuar !== "s") {
            console.log("Saindo...");
            return;
        }
        if (user.tipo === "admin") {
            menuAdmin();
        }
        else {
            menuCliente(user);
        }
    }
    else {
        console.log("Usuário ou senha incorretos!");
    }
}
// Inicialização do sistema
inicializarPromocoesDefault();
// Loop principal
while (true) {
    console.log("\n=== SISTEMA PIZZARIA COM PROMOÇÕES ===");
    console.log("[1] Cadastro");
    console.log("[2] Login");
    console.log("[3] Ver Promoções de Hoje");
    console.log("[4] Sair");
    const opcao = input("Escolha uma opção: ");
    switch (opcao) {
        case "1":
            cadastro();
            break;
        case "2":
            login();
            break;
        case "3":
            exibirPromocoesDoDia();
            break;
        case "4":
            console.log("Saindo do sistema...");
            process.exit(0);
        default:
            console.log("Opção inválida!");
            break;
    }
}
