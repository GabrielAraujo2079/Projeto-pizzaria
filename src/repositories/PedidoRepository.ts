import Database from '../database/Database';
import { Pedido, ItemPedido, Endereco } from '../models/Entidades';

export class PedidoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Pedido[]> {
        const res = await this.db.query(`
            SELECT p.*, ip.id_item AS item_id, ip.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
            FROM pedidos p
            LEFT JOIN itens_pedido ip ON p.id_pedido = ip.pedido_id
            LEFT JOIN enderecos e ON p.endereco_entrega_id = e.id_endereco
            ORDER BY p.id_pedido, ip.id_item
        `);
        return this.agruparPedidosEItens(res.rows);
    }

    async findById(id: number): Promise<Pedido | null> {
        const res = await this.db.query(`
            SELECT p.*, ip.id_item AS item_id, ip.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
            FROM pedidos p
            LEFT JOIN itens_pedido ip ON p.id_pedido = ip.pedido_id
            LEFT JOIN enderecos e ON p.endereco_entrega_id = e.id_endereco
            WHERE p.id_pedido = $1
            ORDER BY ip.id_item
        `, [id]);
        if (!res.rows.length) return null;
        const pedidos = this.agruparPedidosEItens(res.rows);
        return pedidos[0] || null;
    }

    async findByUsuario(userId: number): Promise<Pedido[]> {
        const res = await this.db.query(`
            SELECT p.*, ip.id_item AS item_id, ip.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
            FROM pedidos p
            LEFT JOIN itens_pedido ip ON p.id_pedido = ip.pedido_id
            LEFT JOIN enderecos e ON p.endereco_entrega_id = e.id_endereco
            WHERE p.cliente_email = (SELECT email FROM usuarios WHERE id_cliente = $1)
            ORDER BY p.id_pedido, ip.id_item
        `, [userId]);

        return this.agruparPedidosEItens(res.rows);
    }

    async create(pedido: Pedido): Promise<Pedido> {
        const client = await (this.db as any).getClient();
        try {
            await client.query('BEGIN');
            // Salva o endereço e obtém o id
            const endereco = pedido.enderecoEntrega;
            let enderecoId = null;
            if (endereco) {
                const enderecoRes = await client.query(`
                    INSERT INTO enderecos (usuario_id, logradouro, numero, complemento, bairro, cidade, estado, cep, principal)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
                    RETURNING id_endereco
                `, [
                    pedido.clienteId || null,
                    endereco.rua,
                    endereco.numero,
                    endereco.complemento || null,
                    endereco.bairro,
                    endereco.cidade,
                    endereco.estado,
                    endereco.cep
                ]);
                enderecoId = enderecoRes.rows[0].id_endereco;
            }

            const orderRes = await client.query(`
                INSERT INTO pedidos (cliente_nome, cliente_email, cliente_telefone, tipo_entrega, 
                                    endereco_entrega_id, subtotal_original, total_descontos, total, 
                                    status, forma_pagamento, observacoes, promocoes_aplicadas)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id_pedido
            `, [
                pedido.clienteNome, 
                pedido.clienteEmail, 
                pedido.clienteTelefone, 
                pedido.tipoEntrega,
                enderecoId,
                pedido.subtotalOriginal,
                pedido.totalDescontos,
                pedido.total,
                pedido.status,
                pedido.formaPagamento,
                pedido.observacoes || null,
                pedido.promocoesAplicadas || null
            ]);

            const orderId = orderRes.rows[0].id_pedido;

            for (const item of pedido.itens) {
                await client.query(`
                    INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, quantidade, 
                                             preco_unitario, preco_original, desconto_aplicado, 
                                             subtotal, promocao_aplicada, observacoes)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                `, [
                    orderId,
                    item.produtoId,
                    item.nomeProduto,
                    item.quantidade,
                    item.precoUnitario,
                    item.precoOriginal,
                    item.descontoAplicado,
                    item.subtotal,
                    item.promocaoAplicada || null,
                    item.observacoes || null
                ]);
            }

            await client.query('COMMIT');
            return (await this.findById(orderId)) as Pedido;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async update(id: number, pedido: Pedido): Promise<Pedido> {
        await this.db.query(`
            UPDATE pedidos SET status=$1, atualizado_em=CURRENT_TIMESTAMP 
            WHERE id_pedido=$2
        `, [pedido.status, id]);
        return (await this.findById(id)) as Pedido;
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.query('DELETE FROM pedidos WHERE id_pedido = $1', [id]);
        return (res.rowCount ?? 0) > 0;
    }

    private agruparPedidosEItens(rows: any[]): Pedido[] {
        const map = new Map<number, Pedido>();
        
        for (const row of rows) {
            const pedidoKey = row.id_pedido;
            if (!map.has(pedidoKey)) {
                // Se vierem campos do endereço, monta o objeto completo
                let endereco = undefined;
                if (row.endereco_entrega_id && row.logradouro) {
                    endereco = new Endereco(
                        row.endereco_entrega_id,
                        row.logradouro, // rua
                        row.numero,
                        row.bairro,
                        row.complemento,
                        row.cidade,
                        row.estado,
                        row.cep
                    );
                    // Adiciona alias para compatibilidade com frontend
                    endereco.rua = row.logradouro;
                }
                const p = new Pedido(
                    row.id_pedido,
                    undefined, // clienteId não está no schema português
                    row.cliente_nome,
                    row.cliente_email,
                    row.cliente_telefone,
                    row.tipo_entrega,
                    endereco,
                    [],
                    Number(row.subtotal_original) || 0,
                    Number(row.total_descontos) || 0,
                    Number(row.total) || 0,
                    row.status,
                    row.forma_pagamento,
                    row.observacoes,
                    row.promocoes_aplicadas || [],
                    row.criado_em ? new Date(row.criado_em) : new Date(),
                    row.atualizado_em ? new Date(row.atualizado_em) : new Date()
                );
                map.set(pedidoKey, p);
            }

            if (row.item_id) {
                const pedido = map.get(pedidoKey)!;
                const item = new ItemPedido(
                    row.item_id,
                    row.pedido_id,
                    row.produto_id,
                    row.nome_produto,
                    row.quantidade,
                    Number(row.preco_unitario) || 0,
                    Number(row.preco_original) || 0,
                    Number(row.desconto_aplicado) || 0,
                    Number(row.subtotal) || 0,
                    row.promocao_aplicada,
                    row.observacoes
                );
                pedido.itens.push(item);
            }
        }
        
        return Array.from(map.values());
    }
}

export default PedidoRepository;