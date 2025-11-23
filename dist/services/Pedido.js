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
exports.pedidoService = void 0;
// Importa módulos do Node.js
const fs = __importStar(require("fs")); // Módulo para manipulação de arquivos
const path = __importStar(require("path")); // Módulo para manipulação de caminhos de diretórios/arquivos
// Importa o serviço de dados centralizado
const DataServices_js_1 = require("./DataServices.js");
// Funções utilitárias para manipulação de diretórios e sanitização de nomes
const fileUtils_js_1 = require("../utils/fileUtils.js");
// Classe responsável por toda a lógica de pedidos
class PedidoService {
    // Lista todos os pedidos cadastrados
    listarPedidos() {
        return DataServices_js_1.dataService.getPedidos();
    }
    // Lista apenas os pedidos de um cliente específico, filtrando pelo e-mail
    listarPedidosDoCliente(email) {
        return this.listarPedidos().filter(p => p.clienteEmail === email);
    }
    // Lista pedidos que ainda não foram finalizados (pendentes, preparando, prontos)
    listarPedidosAtivos() {
        return this.listarPedidos().filter(p => !["entregue", "cancelado"].includes(p.status));
    }
    // Busca um pedido pelo seu ID único
    buscarPorId(id) {
        return DataServices_js_1.dataService.findPedidoById(id);
    }
    // Cria e registra um novo pedido no sistema
    criarPedido(clienteEmail, clienteNome, clienteTelefone, itens, total, tipoEntrega, enderecoEntrega, // só necessário para entrega
    formaPagamento, observacoes) {
        // Validação: o pedido precisa ter pelo menos 1 item
        if (itens.length === 0) {
            return { sucesso: false, mensagem: "Pedido deve conter pelo menos um item." };
        }
        // Criação do objeto pedido
        const novoPedido = {
            id: DataServices_js_1.dataService.proximoIdPedido(), // gera ID único
            clienteEmail,
            clienteNome,
            clienteTelefone,
            tipoEntrega,
            enderecoEntrega,
            itens,
            total,
            status: "pendente", // todo pedido começa como "pendente"
            dataHora: new Date().toISOString(), // salva a data/hora de criação
            formaPagamento: formaPagamento || "dinheiro", // padrão: dinheiro
            observacoes
        };
        // Salva o pedido na lista de pedidos existente
        const pedidos = DataServices_js_1.dataService.getPedidos();
        pedidos.push(novoPedido);
        DataServices_js_1.dataService.setPedidos(pedidos);
        // Retorna sucesso
        return { sucesso: true, mensagem: `Pedido #${novoPedido.id} criado com sucesso!`, pedido: novoPedido };
    }
    // Atualiza o status de um pedido (pendente → preparando → pronto → entregue ou cancelado)
    atualizarStatusPedido(id, novoStatus) {
        const pedidos = DataServices_js_1.dataService.getPedidos();
        const index = pedidos.findIndex(p => p.id === id); // busca pelo índice
        if (index === -1) {
            return { sucesso: false, mensagem: "Pedido não encontrado." };
        }
        // Atualiza o status e adiciona a data/hora da mudança
        pedidos[index] = {
            ...pedidos[index],
            status: novoStatus,
            dataHoraStatus: new Date().toISOString()
        };
        DataServices_js_1.dataService.setPedidos(pedidos);
        return { sucesso: true, mensagem: `Status do pedido #${id} atualizado para "${novoStatus}".`, pedido: pedidos[index] };
    }
    // Gera o conteúdo textual da nota fiscal (formato TXT)
    gerarConteudoNotaFiscal(pedido) {
        let conteudo = "=== NOTA FISCAL / COMPROVANTE ===\n";
        conteudo += `Pedido #: ${pedido.id}\n`;
        conteudo += `Cliente: ${pedido.clienteNome}\n`;
        conteudo += `Email: ${pedido.clienteEmail}\n`;
        conteudo += `Telefone: ${pedido.clienteTelefone}\n`;
        conteudo += `Data/Hora: ${new Date(pedido.dataHora).toLocaleString("pt-BR")}\n`;
        conteudo += `Forma de pagamento: ${(pedido.formaPagamento ?? "DINHEIRO").toUpperCase()}\n\n`;
        conteudo += `Tipo: ${pedido.tipoEntrega.toUpperCase()}\n`;
        // Se for entrega, mostra endereço
        if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
            conteudo += `Endereço de entrega: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}\n`;
        }
        // Lista os itens comprados
        conteudo += "\nItens:\n";
        pedido.itens.forEach(item => {
            conteudo += `   ${item.quantidade}x ${item.nomeProduto} - R$ ${item.subtotal.toFixed(2)}\n`;
        });
        // Mostra total e observações
        conteudo += `\n💰 Total: R$ ${pedido.total.toFixed(2)}\n`;
        if (pedido.observacoes)
            conteudo += `📝 Observações: ${pedido.observacoes}\n`;
        conteudo += "─".repeat(50) + "\n";
        conteudo += "Obrigado pela preferência!\n";
        return conteudo;
    }
    // Salva a nota fiscal em arquivo TXT dentro da pasta "data/notas-fiscais"
    emitirNotaFiscalTXT(pedido) {
        const notasDir = path.join(process.cwd(), "data", "notas-fiscais");
        (0, fileUtils_js_1.ensureDir)(notasDir); // garante que a pasta existe
        const fileName = `nota_pedido_${pedido.id}.txt`;
        const filePath = path.join(notasDir, fileName);
        const conteudo = this.gerarConteudoNotaFiscal(pedido);
        try {
            fs.writeFileSync(filePath, conteudo, "utf-8");
            return filePath; // retorna caminho da nota
        }
        catch (error) {
            console.error("[ERRO] Falha ao salvar nota fiscal:", error);
            return null;
        }
    }
    // Gera relatório de vendas de um mês/ano específico
    gerarRelatorioVendas(mes, ano) {
        const now = new Date();
        const mesAlvo = mes ?? now.getMonth() + 1; // se não informado, usa o mês atual
        const anoAlvo = ano ?? now.getFullYear(); // se não informado, usa o ano atual
        // Filtra apenas pedidos do período desejado
        const pedidos = this.listarPedidos().filter(p => {
            const data = new Date(p.dataHora);
            return data.getMonth() + 1 === mesAlvo && data.getFullYear() === anoAlvo;
        });
        if (pedidos.length === 0) {
            return { sucesso: false, mensagem: `Nenhum pedido encontrado para ${mesAlvo}/${anoAlvo}.` };
        }
        // Agrupa vendas por dia
        const vendasPorDia = {};
        pedidos.forEach(p => {
            const dia = new Date(p.dataHora).toLocaleDateString("pt-BR");
            const qtd = p.itens.reduce((sum, item) => sum + item.quantidade, 0);
            const valor = p.total;
            if (!vendasPorDia[dia])
                vendasPorDia[dia] = { qtd: 0, valor: 0 };
            vendasPorDia[dia].qtd += qtd;
            vendasPorDia[dia].valor += valor;
        });
        // Nome do mês em português (para pasta de relatório)
        const nomeMes = new Date(anoAlvo, mesAlvo - 1).toLocaleString("pt-BR", { month: "long" });
        const nomePasta = `Relatorio_${(0, fileUtils_js_1.sanitizeFileName)(nomeMes)}_${anoAlvo}`;
        // Garante que o diretório existe
        const relatorioDir = path.join(process.cwd(), "data", nomePasta);
        (0, fileUtils_js_1.ensureDir)(relatorioDir);
        // Caminho do arquivo final
        const relatorioPath = path.join(relatorioDir, "relatorio_vendas.txt");
        // Monta o conteúdo do relatório
        let conteudo = `=== RELATÓRIO DE VENDAS - ${nomeMes} ${anoAlvo} ===\n\n`;
        conteudo += "📅 Vendas por dia:\n";
        for (const dia in vendasPorDia) {
            conteudo += `   ${dia}: ${vendasPorDia[dia].qtd} produtos | R$ ${vendasPorDia[dia].valor.toFixed(2)}\n`;
        }
        // Calcula totais gerais
        const totalGeralQtd = Object.values(vendasPorDia).reduce((s, v) => s + v.qtd, 0);
        const totalGeralValor = Object.values(vendasPorDia).reduce((s, v) => s + v.valor, 0);
        conteudo += `\n🔢 Total do período: ${totalGeralQtd} produtos | R$ ${totalGeralValor.toFixed(2)}\n`;
        // Salva no arquivo
        try {
            fs.writeFileSync(relatorioPath, conteudo, "utf-8");
            return { sucesso: true, mensagem: "Relatório gerado com sucesso!", caminho: relatorioPath };
        }
        catch (error) {
            console.error("[ERRO] Falha ao gerar relatório:", error);
            return { sucesso: false, mensagem: "Erro ao salvar relatório." };
        }
    }
}
// Exporta instância do serviço (singleton)
exports.pedidoService = new PedidoService();
