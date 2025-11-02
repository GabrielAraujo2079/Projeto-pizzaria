import { Database, DatabaseConfig } from './database';
import { UsuarioRepository, ProdutoRepository, PedidoRepository, PromocaoRepository } from './repositores';
import { PedidoService, PromocaoService, RelatorioService, NotaFiscalService, NotaFiscal, RelatorioVendas } from './services';
import { Usuario, Produto, Pedido, Promocao } from './models';

export class PizzariaApp {
    private db: Database;
    private usuarioRepo: UsuarioRepository;
    private produtoRepo: ProdutoRepository;
    private pedidoRepo: PedidoRepository;
    private promocaoRepo: PromocaoRepository;
    private pedidoService: PedidoService;
    private promocaoService: PromocaoService;
    private relatorioService: RelatorioService;
    private notaFiscalService: NotaFiscalService;

    constructor(config: DatabaseConfig) {
        // Inicializar banco de dados
        this.db = Database.getInstance(config);
        
        // Inicializar repositórios
        this.usuarioRepo = new UsuarioRepository(this.db);
        this.produtoRepo = new ProdutoRepository(this.db);
        this.pedidoRepo = new PedidoRepository(this.db);
        this.promocaoRepo = new PromocaoRepository(this.db);
        
        // Inicializar serviços
        this.promocaoService = new PromocaoService(this.promocaoRepo, this.produtoRepo);
        this.pedidoService = new PedidoService(this.pedidoRepo, this.promocaoService);
        this.relatorioService = new RelatorioService(this.pedidoRepo);
        this.notaFiscalService = new NotaFiscalService();
    }

    // Métodos de Inicialização e Encerramento
    async inicializar(): Promise<void> {
        try {
            await this.db.inicializarTabelas();
            await this.inicializarPromocoesDefault();
            console.log('🎉 Banco de dados inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar banco de dados:', error);
            throw error;
        }
    }

    async fechar(): Promise<void> {
        await this.db.close();
    }

    private async inicializarPromocoesDefault(): Promise<void> {
        const promocoes = await this.promocaoRepo.findAll();
        if (promocoes.length === 0) {
            const promocoesPadrao = [
                new Promocao(
                    undefined,
                    'Segunda Especial - Pizza Grande',
                    '30% de desconto em todas as pizzas grandes',
                    'percentual',
                    30,
                    1,
                    'pizza',
                    undefined,
                    undefined,
                    true,
                    new Date()
                ),
                new Promocao(
                    undefined,
                    'Terça das Bebidas',
                    'R$ 5,00 de desconto em bebidas',
                    'valor_fixo',
                    5,
                    2,
                    'bebida',
                    undefined,
                    undefined,
                    true,
                    new Date()
                ),
                new Promocao(
                    undefined,
                    'Quarta Doce',
                    '25% off em sobremesas',
                    'percentual',
                    25,
                    3,
                    'sobremesa',
                    undefined,
                    undefined,
                    true,
                    new Date()
                ),
                new Promocao(
                    undefined,
                    'Quinta da Família',
                    '20% em pedidos acima de R$ 50',
                    'percentual',
                    20,
                    4,
                    'todos',
                    undefined,
                    50,
                    true,
                    new Date()
                ),
                new Promocao(
                    undefined,
                    'Sexta Premium',
                    '15% em todo o pedido',
                    'percentual',
                    15,
                    5,
                    'todos',
                    undefined,
                    undefined,
                    true,
                    new Date()
                )
            ];

            for (const promocao of promocoesPadrao) {
                await this.promocaoRepo.create(promocao);
            }
        }
    }

    // Métodos de Usuário
    async cadastrarUsuario(usuario: Usuario): Promise<Usuario> {
        return await this.usuarioRepo.create(usuario);
    }

    async buscarUsuarioPorId(id: number): Promise<Usuario | null> {
        return await this.usuarioRepo.findById(id);
    }

    async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
        return await this.usuarioRepo.findByEmail(email);
    }

    async atualizarUsuario(id: number, usuario: Usuario): Promise<Usuario> {
        return await this.usuarioRepo.update(id, usuario);
    }

    async autenticarUsuario(email: string, senha: string): Promise<Usuario | null> {
        return await this.usuarioRepo.autenticar(email, senha);
    }

    // Wrappers adicionais usados pela interface
    async listarUsuarios(): Promise<Usuario[]> {
        return await this.usuarioRepo.findAll();
    }

    async buscarUsuario(id: number): Promise<Usuario | null> {
        return await this.buscarUsuarioPorId(id);
    }

    async removerUsuario(id: number): Promise<boolean> {
        return await this.usuarioRepo.delete(id);
    }

    // Métodos de Produto
    async cadastrarProduto(produto: Produto): Promise<Produto> {
        return await this.produtoRepo.create(produto);
    }

    async buscarProdutoPorId(id: number): Promise<Produto | null> {
        return await this.produtoRepo.findById(id);
    }

    async listarProdutos(): Promise<Produto[]> {
        return await this.produtoRepo.findAll();
    }

    async atualizarProduto(id: number, produto: Produto): Promise<Produto> {
        return await this.produtoRepo.update(id, produto);
    }

    async removerProduto(id: number): Promise<boolean> {
        return await this.produtoRepo.delete(id);
    }

    // Métodos de Pedido
    async criarPedido(pedido: Pedido): Promise<Pedido> {
        return await this.pedidoService.criarPedido(pedido);
    }

    async buscarPedidoPorId(id: number): Promise<Pedido | null> {
        return await this.pedidoRepo.findById(id);
    }

    async listarPedidos(): Promise<Pedido[]> {
        return await this.pedidoRepo.findAll();
    }

    async listarPedidosUsuario(usuarioId: number): Promise<Pedido[]> {
        return await this.pedidoRepo.findByUsuario(usuarioId);
    }

    async atualizarStatusPedido(id: number, status: string): Promise<Pedido | null> {
        return await this.pedidoService.atualizarStatus(id, status);
    }

    // Métodos de Promoção
    async cadastrarPromocao(promocao: Promocao): Promise<Promocao> {
        return await this.promocaoRepo.create(promocao);
    }

    async buscarPromocaoPorId(id: number): Promise<Promocao | null> {
        return await this.promocaoRepo.findById(id);
    }

    async listarPromocoes(): Promise<Promocao[]> {
        return await this.promocaoRepo.findAll();
    }

    async listarPromocoesAtivas(): Promise<Promocao[]> {
        return await this.promocaoRepo.findAtivas();
    }

    async atualizarPromocao(id: number, promocao: Promocao): Promise<Promocao> {
        return await this.promocaoRepo.update(id, promocao);
    }

    async removerPromocao(id: number): Promise<boolean> {
        return await this.promocaoRepo.delete(id);
    }

    // Métodos de Relatório
    async gerarRelatorioDiario(data: Date): Promise<RelatorioVendas> {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(data);
        fim.setHours(23, 59, 59, 999);
        return await this.relatorioService.gerarRelatorioVendas(inicio, fim);
    }

    async gerarRelatorioMensal(mes: number, ano: number): Promise<RelatorioVendas> {
        // mes: 1-12
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 0);
        fim.setHours(23, 59, 59, 999);
        return await this.relatorioService.gerarRelatorioVendas(inicio, fim);
    }

    // Métodos de Nota Fiscal
    async gerarNotaFiscal(pedido: Pedido): Promise<NotaFiscal> {
        return this.notaFiscalService.gerarNotaFiscal(pedido);
    }
}