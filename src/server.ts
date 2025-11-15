import express from 'express';
import path from 'path';
import { PizzariaApp } from './app';
import { Usuario, Produto, Pedido, ItemPedido } from './models';

const server = express();
const PORT = process.env.PORT || 3000;

// Middleware
server.use(express.json());
server.use(express.static(path.join(__dirname, '../web')));

// Configuração do banco de dados com credenciais locais
const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2079',
    database: 'Pizzaria'
};

let pizzariaApp: PizzariaApp;

// ============================================
// INICIALIZAÇÃO
// ============================================

async function iniciarServidor() {
    try {
        pizzariaApp = new PizzariaApp(dbConfig);
        await pizzariaApp.inicializar();
        
        server.listen(PORT, () => {
            console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
            console.log('🍕 Sistema de Pizzaria iniciado!');
            console.log('📦 Interface web disponível\n');
        });
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        process.exit(1);
    }
}

// ============================================
// AUTENTICAÇÃO
// ============================================

server.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }
        
        const usuario = await pizzariaApp.autenticarUsuario(email, senha);
        
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }
        
        res.json({ usuario });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

server.post('/api/auth/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, cpf, telefone, endereco, dataNascmto } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
        }
        
        // Verificar se usuário já existe
        const usuarioExistente = await pizzariaApp.buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ erro: 'Email já cadastrado' });
        }
        
        const novoUsuario = new Usuario(
            undefined,
            nome,
            email,
            senha,
            cpf || '00000000000',
            telefone || '0000000000',
            'cliente',
            new Date(),
            {
                rua: endereco?.rua || '',
                numero: endereco?.numero || '',
                complemento: endereco?.complemento || '',
                bairro: endereco?.bairro || '',
                cidade: endereco?.cidade || '',
                estado: endereco?.estado || '',
                cep: endereco?.cep || ''
            }
        );
        
        const usuarioCriado = await pizzariaApp.cadastrarUsuario(novoUsuario);
        res.status(201).json({ usuario: usuarioCriado });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
});

// ============================================
// PRODUTOS
// ============================================

server.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await pizzariaApp.listarProdutos();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ erro: 'Erro ao listar produtos' });
    }
});

server.post('/api/produtos', async (req, res) => {
    try {
        const { nome, categoria, preco, descricao, disponivel } = req.body;
        
        if (!nome || !categoria || !preco) {
            return res.status(400).json({ erro: 'Nome, categoria e preço são obrigatórios' });
        }
        
        const novoProduto = new Produto(
            undefined,
            nome,
            descricao || '',
            preco,
            categoria,
            disponivel !== undefined ? disponivel : true
        );
        
        const produtoCriado = await pizzariaApp.cadastrarProduto(novoProduto);
        res.status(201).json(produtoCriado);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ erro: 'Erro ao criar produto' });
    }
});

server.put('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, categoria, preco, descricao, disponivel } = req.body;
        
        const produtoAtualizado = new Produto(
            parseInt(id),
            nome,
            descricao || '',
            preco,
            categoria,
            disponivel !== undefined ? disponivel : true
        );
        
        const resultado = await pizzariaApp.atualizarProduto(parseInt(id), produtoAtualizado);
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
});

server.delete('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pizzariaApp.removerProduto(parseInt(id));
        
        if (!resultado) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        res.json({ mensagem: 'Produto removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        res.status(500).json({ erro: 'Erro ao remover produto' });
    }
});

// ============================================
// PEDIDOS
// ============================================

server.get('/api/pedidos', async (req, res) => {
    try {
        const { clienteEmail } = req.query;
        
        let pedidos;
        if (clienteEmail) {
            // Listar apenas pedidos do cliente
            const todosPedidos = await pizzariaApp.listarPedidos();
            pedidos = todosPedidos.filter(p => p.clienteEmail === clienteEmail);
        } else {
            pedidos = await pizzariaApp.listarPedidos();
        }
        
        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ erro: 'Erro ao listar pedidos' });
    }
});

server.post('/api/pedidos', async (req, res) => {
    try {
        const { clienteEmail, clienteNome, clienteTelefone, itens, enderecoEntrega, observacoes, formaPagamento } = req.body;
        
        if (!clienteEmail || !itens || itens.length === 0) {
            return res.status(400).json({ erro: 'Email do cliente e itens são obrigatórios' });
        }
        
        // Criar itens do pedido
        const itensPedido = itens.map((item: any) => new ItemPedido(
            undefined,
            undefined,
            item.produtoId,
            item.nomeProduto,
            item.quantidade,
            item.precoUnitario,
            item.precoUnitario * item.quantidade,
            item.descontoAplicado || 0
        ));
        
        // Criar pedido
        const novoPedido = new Pedido(
            undefined,
            undefined,
            clienteNome,
            clienteEmail,
            clienteTelefone,
            'entrega',
            enderecoEntrega,
            itensPedido,
            0,
            0,
            0,
            'pendente',
            formaPagamento || 'dinheiro',
            observacoes || ''
        );
        
        const pedidoCriado = await pizzariaApp.criarPedido(novoPedido);
        res.status(201).json(pedidoCriado);
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ erro: 'Erro ao criar pedido' });
    }
});

server.patch('/api/pedidos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ erro: 'Status é obrigatório' });
        }
        
        const pedidoAtualizado = await pizzariaApp.atualizarStatusPedido(parseInt(id), status);
        
        if (!pedidoAtualizado) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }
        
        res.json(pedidoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        res.status(500).json({ erro: 'Erro ao atualizar status do pedido' });
    }
});

// ============================================
// ESTATÍSTICAS
// ============================================

server.get('/api/estatisticas', async (req, res) => {
    try {
        const pedidos = await pizzariaApp.listarPedidos();
        const produtos = await pizzariaApp.listarProdutos();
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const pedidosHoje = pedidos.filter(p => {
            const dataPedido = new Date(p.criadoEm);
            dataPedido.setHours(0, 0, 0, 0);
            return dataPedido.getTime() === hoje.getTime();
        });
        
        const totalVendas = pedidosHoje.reduce((sum, p) => sum + p.total, 0);
        const ticketMedio = pedidosHoje.length > 0 ? totalVendas / pedidosHoje.length : 0;
        
        res.json({
            totalVendas,
            pedidosHoje: pedidosHoje.length,
            totalProdutos: produtos.length,
            ticketMedio
        });
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        res.status(500).json({ erro: 'Erro ao carregar estatísticas' });
    }
});

// ============================================
// PROMOÇÕES
// ============================================

server.get('/api/promocoes/hoje', async (req, res) => {
    try {
        const promocoes = await pizzariaApp.listarPromocoesAtivas();
        
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        
        // Filtrar promoções que são válidas para o dia de hoje (1 = segunda, 2 = terça, etc)
        const promocoesDoDia = promocoes.filter(p => {
            if (p.diaSemana === undefined) return false;
            return p.diaSemana === diaSemana;
        });
        
        res.json(promocoesDoDia);
    } catch (error) {
        console.error('Erro ao carregar promoções:', error);
        res.status(500).json({ erro: 'Erro ao carregar promoções' });
    }
});

// ============================================
// PÁGINA INICIAL
// ============================================

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Iniciar servidor
iniciarServidor();

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n👋 Encerrando servidor...');
    await pizzariaApp.fechar();
    process.exit(0);
});