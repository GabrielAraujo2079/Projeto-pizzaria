import { Database } from './database';
import { Usuario, Produto, Pedido, ItemPedido, Promocao, Endereco } from './models';
import * as bcrypt from 'bcrypt';

export class UsuarioRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Usuario[]> {
        const result = await this.db.query(`
            SELECT u.*, 
                   e.rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep
            FROM usuarios u
            LEFT JOIN enderecos e ON u.endereco_id = e.id
        `);

        return result.rows.map((row: any) => this.mapRowToUsuario(row));
    }

    async findById(id: number): Promise<Usuario | null> {
        const result = await this.db.query(`
            SELECT u.*, 
                   e.rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep
            FROM usuarios u
            LEFT JOIN enderecos e ON u.endereco_id = e.id
            WHERE u.id = $1
        `, [id]);

        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const result = await this.db.query(`
            SELECT u.*, 
                   e.rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep
            FROM usuarios u
            LEFT JOIN enderecos e ON u.endereco_id = e.id
            WHERE u.email = $1
        `, [email]);

        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }

    async findByCpf(cpf: string): Promise<Usuario | null> {
        const result = await this.db.query(`
            SELECT u.*, 
                   e.rua, e.numero, e.bairro, e.complemento, e.cidade, e.estado, e.cep
            FROM usuarios u
            LEFT JOIN enderecos e ON u.endereco_id = e.id
            WHERE u.cpf = $1
        `, [cpf]);

        return result.rows.length > 0 ? this.mapRowToUsuario(result.rows[0]) : null;
    }

    async autenticar(email: string, senha: string): Promise<Usuario | null> {
        const usuario = await this.findByEmail(email);
        
        if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
            return null;
        }

        return usuario;
    }

    async create(usuario: Usuario): Promise<Usuario> {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            // Criar endereço primeiro
            let enderecoId = null;
            if (usuario.endereco) {
                const enderecoResult = await client.query(`
                    INSERT INTO enderecos (rua, numero, bairro, complemento, cidade, estado, cep)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                `, [
                    usuario.endereco.rua,
                    usuario.endereco.numero,
                    usuario.endereco.bairro,
                    usuario.endereco.complemento || null,
                    usuario.endereco.cidade,
                    usuario.endereco.estado,
                    usuario.endereco.cep || null
                ]);
                enderecoId = enderecoResult.rows[0].id;
            }

            // Hash da senha
            const senhaHash = bcrypt.hashSync(usuario.senha, 10);

            // Criar usuário
            const result = await client.query(`
                INSERT INTO usuarios (nome, email, senha, cpf, telefone, tipo, data_nascimento, endereco_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                usuario.nome,
                usuario.email,
                senhaHash,
                usuario.cpf,
                usuario.telefone,
                usuario.tipo,
                usuario.dataNascimento,
                enderecoId
            ]);

            await client.query('COMMIT');

            const novoUsuario = this.mapRowToUsuario(result.rows[0]);
            if (enderecoId && usuario.endereco) {
                novoUsuario.endereco = usuario.endereco;
                novoUsuario.endereco.id = enderecoId;
            }

            return novoUsuario;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: number, usuario: Usuario): Promise<Usuario> {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            // Atualizar endereço se existir
            if (usuario.endereco?.id) {
                await client.query(`
                    UPDATE enderecos
                    SET rua = $1, numero = $2, bairro = $3, complemento = $4,
                        cidade = $5, estado = $6, cep = $7
                    WHERE id = $8
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

            // Atualizar usuário
            const result = await client.query(`
                UPDATE usuarios
                SET nome = $1, email = $2, cpf = $3, telefone = $4,
                    tipo = $5, data_nascimento = $6, atualizado_em = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *
            `, [
                usuario.nome,
                usuario.email,
                usuario.cpf,
                usuario.telefone,
                usuario.tipo,
                usuario.dataNascimento,
                id
            ]);

            await client.query('COMMIT');

            return this.mapRowToUsuario(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.db.query('DELETE FROM usuarios WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    private mapRowToUsuario(row: any): Usuario {
        const usuario = new Usuario(
            row.id,
            row.nome,
            row.email,
            row.senha,
            row.cpf,
            row.telefone,
            row.tipo,
            new Date(row.data_nascimento),
            undefined,
            new Date(row.criado_em),
            new Date(row.atualizado_em)
        );

        if (row.rua) {
            usuario.endereco = new Endereco(
                row.endereco_id,
                row.rua,
                row.numero,
                row.bairro,
                row.complemento,
                row.cidade,
                row.estado,
                row.cep
            );
        }

        return usuario;
    }
}

export class ProdutoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Produto[]> {
        const result = await this.db.query('SELECT * FROM produtos');
        return result.rows.map((row: any) => this.mapRowToProduto(row));
    }

    async findById(id: number): Promise<Produto | null> {
        const result = await this.db.query('SELECT * FROM produtos WHERE id = $1', [id]);
        return result.rows.length > 0 ? this.mapRowToProduto(result.rows[0]) : null;
    }

    async findDisponiveis(): Promise<Produto[]> {
        const result = await this.db.query('SELECT * FROM produtos WHERE disponivel = true');
        return result.rows.map((row: any) => this.mapRowToProduto(row));
    }

    async create(produto: Produto): Promise<Produto> {
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

    async update(id: number, produto: Produto): Promise<Produto> {
        const result = await this.db.query(`
            UPDATE produtos
            SET nome = $1, descricao = $2, preco = $3, categoria = $4,
                disponivel = $5, imagem_url = $6, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $7
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

    async delete(id: number): Promise<boolean> {
        const result = await this.db.query('DELETE FROM produtos WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    private mapRowToProduto(row: any): Produto {
        return new Produto(
            row.id,
            row.nome,
            row.descricao,
            row.preco,
            row.categoria,
            row.disponivel,
            row.imagem_url,
            new Date(row.criado_em),
            new Date(row.atualizado_em)
        );
    }
}

export class PedidoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Pedido[]> {
        const pedidos = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id = i.pedido_id
            ORDER BY p.id, i.id
        `);

        return this.agruparPedidosEItens(pedidos.rows);
    }

    async findById(id: number): Promise<Pedido | null> {
        const result = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id = i.pedido_id
            WHERE p.id = $1
            ORDER BY i.id
        `, [id]);

        if (result.rows.length === 0) return null;

        const [pedido] = this.agruparPedidosEItens(result.rows);
        return pedido;
    }

    async findByUsuario(usuarioId: number): Promise<Pedido[]> {
        const result = await this.db.query(`
            SELECT p.*, i.* FROM pedidos p
            LEFT JOIN itens_pedido i ON p.id = i.pedido_id
            WHERE p.cliente_id = $1
            ORDER BY p.id, i.id
        `, [usuarioId]);

        return this.agruparPedidosEItens(result.rows);
    }

    async create(pedido: Pedido): Promise<Pedido> {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            // Criar pedido
            const pedidoResult = await client.query(`
                INSERT INTO pedidos (
                    cliente_id, cliente_nome, cliente_email, cliente_telefone,
                    tipo_entrega, endereco_entrega_id, subtotal_original,
                    total_descontos, total, status, forma_pagamento,
                    observacoes, promocoes_aplicadas
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `, [
                pedido.clienteId,
                pedido.clienteNome,
                pedido.clienteEmail,
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

            const pedidoId = pedidoResult.rows[0].id;

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

            return await this.findById(pedidoId) as Pedido;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: number, pedido: Pedido): Promise<Pedido> {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            // Atualizar pedido
            await client.query(`
                UPDATE pedidos
                SET status = $1, atualizado_em = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [pedido.status, id]);

            await client.query('COMMIT');

            return await this.findById(id) as Pedido;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private agruparPedidosEItens(rows: any[]): Pedido[] {
        const pedidosMap = new Map<number, Pedido>();

        for (const row of rows) {
            if (!pedidosMap.has(row.id)) {
                const pedido = new Pedido(
                    row.id,
                    row.cliente_id,
                    row.cliente_nome,
                    row.cliente_email,
                    row.cliente_telefone,
                    row.tipo_entrega,
                    row.endereco_entrega_id ? new Endereco(row.endereco_entrega_id) : undefined,
                    [],
                    row.subtotal_original,
                    row.total_descontos,
                    row.total,
                    row.status,
                    row.forma_pagamento,
                    row.observacoes,
                    row.promocoes_aplicadas,
                    new Date(row.criado_em),
                    new Date(row.atualizado_em)
                );
                pedidosMap.set(row.id, pedido);
            }

            if (row.pedido_id) {
                const pedido = pedidosMap.get(row.id)!;
                const item = new ItemPedido(
                    row.id,
                    row.pedido_id,
                    row.produto_id,
                    row.nome_produto,
                    row.quantidade,
                    row.preco_unitario,
                    row.preco_original,
                    row.desconto_aplicado,
                    row.subtotal,
                    row.promocao_aplicada,
                    row.observacoes
                );
                pedido.itens.push(item);
            }
        }

        return Array.from(pedidosMap.values());
    }
}

export class PromocaoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Promocao[]> {
        const result = await this.db.query('SELECT * FROM promocoes');
        return result.rows.map((row: any) => this.mapRowToPromocao(row));
    }

    async findById(id: number): Promise<Promocao | null> {
        const result = await this.db.query('SELECT * FROM promocoes WHERE id = $1', [id]);
        return result.rows.length > 0 ? this.mapRowToPromocao(result.rows[0]) : null;
    }

    async findAtivas(): Promise<Promocao[]> {
        const result = await this.db.query(`
            SELECT * FROM promocoes
            WHERE ativa = true
            AND (data_fim IS NULL OR data_fim > CURRENT_TIMESTAMP)
            AND data_inicio <= CURRENT_TIMESTAMP
        `);
        return result.rows.map((row: any) => this.mapRowToPromocao(row));
    }

    async create(promocao: Promocao): Promise<Promocao> {
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

    async update(id: number, promocao: Promocao): Promise<Promocao> {
        const result = await this.db.query(`
            UPDATE promocoes
            SET nome = $1, descricao = $2, tipo_desconto = $3,
                valor_desconto = $4, dia_semana = $5, categoria_aplicavel = $6,
                produto_especifico = $7, valor_minimo_pedido = $8, ativa = $9,
                data_inicio = $10, data_fim = $11
            WHERE id = $12
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

    async delete(id: number): Promise<boolean> {
        const result = await this.db.query('DELETE FROM promocoes WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    private mapRowToPromocao(row: any): Promocao {
        return new Promocao(
            row.id,
            row.nome,
            row.descricao,
            row.tipo_desconto,
            row.valor_desconto,
            row.dia_semana,
            row.categoria_aplicavel,
            row.produto_especifico,
            row.valor_minimo_pedido,
            row.ativa,
            new Date(row.data_inicio),
            row.data_fim ? new Date(row.data_fim) : undefined
        );
    }
}