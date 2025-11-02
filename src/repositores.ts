export interface IRepository<T> {
    findAll(): Promise<T[]>;
    findById(id: number): Promise<T | null>;
    create(entity: T): Promise<T>;
    update(id: number, entity: T): Promise<T>;
    delete(id: number): Promise<boolean>;
}

export interface IUsuarioRepository extends IRepository<Usuario> {
    findByEmail(email: string): Promise<Usuario | null>;
    findByCpf(cpf: string): Promise<Usuario | null>;
    autenticar(email: string, senha: string): Promise<Usuario | null>;
}

export interface IProdutoRepository extends IRepository<Produto> {
    findByCategoria(categoria: string): Promise<Produto[]>;
    findDisponiveis(): Promise<Produto[]>;
}

export interface IPedidoRepository extends IRepository<Pedido> {
    findByCliente(clienteId: number): Promise<Pedido[]>;
    findByStatus(status: string): Promise<Pedido[]>;
    findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Pedido[]>;
}

export interface IPromocaoRepository extends IRepository<Promocao> {
    findAtivas(): Promise<Promocao[]>;
    findPorDiaSemana(diaSemana: number): Promise<Promocao[]>;
}