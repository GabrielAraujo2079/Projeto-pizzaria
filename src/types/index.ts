// Tipos e interfaces centralizadas
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
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

export type DescontoTipo = 'percentual' | 'valor_fixo';
