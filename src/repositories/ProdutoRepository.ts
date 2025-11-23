import Database from '../database/Database';
import { Produto } from '../models';

export class ProdutoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Produto[]> {
        const res = await this.db.query('SELECT * FROM produtos ORDER BY id_produto');
        return res.rows.map((r: any) => this.mapRowToProduto(r));
    }

    async findById(id: number): Promise<Produto | null> {
        const res = await this.db.query('SELECT * FROM produtos WHERE id_produto=$1', [id]);
        return res.rows.length ? this.mapRowToProduto(res.rows[0]) : null;
    }

    async findDisponiveis(): Promise<Produto[]> {
        const res = await this.db.query('SELECT * FROM produtos WHERE disponivel = true ORDER BY id_produto');
        return res.rows.map((r: any) => this.mapRowToProduto(r));
    }

    async create(produto: Produto): Promise<Produto> {
        const res = await this.db.query(`
            INSERT INTO produtos (nome, descricao, preco, categoria, disponivel, imagem_url)
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
        `, [produto.nome, produto.descricao, produto.preco, produto.categoria, produto.disponivel, produto.imagemUrl]);

        return this.mapRowToProduto(res.rows[0]);
    }

    async update(id: number, produto: Produto): Promise<Produto> {
        const res = await this.db.query(`
            UPDATE produtos SET nome=$1, descricao=$2, preco=$3, categoria=$4, 
                   disponivel=$5, imagem_url=$6, atualizado_em=CURRENT_TIMESTAMP
            WHERE id_produto=$7 RETURNING *
        `, [produto.nome, produto.descricao, produto.preco, produto.categoria, 
            produto.disponivel, produto.imagemUrl, id]);

        return this.mapRowToProduto(res.rows[0]);
    }

    async delete(id: number): Promise<boolean> {
        try {
            const res = await this.db.query('DELETE FROM produtos WHERE id_produto=$1', [id]);
            return (res.rowCount ?? 0) > 0;
        } catch (err: any) {
            // Tratamento para violações de integridade (ex: existe itens_pedido referenciando o produto)
            // Código Postgres para foreign key violation: '23503'
            if (err && (err.code === '23503' || String(err.message).toLowerCase().includes('foreign'))) {
                // Em vez de excluir fisicamente, marcamos como indisponível (remoção lógica)
                await this.db.query('UPDATE produtos SET disponivel = false, atualizado_em = CURRENT_TIMESTAMP WHERE id_produto = $1', [id]);
                return true;
            }
            throw err;
        }
    }

    private mapRowToProduto(row: any): Produto {
        if (!row) return row;
        return new Produto(
            row.id_produto,
            row.nome,
            row.descricao,
            Number(row.preco),
            row.categoria,
            row.disponivel,
            row.imagem_url,
            row.criado_em ? new Date(row.criado_em) : new Date(),
            row.atualizado_em ? new Date(row.atualizado_em) : new Date()
        );
    }
}

export default ProdutoRepository;