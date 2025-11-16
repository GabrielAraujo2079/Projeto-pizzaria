import { Pedido, Produto, Promocao } from '../models';
import { PedidoRepository, PromocaoRepository, ProdutoRepository } from '../repositories';

// ==========================================
// PEDIDO SERVICE
// ==========================================
export class PedidoService {
    constructor(
        private pedidoRepo: PedidoRepository,
        private promocaoService: PromocaoService
    ) {}

    async criarPedido(pedido: Pedido): Promise<Pedido> {
        // Aplicar promoções antes de salvar
        await this.aplicarPromocoes(pedido);
        pedido.recalcularTotal();
        
        return await this.pedidoRepo.create(pedido);
    }

    async aplicarPromocoes(pedido: Pedido): Promise<void> {
        for (const item of pedido.itens) {
            // Criar objeto Produto com as informações necessárias
            const produtoTemp: Produto = {
                id: item.produtoId,
                nome: item.nomeProduto,
                preco: item.precoUnitario,
                categoria: 'pizza', // Você precisará passar a categoria correta
                descricao: '',
                disponivel: true,
                criadoEm: new Date(),
                atualizadoEm: new Date(),
                calcularPrecoComDesconto: function(desconto: number): number {
                    return this.preco - desconto;
                },
                validar: function(): string[] {
                    return [];
                }
            } as Produto;

            const { desconto, promocao } = await this.promocaoService.aplicarPromocaoAoItem(
                produtoTemp,
                item.quantidade
            );

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

    async atualizarStatus(pedidoId: number, novoStatus: string): Promise<Pedido> {
        const pedido = await this.pedidoRepo.findById(pedidoId);
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }

        pedido.atualizarStatus(novoStatus as Pedido['status']);
        return await this.pedidoRepo.update(pedidoId, pedido);
    }

    async cancelarPedido(pedidoId: number): Promise<void> {
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

    calcularTotal(pedido: Pedido): number {
        pedido.recalcularTotal();
        return pedido.total;
    }
}

// ==========================================
// PROMOCAO SERVICE
// ==========================================
export class PromocaoService {
    constructor(
        private promocaoRepo: PromocaoRepository,
        private produtoRepo: ProdutoRepository
    ) {}

    async obterPromocoesValidas(): Promise<Promocao[]> {
        return await this.promocaoRepo.findAtivas();
    }

    async obterPromocoesDoDia(): Promise<Promocao[]> {
        const promocoes = await this.obterPromocoesValidas();
        const hoje = new Date().getDay();
        return promocoes.filter(p => p.seAplicaHoje() && p.diaSemana === hoje);
    }

    async aplicarPromocaoAoItem(produto: Produto, quantidade: number): Promise<{ desconto: number, promocao?: Promocao }> {
        const promocoes = await this.obterPromocoesDoDia();
        let melhorDesconto = 0;
        let melhorPromocao: Promocao | undefined;

        for (const promocao of promocoes) {
            // Verificar se a promoção se aplica ao produto
            const seAplica = 
                promocao.categoriaAplicavel === 'todos' ||
                promocao.categoriaAplicavel === produto.categoria || 
                promocao.produtoEspecifico === produto.id;
            
            if (seAplica) {
                let desconto = 0;
                if (promocao.tipoDesconto === 'percentual') {
                    desconto = (produto.preco * quantidade) * (promocao.valorDesconto / 100);
                } else {
                    desconto = Math.min(promocao.valorDesconto * quantidade, produto.preco * quantidade);
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

// ==========================================
// RELATORIO SERVICE
// ==========================================
export class RelatorioService {
    constructor(private pedidoRepo: PedidoRepository) {}

    async gerarRelatorioVendas(dataInicio: Date, dataFim: Date): Promise<RelatorioVendas> {
        const pedidos = await this.pedidoRepo.findAll();
        const pedidosFiltrados = pedidos.filter(p => 
            p.criadoEm >= dataInicio && 
            p.criadoEm <= dataFim &&
            p.status !== 'cancelado'
        );

        const vendasPorDia = new Map<string, { vendas: number, pedidos: number }>();
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

    async gerarRelatorioProdutosMaisVendidos(dataInicio: Date, dataFim: Date): Promise<ProdutoVendas[]> {
        const pedidos = await this.pedidoRepo.findAll();
        const vendasPorProduto = new Map<number, ProdutoVendas>();

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

    async gerarRelatorioPromocoesUsadas(dataInicio: Date, dataFim: Date): Promise<PromocaoUso[]> {
        const pedidos = await this.pedidoRepo.findAll();
        const usoPorPromocao = new Map<string, PromocaoUso>();

        for (const pedido of pedidos) {
            if (pedido.criadoEm < dataInicio || 
                pedido.criadoEm > dataFim || 
                pedido.status === 'cancelado') {
                continue;
            }

            for (const item of pedido.itens) {
                if (!item.promocaoAplicada) continue;

                const atual = usoPorPromocao.get(item.promocaoAplicada) || {
                    promocaoId: 0,
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

// ==========================================
// NOTA FISCAL SERVICE
// ==========================================
export class NotaFiscalService {
    gerarNotaFiscal(pedido: Pedido): NotaFiscal {
        return {
            pedido,
            dataEmissao: new Date(),
            
            formatarParaTexto(): string {
                let texto = '==========================================\n';
                texto += '           NOTA FISCAL ELETRÔNICA          \n';
                texto += '==========================================\n\n';
                
                texto += `Data Emissão: ${this.dataEmissao.toLocaleString('pt-BR')}\n`;
                texto += `Pedido Nº: ${this.pedido.id}\n`;
                texto += `Cliente: ${this.pedido.clienteNome}\n`;
                texto += `Email: ${this.pedido.clienteEmail}\n`;
                texto += `Telefone: ${this.pedido.clienteTelefone}\n\n`;
                
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
                texto += `Status: ${this.pedido.status}\n`;
                texto += '==========================================\n';
                
                return texto;
            },
            
            formatarParaHTML(): string {
                return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Nota Fiscal - Pedido ${this.pedido.id}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            background-color: #f5f5f5;
        }
        .nota-fiscal { 
            max-width: 800px; 
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .cabecalho { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .cabecalho h1 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .info-pedido { 
            margin-bottom: 30px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .info-pedido h3 {
            margin-top: 0;
            color: #555;
        }
        .info-pedido p {
            margin: 5px 0;
        }
        .itens { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
        }
        .itens th {
            background: #333;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .itens td { 
            padding: 10px; 
            border-bottom: 1px solid #ddd;
        }
        .itens tr:hover {
            background: #f5f5f5;
        }
        .totais { 
            text-align: right; 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #333;
        }
        .totais p {
            margin: 5px 0;
            font-size: 16px;
        }
        .totais h3 {
            margin: 15px 0;
            color: #27ae60;
            font-size: 24px;
        }
        .promocao { 
            color: #27ae60;
            font-weight: bold;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .nota-fiscal { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="nota-fiscal">
        <div class="cabecalho">
            <h1>🍕 Nota Fiscal Eletrônica</h1>
            <p><strong>Pedido #${this.pedido.id}</strong></p>
            <p>${this.dataEmissao.toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="info-pedido">
            <h3>📋 Dados do Cliente</h3>
            <p><strong>Nome:</strong> ${this.pedido.clienteNome}</p>
            <p><strong>Email:</strong> ${this.pedido.clienteEmail}</p>
            <p><strong>Telefone:</strong> ${this.pedido.clienteTelefone}</p>
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
                        <td><strong>${item.nomeProduto}</strong></td>
                        <td>${item.quantidade}</td>
                        <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                        <td>${item.descontoAplicado > 0 
                            ? `R$ ${item.descontoAplicado.toFixed(2)}<br><span class="promocao">💰 ${item.promocaoAplicada}</span>`
                            : '-'}</td>
                        <td><strong>R$ ${item.subtotal.toFixed(2)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totais">
            <p>Subtotal: <strong>R$ ${this.pedido.subtotalOriginal.toFixed(2)}</strong></p>
            ${this.pedido.totalDescontos > 0 ? `<p style="color: #27ae60;">Descontos: <strong>R$ ${this.pedido.totalDescontos.toFixed(2)}</strong></p>` : ''}
            <h3>Total: R$ ${this.pedido.total.toFixed(2)}</h3>
            <p>Forma de Pagamento: <strong>${this.pedido.formaPagamento?.toUpperCase()}</strong></p>
            <p>Status: <strong>${this.pedido.status?.toUpperCase()}</strong></p>
        </div>
    </div>
</body>
</html>`;
            }
        };
    }
}

// ==========================================
// INTERFACES E TIPOS
// ==========================================
export interface RelatorioVendas {
    periodo: { inicio: Date, fim: Date };
    totalPedidos: number;
    totalVendas: number;
    totalDescontos: number;
    vendasPorDia: { data: string, vendas: number, pedidos: number }[];
    ticketMedio: number;
}

export interface ProdutoVendas {
    produtoId: number;
    nomeProduto: string;
    quantidadeVendida: number;
    totalVendas: number;
}

export interface PromocaoUso {
    promocaoId: number;
    nomePromocao: string;
    vezesUsada: number;
    economiaTotal: number;
}

export interface NotaFiscal {
    pedido: Pedido;
    dataEmissao: Date;
    formatarParaTexto(): string;
    formatarParaHTML(): string;
}