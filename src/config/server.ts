import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PizzariaApp } from '../app';
import { Usuario, Produto, Pedido, ItemPedido, Promocao } from '../models';

const server = express();
const PORT = process.env.PORT || 3000;

// Middleware
server.use(express.json());
server.use(express.static(path.join(__dirname, '../../web')));

// Criar e expor pasta de uploads para imagens
const uploadsDir = path.join(__dirname, '../../uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (err) { /* ignore */ }
server.use('/uploads', express.static(uploadsDir));

// Configuração do multer para armazenar imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

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
        const { nome, email, senha, cpf, telefone, endereco, dataNascmto, tipo } = req.body;

        // Validações básicas do backend (garantir campos obrigatórios)
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
        }
        if (!cpf || !/^[0-9]{11}$/.test(String(cpf))) {
            return res.status(400).json({ erro: 'CPF inválido ou ausente (11 dígitos numéricos)' });
        }
        if (!telefone || !/^[0-9]{10,11}$/.test(String(telefone))) {
            return res.status(400).json({ erro: 'Telefone inválido ou ausente (10 ou 11 dígitos)' });
        }
        if (!dataNascmto) {
            return res.status(400).json({ erro: 'Data de nascimento é obrigatória' });
        }
        if (!endereco || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cep) {
            return res.status(400).json({ erro: 'Endereço incompleto: rua, número, bairro e cep são obrigatórios' });
        }
        // Complemento é opcional, não precisa validar
        
        // Verificar se usuário já existe
        const usuarioExistente = await pizzariaApp.buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ erro: 'Email já cadastrado' });
        }
        
        // Converter data de nascimento, se fornecida no formato DD/MM/AAAA
        let dataNascimento = new Date();
        if (dataNascmto && typeof dataNascmto === 'string') {
            const parts = dataNascmto.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    dataNascimento = new Date(year, month - 1, day);
                }
            }
        }

        const novoUsuario = new Usuario(
            undefined,
            nome,
            email,
            senha,
            cpf || '00000000000',
            telefone || '0000000000',
            tipo || 'cliente',
            dataNascimento,
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

// Endpoint para upload de imagem de produto
server.post('/api/produtos/:id/imagem', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) return res.status(400).json({ erro: 'Arquivo de imagem não fornecido' });

        const produto = await pizzariaApp.buscarProdutoPorId(parseInt(id));
        if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

        // Salvar URL relativa
        produto.imagemUrl = `/uploads/${file.filename}`;
        const atualizado = await pizzariaApp.atualizarProduto(parseInt(id), produto);

        res.json(atualizado);
    } catch (error) {
        console.error('Erro ao fazer upload de imagem:', error);
        res.status(500).json({ erro: 'Erro ao fazer upload de imagem' });
    }
});

// ============================================
// PEDIDOS
// ============================================

server.get('/api/pedidos', async (req, res) => {
    try {
        const { clienteEmail, q } = req.query;
        let pedidos = await pizzariaApp.listarPedidos();

        if (clienteEmail) {
            pedidos = pedidos.filter(p => p.clienteEmail === String(clienteEmail));
        }

        if (q) {
            const term = String(q).toLowerCase();
            pedidos = pedidos.filter(p => 
                String(p.clienteNome || '').toLowerCase().includes(term) ||
                String(p.clienteEmail || '').toLowerCase().includes(term) ||
                String(p.id || '').toLowerCase() === term
            );
        }

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ erro: 'Erro ao listar pedidos' });
    }
});

server.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pizzariaApp.removerPedido(parseInt(id));
        if (!resultado) return res.status(404).json({ erro: 'Pedido não encontrado' });
        res.json({ mensagem: 'Pedido removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover pedido:', error);
        res.status(500).json({ erro: 'Erro ao remover pedido' });
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
// USUÁRIOS
// ============================================

server.get('/api/usuarios', async (req, res) => {
    try {
        const { q } = req.query;
        let usuarios = await pizzariaApp.listarUsuarios();
        if (q) {
            const term = String(q).toLowerCase();
            usuarios = usuarios.filter(u => 
                String(u.nome || '').toLowerCase().includes(term) ||
                String(u.email || '').toLowerCase().includes(term) ||
                String(u.id || '').toLowerCase() === term
            );
        }
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
});

server.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pizzariaApp.removerUsuario(parseInt(id));
        if (!resultado) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json({ mensagem: 'Usuário removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({ erro: 'Erro ao remover usuário' });
    }
});

server.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco, cpf, tipo, dataNascimento, senha } = req.body;

        console.log(`PUT /api/usuarios/${id} - body:`, JSON.stringify(req.body));

        const dataNasc = dataNascimento ? new Date(dataNascimento) : new Date();

        const usuarioAtualizado = new Usuario(
            parseInt(id),
            nome,
            email,
            senha || '',
            cpf || '',
            telefone || '',
            tipo || 'cliente',
            dataNasc,
            endereco
        );

        const resultado = await pizzariaApp.atualizarUsuario(parseInt(id), usuarioAtualizado);
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
});

// ============================================
// PROMOÇÕES
// ============================================

server.get('/api/promocoes/todas', async (req, res) => {
    try {
        const { q } = req.query;
        let promocoes = await pizzariaApp.listarPromocoes();
        if (q) {
            const term = String(q).toLowerCase();
            promocoes = promocoes.filter(p => 
                String(p.nome || '').toLowerCase().includes(term) ||
                String(p.categoriaAplicavel || '').toLowerCase().includes(term)
            );
        }
        res.json(promocoes);
    } catch (error) {
        console.error('Erro ao carregar promoções:', error);
        res.status(500).json({ erro: 'Erro ao carregar promoções' });
    }
});

server.delete('/api/promocoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pizzariaApp.removerPromocao(parseInt(id));
        if (!resultado) return res.status(404).json({ erro: 'Promoção não encontrada' });
        res.json({ mensagem: 'Promoção removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover promoção:', error);
        res.status(500).json({ erro: 'Erro ao remover promoção' });
    }
});

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

server.post('/api/promocoes', async (req, res) => {
    try {
        const { nome, descricao, tipoDesconto, valorDesconto, diaSemana, categoriaAplicavel } = req.body;
        
        const novaPromocao = new Promocao(
            undefined,
            nome,
            descricao,
            tipoDesconto,
            valorDesconto,
            diaSemana,
            categoriaAplicavel,
            undefined,
            undefined,
            true,
            new Date()
        );
        
        const promocaoCriada = await pizzariaApp.cadastrarPromocao(novaPromocao);
        res.status(201).json(promocaoCriada);
    } catch (error) {
        console.error('Erro ao criar promoção:', error);
        res.status(500).json({ erro: 'Erro ao criar promoção' });
    }
});

// ============================================
// PÁGINA INICIAL
// ============================================

// Redirecionar raiz para painel do cliente
server.get('/', (req, res) => {
    res.redirect('/cliente');
});

server.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/index-admin.html'));
});

server.get('/cliente', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/index-cliente.html'));
});

// Iniciar servidor
iniciarServidor();

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n👋 Encerrando servidor...');
    await pizzariaApp.fechar();
    process.exit(0);
});
