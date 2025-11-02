"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotaFiscalService = exports.RelatorioService = exports.PromocaoService = exports.PedidoService = void 0;
class PedidoService {
    constructor(pedidoRepo, promocaoService) {
        this.pedidoRepo = pedidoRepo;
        this.promocaoService = promocaoService;
    }
    async criarPedido(pedido) {
        // Aplicar promoções antes de salvar
        await this.aplicarPromocoes(pedido);
        pedido.recalcularTotal();
        return await this.pedidoRepo.create(pedido);
    }
    async aplicarPromocoes(pedido) {
        for (const item of pedido.itens) {
            const { desconto, promocao } = await this.promocaoService.aplicarPromocaoAoItem({ id: item.produtoId, nome: item.nomeProduto }, item.quantidade);
            item.descontoAplicado = desconto;
            if (promocao) {
                item.promocaoAplicada = promocao.nome;
                if (!pedido.promocoesAplicadas.includes(promocao.nome)) {
                    pedido.promocoesAplicadas.push(promocao.nome);
                }
            }
            item.calcularSubtotal();
        }
        pedido.recalcularTotal();
    }
    async atualizarStatus(pedidoId, novoStatus) {
        const pedido = await this.pedidoRepo.findById(pedidoId);
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        pedido.atualizarStatus(novoStatus);
        return await this.pedidoRepo.update(pedidoId, pedido);
    }
    async cancelarPedido(pedidoId) {
        const pedido = await this.pedidoRepo.findById(pedidoId);
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        if (!pedido.podeSerCancelado()) {
            throw new Error('Pedido não pode ser cancelado neste status');
        }
        pedido.cancelar();
        await this.pedidoRepo.update(pedidoId, pedido);
    }
    calcularTotal(pedido) {
        pedido.recalcularTotal();
        return pedido.total;
    }
}
exports.PedidoService = PedidoService;
class PromocaoService {
    constructor(promocaoRepo, produtoRepo) {
        this.promocaoRepo = promocaoRepo;
        this.produtoRepo = produtoRepo;
    }
    async obterPromocoesValidas() {
        return await this.promocaoRepo.findAtivas();
    }
    async obterPromocoesDoDia() {
        const promocoes = await this.obterPromocoesValidas();
        const hoje = new Date().getDay();
        return promocoes.filter(p => p.seAplicaHoje() && p.diaSemana === hoje);
    }
    async aplicarPromocaoAoItem(produto, quantidade) {
        const promocoes = await this.obterPromocoesDoDia();
        let melhorDesconto = 0;
        let melhorPromocao;
        for (const promocao of promocoes) {
            // Verificar se a promoção se aplica ao produto
            if (promocao.categoriaAplicavel === produto.categoria ||
                promocao.produtoEspecifico === produto.id) {
                let desconto = 0;
                if (promocao.tipoDesconto === 'percentual') {
                    desconto = (produto.preco * quantidade) * (promocao.valorDesconto / 100);
                }
                else {
                    desconto = promocao.valorDesconto * quantidade;
                }
                if (desconto > melhorDesconto) {
                    melhorDesconto = desconto;
                    melhorPromocao = promocao;
                }
            }
        }
        return {
            desconto: melhorDesconto,
            promocao: melhorPromocao
        };
    }
}
exports.PromocaoService = PromocaoService;
class RelatorioService {
    constructor(pedidoRepo) {
        this.pedidoRepo = pedidoRepo;
    }
    async gerarRelatorioVendas(dataInicio, dataFim) {
        const pedidos = await this.pedidoRepo.findAll();
        const pedidosFiltrados = pedidos.filter(p => p.criadoEm >= dataInicio &&
            p.criadoEm <= dataFim &&
            p.status !== 'cancelado');
        const vendasPorDia = new Map();
        let totalVendas = 0;
        let totalDescontos = 0;
        for (const pedido of pedidosFiltrados) {
            const data = pedido.criadoEm.toISOString().split('T')[0];
            const diaAtual = vendasPorDia.get(data) || { vendas: 0, pedidos: 0 };
            diaAtual.vendas += pedido.total;
            diaAtual.pedidos += 1;
            vendasPorDia.set(data, diaAtual);
            totalVendas += pedido.total;
            totalDescontos += pedido.totalDescontos;
        }
        return {
            periodo: { inicio: dataInicio, fim: dataFim },
            totalPedidos: pedidosFiltrados.length,
            totalVendas,
            totalDescontos,
            vendasPorDia: Array.from(vendasPorDia.entries()).map(([data, info]) => ({
                data,
                vendas: info.vendas,
                pedidos: info.pedidos
            })),
            ticketMedio: pedidosFiltrados.length > 0 ?
                totalVendas / pedidosFiltrados.length : 0
        };
    }
    async gerarRelatorioProdutosMaisVendidos(dataInicio, dataFim) {
        const pedidos = await this.pedidoRepo.findAll();
        const vendasPorProduto = new Map();
        for (const pedido of pedidos) {
            if (pedido.criadoEm < dataInicio ||
                pedido.criadoEm > dataFim ||
                pedido.status === 'cancelado') {
                continue;
            }
            for (const item of pedido.itens) {
                const atual = vendasPorProduto.get(item.produtoId) || {
                    produtoId: item.produtoId,
                    nomeProduto: item.nomeProduto,
                    quantidadeVendida: 0,
                    totalVendas: 0
                };
                atual.quantidadeVendida += item.quantidade;
                atual.totalVendas += item.subtotal;
                vendasPorProduto.set(item.produtoId, atual);
            }
        }
        return Array.from(vendasPorProduto.values())
            .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida);
    }
    async gerarRelatorioPromocoesUsadas(dataInicio, dataFim) {
        const pedidos = await this.pedidoRepo.findAll();
        const usoPorPromocao = new Map();
        for (const pedido of pedidos) {
            if (pedido.criadoEm < dataInicio ||
                pedido.criadoEm > dataFim ||
                pedido.status === 'cancelado') {
                continue;
            }
            for (const item of pedido.itens) {
                if (!item.promocaoAplicada)
                    continue;
                const atual = usoPorPromocao.get(item.promocaoAplicada) || {
                    promocaoId: 0, // Seria necessário mapear nome -> id
                    nomePromocao: item.promocaoAplicada,
                    vezesUsada: 0,
                    economiaTotal: 0
                };
                atual.vezesUsada += 1;
                atual.economiaTotal += item.descontoAplicado;
                usoPorPromocao.set(item.promocaoAplicada, atual);
            }
        }
        return Array.from(usoPorPromocao.values())
            .sort((a, b) => b.vezesUsada - a.vezesUsada);
    }
}
exports.RelatorioService = RelatorioService;
class NotaFiscalService {
    gerarNotaFiscal(pedido) {
        return {
            pedido,
            dataEmissao: new Date(),
            formatarParaTexto() {
                let texto = '==========================================\n';
                texto += '           NOTA FISCAL ELETRÔNICA          \n';
                texto += '==========================================\n\n';
                texto += `Data Emissão: ${this.dataEmissao.toLocaleString()}\n`;
                texto += `Pedido Nº: ${this.pedido.id}\n`;
                texto += `Cliente: ${this.pedido.clienteNome}\n`;
                texto += `CPF/CNPJ: ${this.pedido.clienteEmail}\n\n`;
                texto += 'ITENS DO PEDIDO\n';
                texto += '------------------------------------------\n';
                for (const item of this.pedido.itens) {
                    texto += `${item.quantidade}x ${item.nomeProduto}\n`;
                    texto += `    Preço Un.: R$ ${item.precoUnitario.toFixed(2)}\n`;
                    if (item.descontoAplicado > 0) {
                        texto += `    Desconto: -R$ ${item.descontoAplicado.toFixed(2)}\n`;
                        texto += `    Promoção: ${item.promocaoAplicada}\n`;
                    }
                    texto += `    Subtotal: R$ ${item.subtotal.toFixed(2)}\n\n`;
                }
                texto += '------------------------------------------\n';
                texto += `Subtotal: R$ ${this.pedido.subtotalOriginal.toFixed(2)}\n`;
                texto += `Descontos: -R$ ${this.pedido.totalDescontos.toFixed(2)}\n`;
                texto += `TOTAL: R$ ${this.pedido.total.toFixed(2)}\n\n`;
                texto += `Forma de Pagamento: ${this.pedido.formaPagamento}\n`;
                texto += `Status do Pedido: ${this.pedido.status}\n`;
                texto += '==========================================\n';
                return texto;
            },
            formatarParaHTML() {
                let html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Nota Fiscal - Pedido ${this.pedido.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .nota-fiscal { max-width: 800px; margin: 0 auto; }
                        .cabecalho { text-align: center; margin-bottom: 20px; }
                        .info-pedido { margin-bottom: 20px; }
                        .itens { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .itens th, .itens td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        .totais { text-align: right; margin-top: 20px; }
                        .promocao { color: #2ecc71; }
                    </style>
                </head>
                <body>
                    <div class="nota-fiscal">
                        <div class="cabecalho">
                            <h1>Nota Fiscal Eletrônica</h1>
                            <p>Pedido Nº ${this.pedido.id}</p>
                            <p>Data: ${this.dataEmissao.toLocaleString()}</p>
                        </div>
                        
                        <div class="info-pedido">
                            <h3>Dados do Cliente</h3>
                            <p>Nome: ${this.pedido.clienteNome}</p>
                            <p>Email: ${this.pedido.clienteEmail}</p>
                            <p>Telefone: ${this.pedido.clienteTelefone}</p>
                        </div>
                        
                        <table class="itens">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qtd</th>
                                    <th>Preço Un.</th>
                                    <th>Desconto</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.pedido.itens.map(item => `
                                    <tr>
                                        <td>${item.nomeProduto}</td>
                                        <td>${item.quantidade}</td>
                                        <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                                        <td>
                                            ${item.descontoAplicado > 0
                    ? `R$ ${item.descontoAplicado.toFixed(2)}<br>
                                                   <span class="promocao">${item.promocaoAplicada}</span>`
                    : '-'}
                                        </td>
                                        <td>R$ ${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="totais">
                            <p>Subtotal: R$ ${this.pedido.subtotalOriginal.toFixed(2)}</p>
                            <p>Descontos: -R$ ${this.pedido.totalDescontos.toFixed(2)}</p>
                            <h3>Total: R$ ${this.pedido.total.toFixed(2)}</h3>
                            <p>Forma de Pagamento: ${this.pedido.formaPagamento}</p>
                            <p>Status do Pedido: ${this.pedido.status}</p>
                        </div>
                    </div>
                </body>
                </html>`;
                return html;
            }
        };
    }
}
exports.NotaFiscalService = NotaFiscalService;
