export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export const defaultConfig: DatabaseConfig = {
    host: 'localhost',
    port: 5432,
    database: 'pizzaria_db',
    user: 'postgres',
    password: 'sua_senha'
};
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