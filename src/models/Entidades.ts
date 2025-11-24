// Models limpos e centralizados
export class Usuario {
    constructor(
        public id?: number,
        public nome: string = '',
        public email: string = '',
        public senha: string = '',
        public cpf: string = '',
        public telefone: string = '',
        public tipo: 'admin' | 'cliente' = 'cliente',
        public dataNascimento: Date = new Date(),
        public endereco?: Endereco,
        public criadoEm: Date = new Date(),
        public atualizadoEm: Date = new Date()
    ) {}

    validar(): string[] {
        const erros: string[] = [];
        if (!this.nome || this.nome.length < 3) erros.push('Nome deve ter pelo menos 3 caracteres');
        const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) erros.push('Email inválido');
        const cpfRegex = /^\d{11}$/;
        if (!cpfRegex.test(this.cpf)) erros.push('CPF deve ter 11 dígitos');
        const telRegex = /^\d{10,11}$/;
        if (!telRegex.test(this.telefone)) erros.push('Telefone deve ter 10 ou 11 dígitos');
        return erros;
    }
    isAdmin(): boolean { return this.tipo === 'admin'; }
}

export class Endereco {
    constructor(
        public id?: number,
        public rua: string = '',
        public numero: string = '',
        public bairro: string = '',
        public complemento?: string,
        public cidade: string = 'Campinas',
        public estado: string = 'SP',
        public cep?: string
    ) {}
}

export class Produto {
    constructor(
        public id?: number,
        public nome: string = '',
        public descricao: string = '',
        public preco: number = 0,
        public categoria: 'pizza' | 'bebida' | 'sobremesa' = 'pizza',
        public disponivel: boolean = true,
        public imagemUrl?: string,
        public criadoEm: Date = new Date(),
        public atualizadoEm: Date = new Date()
    ) {}

    calcularPrecoComDesconto(desconto: number): number { return this.preco - desconto; }
    validar(): string[] {
        const erros: string[] = [];
        if (!this.nome || this.nome.length < 3) erros.push('Nome deve ter pelo menos 3 caracteres');
        if (this.preco <= 0) erros.push('Preço deve ser maior que zero');
        return erros;
    }
}

export class ItemPedido {
    constructor(
        public id?: number,
        public pedidoId?: number,
        public produtoId: number = 0,
        public nomeProduto: string = '',
        public quantidade: number = 1,
        public precoUnitario: number = 0,
        public precoOriginal: number = 0,
        public descontoAplicado: number = 0,
        public subtotal: number = 0,
        public promocaoAplicada?: string,
        public observacoes?: string
    ) {}

    calcularSubtotal(): void {
        this.precoOriginal = this.precoUnitario * this.quantidade;
        this.subtotal = this.precoOriginal - this.descontoAplicado;
    }
}

export class Pedido {
    constructor(
        public id?: number,
        public clienteId?: number,
        public clienteNome: string = '',
        public clienteEmail: string = '',
        public clienteTelefone: string = '',
        public tipoEntrega: 'entrega' | 'retirada' = 'retirada',
        public enderecoEntrega?: Endereco,
        public itens: ItemPedido[] = [],
        public subtotalOriginal: number = 0,
        public totalDescontos: number = 0,
        public total: number = 0,
        public status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado' = 'pendente',
        public formaPagamento: 'dinheiro' | 'pix' | 'debito' | 'credito' = 'dinheiro',
        public observacoes?: string,
        public promocoesAplicadas: string[] = [],
        public criadoEm: Date = new Date(),
        public atualizadoEm: Date = new Date()
    ) {}

    adicionarItem(item: ItemPedido): void { item.calcularSubtotal(); this.itens.push(item); this.recalcularTotal(); }
    removerItem(itemId: number): void { this.itens = this.itens.filter(i => i.id !== itemId); this.recalcularTotal(); }
    recalcularTotal(): void {
        this.subtotalOriginal = this.itens.reduce((sum, it) => sum + it.precoOriginal, 0);
        this.totalDescontos = this.itens.reduce((sum, it) => sum + it.descontoAplicado, 0);
        this.total = this.subtotalOriginal - this.totalDescontos;
    }
    podeSerCancelado(): boolean { return this.status === 'pendente' || this.status === 'preparando'; }
    cancelar(): void { if (!this.podeSerCancelado()) throw new Error('Pedido não pode ser cancelado neste status'); this.status = 'cancelado'; this.atualizadoEm = new Date(); }
    atualizarStatus(novoStatus: Pedido['status']): void { this.status = novoStatus; this.atualizadoEm = new Date(); }
}

export class Promocao {
    constructor(
        public id?: number,
        public nome: string = '',
        public descricao: string = '',
        public tipoDesconto: 'percentual' | 'valor_fixo' = 'percentual',
        public valorDesconto: number = 0,
        public diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
        public categoriaAplicavel: 'pizza' | 'bebida' | 'sobremesa' | 'todos' = 'todos',
        public produtoEspecifico?: number,
        public valorMinimoPedido?: number,
        public ativa: boolean = true,
        public dataInicio: Date = new Date(),
        public dataFim?: Date
    ) {}

    estaAtiva(): boolean {
        if (!this.ativa) return false;
        const agora = new Date();
        if (agora < this.dataInicio) return false;
        if (this.dataFim && agora > this.dataFim) return false;
        return true;
    }

    seAplicaHoje(): boolean { const hoje = new Date().getDay(); return this.estaAtiva() && this.diaSemana === hoje; }

    calcularDesconto(produto: Produto, quantidade: number): number {
        if (!this.seAplicaAoProduto(produto)) return 0;
        const subtotal = produto.preco * quantidade;
        if (this.tipoDesconto === 'percentual') return subtotal * (this.valorDesconto / 100);
        return Math.min(this.valorDesconto * quantidade, subtotal);
    }

    seAplicaAoProduto(produto: Produto): boolean {
        if (this.produtoEspecifico && this.produtoEspecifico !== produto.id) return false;
        if (this.categoriaAplicavel !== 'todos' && this.categoriaAplicavel !== produto.categoria) return false;
        return true;
    }
    // Linha pra desbugar o github
}
