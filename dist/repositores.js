"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromocaoRepository = exports.PedidoRepository = exports.ProdutoRepository = exports.UsuarioRepository = void 0;
const models_1 = require("./models");
const bcrypt = __importStar(require("bcrypt"));
class UsuarioRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const result = await this.db.query(`
            SELECT u.id_cliente AS id, u.nome, u.senha, u.cpf, u.email, u.tipo, u.data_nascimento, u.telefone, u.criado_em, u.atualizado_em,
                   e.logradouro AS rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep, e.id_endereco AS endereco_id
            FROM usuarios u
            LEFT JOIN enderecos e ON e.usuario_id = u.id_cliente
        `);
        return result.rows.map((row) => this.mapRowToUsuario(row));
    }
    async findById(id) {
        const result = await this.db.query(`
            SELECT u.id_cliente AS id, u.nome, u.senha, u.cpf, u.email, u.tipo, u.data_nascimento, u.telefone, u.criado_em, u.atualizado_em,
                   e.logradouro AS rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep, e.id_endereco AS endereco_id
            FROM usuarios u
            LEFT JOIN enderecos e ON e.usuario_id = u.id_cliente
            WHERE u.id_cliente = $1
        `, [id]);
        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }
    async findByEmail(email) {
        const result = await this.db.query(`
            SELECT u.id_cliente AS id, u.nome, u.senha, u.cpf, u.email, u.tipo, u.data_nascimento, u.telefone, u.criado_em, u.atualizado_em,
                   e.logradouro AS rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep, e.id_endereco AS endereco_id
            FROM usuarios u
            LEFT JOIN enderecos e ON e.usuario_id = u.id_cliente
            WHERE u.email = $1
        `, [email]);
        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }
    async findByCpf(cpf) {
        const result = await this.db.query(`
            SELECT u.id_cliente AS id, u.nome, u.senha, u.cpf, u.email, u.tipo, u.data_nascimento, u.telefone, u.criado_em, u.atualizado_em,
                   e.logradouro AS rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep, e.id_endereco AS endereco_id
            FROM usuarios u
            LEFT JOIN enderecos e ON e.usuario_id = u.id_cliente
            WHERE u.cpf = $1
        `, [cpf]);
        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }
    async autenticar(email, senha) {
        const usuario = await this.findByEmail(email);
        if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
            return null;
        }
        return usuario;
    }
    async create(usuario) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Hash da senha
            const senhaHash = bcrypt.hashSync(usuario.senha, 10);
            // Criar usuário primeiro (endereços referenciam usuario_id)
            const result = await client.query(`
                INSERT INTO usuarios (nome, senha, cpf, email, tipo, data_nascimento, telefone)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id_cliente
            `, [
                usuario.nome,
                senhaHash,
                usuario.cpf,
                usuario.email,
                usuario.tipo,
                usuario.dataNascimento,
                usuario.telefone
            ]);
            const novoId = result.rows[0].id_cliente;
            // Criar endereço ligado ao usuário (se fornecido)
            let enderecoId = null;
            if (usuario.endereco) {
                const enderecoResult = await client.query(`
                    INSERT INTO enderecos (usuario_id, logradouro, numero, bairro, complemento, cidade, estado, cep, principal)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id_endereco
                `, [
                    novoId,
                    usuario.endereco.rua,
                    usuario.endereco.numero,
                    usuario.endereco.bairro,
                    usuario.endereco.complemento || null,
                    usuario.endereco.cidade,
                    usuario.endereco.estado,
                    usuario.endereco.cep || null,
                    true
                ]);
                enderecoId = enderecoResult.rows[0].id_endereco;
            }
            await client.query('COMMIT');
            // Recarregar usuário com dados completos
            const usuarioCriado = await this.findById(novoId);
            if (usuarioCriado && enderecoId && usuario.endereco) {
                usuarioCriado.endereco = usuario.endereco;
                usuarioCriado.endereco.id = enderecoId;
            }
            return usuarioCriado;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async update(id, usuario) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Atualizar usuário
            const result = await client.query(`
                UPDATE usuarios
                SET nome = $1, email = $2, cpf = $3, telefone = $4,
                    tipo = $5, data_nascimento = $6, atualizado_em = CURRENT_TIMESTAMP
                WHERE id_cliente = $7
                RETURNING id_cliente
            `, [
                usuario.nome,
                usuario.email,
                usuario.cpf,
                usuario.telefone,
                usuario.tipo,
                usuario.dataNascimento,
                id
            ]);
            // Atualizar endereço se existir
            if (usuario.endereco?.id) {
                await client.query(`
                    UPDATE enderecos
                    SET logradouro = $1, numero = $2, bairro = $3, complemento = $4,
                        cidade = $5, estado = $6, cep = $7
                    WHERE id_endereco = $8
                `, [
                    usuario.endereco.rua,
                    usuario.endereco.numero,
                    usuario.endereco.bairro,
                    usuario.endereco.complemento || null,
                    usuario.endereco.cidade,
                    usuario.endereco.estado,
                    usuario.endereco.cep || null,
                    usuario.endereco.id
                ]);
            }
            await client.query('COMMIT');
            return this.mapRowToUsuario(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async delete(id) {
        const result = await this.db.query('DELETE FROM usuarios WHERE id_cliente = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    mapRowToUsuario(row) {
        const usuario = new models_1.Usuario(row.id, row.nome, row.email, row.senha, row.cpf, row.telefone, row.tipo, new Date(row.data_nascimento), undefined, new Date(row.criado_em), new Date(row.atualizado_em));
        if (row.rua) {
            usuario.endereco = new models_1.Endereco(row.endereco_id, row.rua, row.numero, row.bairro, row.complemento, row.cidade, row.estado, row.cep);
        }
        return usuario;
    }
}
exports.UsuarioRepository = UsuarioRepository;
class ProdutoRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const result = await this.db.query('SELECT *, id_produto AS id FROM produtos');
        return result.rows.map((row) => this.mapRowToProduto(row));
    }
    async findById(id) {
        const result = await this.db.query('SELECT *, id_produto AS id FROM produtos WHERE id_produto = $1', [id]);
        return result.rows.length > 0 ? this.mapRowToProduto(result.rows[0]) : null;
    }
    async findDisponiveis() {
        const result = await this.db.query('SELECT *, id_produto AS id FROM produtos WHERE disponivel = true');
        return result.rows.map((row) => this.mapRowToProduto(row));
    }
    async create(produto) {
        const result = await this.db.query(`
            INSERT INTO produtos (nome, descricao, preco, categoria, disponivel, imagem_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.categoria,
            produto.disponivel,
            produto.imagemUrl
        ]);
        return this.mapRowToProduto(result.rows[0]);
    }
    async update(id, produto) {
        const result = await this.db.query(`
            UPDATE produtos
            SET nome = $1, descricao = $2, preco = $3, categoria = $4,
                disponivel = $5, imagem_url = $6, atualizado_em = CURRENT_TIMESTAMP
            WHERE id_produto = $7
            RETURNING *
        `, [
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.categoria,
            produto.disponivel,
            produto.imagemUrl,
            id
        ]);
        return this.mapRowToProduto(result.rows[0]);
    }
    async delete(id) {
        const result = await this.db.query('DELETE FROM produtos WHERE id_produto = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    mapRowToProduto(row) {
        const id = row.id ?? row.id_produto;
        return new models_1.Produto(id, row.nome, row.descricao, Number(row.preco), row.categoria, row.disponivel, row.imagem_url, new Date(row.criado_em), new Date(row.atualizado_em));
    }
}
exports.ProdutoRepository = ProdutoRepository;
class PedidoRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const pedidos = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id_pedido = i.pedido_id
            ORDER BY p.id_pedido, i.id_item
        `);
        return this.agruparPedidosEItens(pedidos.rows);
    }
    async findById(id) {
        const result = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id_pedido = i.pedido_id
            WHERE p.id_pedido = $1
            ORDER BY i.id_item
        `, [id]);
        if (result.rows.length === 0)
            return null;
        const [pedido] = this.agruparPedidosEItens(result.rows);
        return pedido;
    }
    async findByUsuario(usuarioId) {
        // Buscar email do usuário e procurar pedidos por cliente_email
        const userRes = await this.db.query('SELECT email FROM usuarios WHERE id_cliente = $1', [usuarioId]);
        if (userRes.rows.length === 0)
            return [];
        const email = userRes.rows[0].email;
        const result = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id_pedido = i.pedido_id
            WHERE p.cliente_email = $1
            ORDER BY p.id_pedido, i.id_item
        `, [email]);
        const pedidos = this.agruparPedidosEItens(result.rows);
        for (const p of pedidos)
            p.clienteId = usuarioId;
        return pedidos;
    }
    async create(pedido) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Criar pedido
            const pedidoResult = await client.query(`
                INSERT INTO pedidos (
                    cliente_email, cliente_nome, cliente_telefone,
                    tipo_entrega, endereco_entrega_id, subtotal_original,
                    total_descontos, total, status, forma_pagamento,
                    observacoes, promocoes_aplicadas
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id_pedido
            `, [
                pedido.clienteEmail,
                pedido.clienteNome,
                pedido.clienteTelefone,
                pedido.tipoEntrega,
                pedido.enderecoEntrega?.id,
                pedido.subtotalOriginal,
                pedido.totalDescontos,
                pedido.total,
                pedido.status,
                pedido.formaPagamento,
                pedido.observacoes,
                pedido.promocoesAplicadas
            ]);
            const pedidoId = pedidoResult.rows[0].id_pedido;
            // Criar itens do pedido
            for (const item of pedido.itens) {
                await client.query(`
                    INSERT INTO itens_pedido (
                        pedido_id, produto_id, nome_produto, quantidade,
                        preco_unitario, preco_original, desconto_aplicado,
                        subtotal, promocao_aplicada, observacoes
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                    pedidoId,
                    item.produtoId,
                    item.nomeProduto,
                    item.quantidade,
                    item.precoUnitario,
                    item.precoOriginal,
                    item.descontoAplicado,
                    item.subtotal,
                    item.promocaoAplicada,
                    item.observacoes
                ]);
            }
            await client.query('COMMIT');
            return await this.findById(pedidoId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async update(id, pedido) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Atualizar pedido
            await client.query(`
                UPDATE pedidos
                SET status = $1, atualizado_em = CURRENT_TIMESTAMP
                WHERE id_pedido = $2
            `, [pedido.status, id]);
            await client.query('COMMIT');
            return await this.findById(id);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    agruparPedidosEItens(rows) {
        const pedidosMap = new Map();
        for (const row of rows) {
            const pedidoKey = row.id_pedido ?? row.id;
            if (!pedidosMap.has(pedidoKey)) {
                const pedido = new models_1.Pedido(pedidoKey, undefined, row.cliente_nome, row.cliente_email, row.cliente_telefone, row.tipo_entrega, row.endereco_entrega_id ? new models_1.Endereco(row.endereco_entrega_id) : undefined, [], Number(row.subtotal_original) || 0, Number(row.total_descontos) || 0, Number(row.total) || 0, row.status, row.forma_pagamento, row.observacoes, row.promocoes_aplicadas || [], new Date(row.criado_em), new Date(row.atualizado_em));
                pedidosMap.set(pedidoKey, pedido);
            }
            if (row.id_item) {
                const pedido = pedidosMap.get(pedidoKey);
                const item = new models_1.ItemPedido(row.id_item, row.pedido_id, row.produto_id, row.nome_produto, row.quantidade, Number(row.preco_unitario) || 0, Number(row.preco_original) || 0, Number(row.desconto_aplicado) || 0, Number(row.subtotal) || 0, row.promocao_aplicada, row.observacoes);
                pedido.itens.push(item);
            }
        }
        return Array.from(pedidosMap.values());
    }
}
exports.PedidoRepository = PedidoRepository;
class PromocaoRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const result = await this.db.query('SELECT *, id_promocao AS id FROM promocoes');
        return result.rows.map((row) => this.mapRowToPromocao(row));
    }
    async findById(id) {
        const result = await this.db.query('SELECT *, id_promocao AS id FROM promocoes WHERE id_promocao = $1', [id]);
        return result.rows.length > 0 ? this.mapRowToPromocao(result.rows[0]) : null;
    }
    async findAtivas() {
        const result = await this.db.query(`
            SELECT * FROM promocoes
            WHERE ativa = true
            AND (data_fim IS NULL OR data_fim > CURRENT_TIMESTAMP)
            AND data_inicio <= CURRENT_TIMESTAMP
        `);
        return result.rows.map((row) => this.mapRowToPromocao(row));
    }
    async create(promocao) {
        const result = await this.db.query(`
            INSERT INTO promocoes (
                nome, descricao, tipo_desconto, valor_desconto,
                dia_semana, categoria_aplicavel, produto_especifico,
                valor_minimo_pedido, ativa, data_inicio, data_fim
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            promocao.nome,
            promocao.descricao,
            promocao.tipoDesconto,
            promocao.valorDesconto,
            promocao.diaSemana,
            promocao.categoriaAplicavel,
            promocao.produtoEspecifico,
            promocao.valorMinimoPedido,
            promocao.ativa,
            promocao.dataInicio,
            promocao.dataFim
        ]);
        return this.mapRowToPromocao(result.rows[0]);
    }
    async update(id, promocao) {
        const result = await this.db.query(`
            UPDATE promocoes
            SET nome = $1, descricao = $2, tipo_desconto = $3,
                valor_desconto = $4, dia_semana = $5, categoria_aplicavel = $6,
                produto_especifico = $7, valor_minimo_pedido = $8, ativa = $9,
                data_inicio = $10, data_fim = $11
            WHERE id_promocao = $12
            RETURNING *
        `, [
            promocao.nome,
            promocao.descricao,
            promocao.tipoDesconto,
            promocao.valorDesconto,
            promocao.diaSemana,
            promocao.categoriaAplicavel,
            promocao.produtoEspecifico,
            promocao.valorMinimoPedido,
            promocao.ativa,
            promocao.dataInicio,
            promocao.dataFim,
            id
        ]);
        return this.mapRowToPromocao(result.rows[0]);
    }
    async delete(id) {
        const result = await this.db.query('DELETE FROM promocoes WHERE id_promocao = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    mapRowToPromocao(row) {
        const id = row.id ?? row.id_promocao;
        return new models_1.Promocao(id, row.nome, row.descricao, row.tipo_desconto, Number(row.valor_desconto), row.dia_semana, row.categoria_aplicavel, row.produto_especifico, row.valor_minimo_pedido, row.ativa, new Date(row.data_inicio), row.data_fim ? new Date(row.data_fim) : undefined);
    }
}
exports.PromocaoRepository = PromocaoRepository;
