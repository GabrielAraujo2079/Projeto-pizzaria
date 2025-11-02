"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PizzariaApp = void 0;
const database_1 = require("./database");
const repositores_1 = require("./repositores");
const services_1 = require("./services");
const models_1 = require("./models");
class PizzariaApp {
    constructor(config) {
        // Inicializar banco de dados
        this.db = database_1.Database.getInstance(config);
        // Inicializar repositórios
        this.usuarioRepo = new repositores_1.UsuarioRepository(this.db);
        this.produtoRepo = new repositores_1.ProdutoRepository(this.db);
        this.pedidoRepo = new repositores_1.PedidoRepository(this.db);
        this.promocaoRepo = new repositores_1.PromocaoRepository(this.db);
        // Inicializar serviços
        this.promocaoService = new services_1.PromocaoService(this.promocaoRepo, this.produtoRepo);
        this.pedidoService = new services_1.PedidoService(this.pedidoRepo, this.promocaoService);
        this.relatorioService = new services_1.RelatorioService(this.pedidoRepo);
        this.notaFiscalService = new services_1.NotaFiscalService();
    }
    // Métodos de Inicialização e Encerramento
    async inicializar() {
        try {
            await this.db.inicializarTabelas();
            await this.inicializarPromocoesDefault();
            console.log('🎉 Banco de dados inicializado com sucesso!');
        }
        catch (error) {
            console.error('❌ Erro ao inicializar banco de dados:', error);
            throw error;
        }
    }
    async fechar() {
        await this.db.close();
    }
    async inicializarPromocoesDefault() {
        const promocoes = await this.promocaoRepo.findAll();
        if (promocoes.length === 0) {
            const promocoesPadrao = [
                new models_1.Promocao(undefined, 'Segunda Especial - Pizza Grande', '30% de desconto em todas as pizzas grandes', 'percentual', 30, 1, 'pizza', undefined, undefined, true, new Date()),
                new models_1.Promocao(undefined, 'Terça das Bebidas', 'R$ 5,00 de desconto em bebidas', 'valor_fixo', 5, 2, 'bebida', undefined, undefined, true, new Date()),
                new models_1.Promocao(undefined, 'Quarta Doce', '25% off em sobremesas', 'percentual', 25, 3, 'sobremesa', undefined, undefined, true, new Date()),
                new models_1.Promocao(undefined, 'Quinta da Família', '20% em pedidos acima de R$ 50', 'percentual', 20, 4, 'todos', undefined, 50, true, new Date()),
                new models_1.Promocao(undefined, 'Sexta Premium', '15% em todo o pedido', 'percentual', 15, 5, 'todos', undefined, undefined, true, new Date())
            ];
            for (const promocao of promocoesPadrao) {
                await this.promocaoRepo.create(promocao);
            }
        }
    }
    // Métodos de Usuário
    async cadastrarUsuario(usuario) {
        return await this.usuarioRepo.create(usuario);
    }
    async buscarUsuarioPorId(id) {
        return await this.usuarioRepo.findById(id);
    }
    async buscarUsuarioPorEmail(email) {
        return await this.usuarioRepo.findByEmail(email);
    }
    async atualizarUsuario(id, usuario) {
        return await this.usuarioRepo.update(id, usuario);
    }
    async autenticarUsuario(email, senha) {
        return await this.usuarioRepo.autenticar(email, senha);
    }
    // Métodos de Produto
    async cadastrarProduto(produto) {
        return await this.produtoRepo.create(produto);
    }
    async buscarProdutoPorId(id) {
        return await this.produtoRepo.findById(id);
    }
    async listarProdutos() {
        return await this.produtoRepo.findAll();
    }
    async atualizarProduto(id, produto) {
        return await this.produtoRepo.update(id, produto);
    }
    async removerProduto(id) {
        return await this.produtoRepo.delete(id);
    }
    // Métodos de Pedido
    async criarPedido(pedido) {
        return await this.pedidoService.criarPedido(pedido);
    }
    async buscarPedidoPorId(id) {
        return await this.pedidoRepo.findById(id);
    }
    async listarPedidos() {
        return await this.pedidoRepo.findAll();
    }
    async listarPedidosUsuario(usuarioId) {
        return await this.pedidoRepo.findByUsuario(usuarioId);
    }
    async atualizarStatusPedido(id, status) {
        return await this.pedidoService.atualizarStatus(id, status);
    }
    // Métodos de Promoção
    async cadastrarPromocao(promocao) {
        return await this.promocaoRepo.create(promocao);
    }
    async buscarPromocaoPorId(id) {
        return await this.promocaoRepo.findById(id);
    }
    async listarPromocoes() {
        return await this.promocaoRepo.findAll();
    }
    async listarPromocoesAtivas() {
        return await this.promocaoRepo.findAtivas();
    }
    async atualizarPromocao(id, promocao) {
        return await this.promocaoRepo.update(id, promocao);
    }
    async removerPromocao(id) {
        return await this.promocaoRepo.delete(id);
    }
    // Métodos de Relatório
    async gerarRelatorioDiario(data) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(data);
        fim.setHours(23, 59, 59, 999);
        return await this.relatorioService.gerarRelatorioVendas(inicio, fim);
    }
    async gerarRelatorioMensal(mes, ano) {
        // mes: 1-12
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 0);
        fim.setHours(23, 59, 59, 999);
        return await this.relatorioService.gerarRelatorioVendas(inicio, fim);
    }
    // Métodos de Nota Fiscal
    async gerarNotaFiscal(pedido) {
        return this.notaFiscalService.gerarNotaFiscal(pedido);
    }
}
exports.PizzariaApp = PizzariaApp;
