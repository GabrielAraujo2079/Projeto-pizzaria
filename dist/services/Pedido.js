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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DataServices_js_1 = require("./DataServices.js");
const fileUtils_js_1 = require("../utils/fileUtils.js");
class PedidoService {
    listarPedidos() {
        return DataServices_js_1.dataService.getPedidos();
    }
    listarPedidosDoCliente(email) {
        return this.listarPedidos().filter(p => p.clienteEmail === email);
    }
    listarPedidosAtivos() {
        return this.listarPedidos().filter(p => !["entregue", "cancelado"].includes(p.status));
    }
    buscarPorId(id) {
        return DataServices_js_1.dataService.findPedidoById(id);
    }
    criarPedido(clienteEmail, clienteNome, clienteTelefone, itens, total, tipoEntrega, enderecoEntrega, formaPagamento, observacoes) {
        if (itens.length === 0) {
            return { sucesso: false, mensagem: "Pedido deve conter pelo menos um item." };
        }
        const novoPedido = {
            id: DataServices_js_1.dataService.proximoIdPedido(),
            clienteEmail,
            clienteNome,
            clienteTelefone,
            tipoEntrega,
            enderecoEntrega,
            itens,
            total,
            status: "pendente",
            dataHora: new Date().toISOString(),
            formaPagamento: formaPagamento || "dinheiro",
            observacoes
        };
        const pedidos = DataServices_js_1.dataService.getPedidos();
        pedidos.push(novoPedido);
        DataServices_js_1.dataService.setPedidos(pedidos);
        return { sucesso: true, mensagem: `Pedido #${novoPedido.id} criado com sucesso!`, pedido: novoPedido };
    }
    atualizarStatusPedido(id, novoStatus) {
        const pedidos = DataServices_js_1.dataService.getPedidos();
        const index = pedidos.findIndex(p => p.id === id);
        if (index === -1) {
            return { sucesso: false, mensagem: "Pedido não encontrado." };
        }
        pedidos[index] = {
            ...pedidos[index],
            status: novoStatus,
            dataHoraStatus: new Date().toISOString()
        };
        DataServices_js_1.dataService.setPedidos(pedidos);
        return { sucesso: true, mensagem: `Status do pedido #${id} atualizado para "${novoStatus}".`, pedido: pedidos[index] };
    }
    // --- GERAÇÃO DE NOTA FISCAL ---
    gerarConteudoNotaFiscal(pedido) {
        let conteudo = "=== NOTA FISCAL / COMPROVANTE ===\n";
        conteudo += `Pedido #: ${pedido.id}\n`;
        conteudo += `Cliente: ${pedido.clienteNome}\n`;
        conteudo += `Email: ${pedido.clienteEmail}\n`;
        conteudo += `Telefone: ${pedido.clienteTelefone}\n`;
        conteudo += `Data/Hora: ${new Date(pedido.dataHora).toLocaleString("pt-BR")}\n`;
        conteudo += `Forma de pagamento: ${(pedido.formaPagamento ?? "DINHEIRO").toUpperCase()}\n\n`;
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
        return conteudo;
    }
    emitirNotaFiscalTXT(pedido) {
        const notasDir = path.join(process.cwd(), "data", "notas-fiscais");
        (0, fileUtils_js_1.ensureDir)(notasDir);
        const fileName = `nota_pedido_${pedido.id}.txt`;
        const filePath = path.join(notasDir, fileName);
        const conteudo = this.gerarConteudoNotaFiscal(pedido);
        try {
            fs.writeFileSync(filePath, conteudo, "utf-8");
            return filePath;
        }
        catch (error) {
            console.error("[ERRO] Falha ao salvar nota fiscal:", error);
            return null;
        }
    }
    // --- RELATÓRIO DE VENDAS ---
    gerarRelatorioVendas(mes, ano) {
        const now = new Date();
        const mesAlvo = mes ?? now.getMonth() + 1; // Janeiro = 0
        const anoAlvo = ano ?? now.getFullYear();
        const pedidos = this.listarPedidos().filter(p => {
            const data = new Date(p.dataHora);
            return data.getMonth() + 1 === mesAlvo && data.getFullYear() === anoAlvo;
        });
        if (pedidos.length === 0) {
            return { sucesso: false, mensagem: `Nenhum pedido encontrado para ${mesAlvo}/${anoAlvo}.` };
        }
        // Agrupar por dia
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
        // Nome do mês em português
        const nomeMes = new Date(anoAlvo, mesAlvo - 1).toLocaleString("pt-BR", { month: "long" });
        const nomePasta = `Relatorio_${(0, fileUtils_js_1.sanitizeFileName)(nomeMes)}_${anoAlvo}`;
        const relatorioDir = path.join(process.cwd(), "data", nomePasta);
        (0, fileUtils_js_1.ensureDir)(relatorioDir);
        const relatorioPath = path.join(relatorioDir, "relatorio_vendas.txt");
        let conteudo = `=== RELATÓRIO DE VENDAS - ${nomeMes} ${anoAlvo} ===\n\n`;
        conteudo += "📅 Vendas por dia:\n";
        for (const dia in vendasPorDia) {
            conteudo += `   ${dia}: ${vendasPorDia[dia].qtd} produtos | R$ ${vendasPorDia[dia].valor.toFixed(2)}\n`;
        }
        const totalGeralQtd = Object.values(vendasPorDia).reduce((s, v) => s + v.qtd, 0);
        const totalGeralValor = Object.values(vendasPorDia).reduce((s, v) => s + v.valor, 0);
        conteudo += `\n🔢 Total do período: ${totalGeralQtd} produtos | R$ ${totalGeralValor.toFixed(2)}\n`;
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
exports.pedidoService = new PedidoService();
