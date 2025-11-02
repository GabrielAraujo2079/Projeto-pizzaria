export interface IPedidoService {
    criarPedido(pedido: Pedido): Promise<Pedido>;
    aplicarPromocoes(pedido: Pedido): Promise<void>;
    atualizarStatus(pedidoId: number, novoStatus: string): Promise<Pedido>;
    cancelarPedido(pedidoId: number): Promise<void>;
    calcularTotal(pedido: Pedido): number;
}

export interface IPromocaoService {
    obterPromocoesValidas(): Promise<Promocao[]>;
    obterPromocoesDoDia(): Promise<Promocao[]>;
    aplicarPromocaoAoItem(produto: Produto, quantidade: number): Promise<{ desconto: number, promocao?: Promocao }>;
}

export interface IRelatorioService {
    gerarRelatorioVendas(dataInicio: Date, dataFim: Date): Promise<RelatorioVendas>;
    gerarRelatorioProdutosMaisVendidos(dataInicio: Date, dataFim: Date): Promise<ProdutoVendas[]>;
    gerarRelatorioPromocoesUsadas(dataInicio: Date, dataFim: Date): Promise<PromocaoUso[]>;
}
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