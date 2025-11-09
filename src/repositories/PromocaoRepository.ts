import Database from '../database/Database';
import { Promocao } from '../models';

export class PromocaoRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Promocao[]> {
        const res = await this.db.query('SELECT * FROM promocoes ORDER BY id_promocao');
        return res.rows.map((r: any) => this.mapRowToPromocao(r));
    }

    async findById(id: number): Promise<Promocao | null> {
        const res = await this.db.query('SELECT * FROM promocoes WHERE id_promocao=$1', [id]);
        return res.rows.length ? this.mapRowToPromocao(res.rows[0]) : null;
    }

    async findAtivas(): Promise<Promocao[]> {
        const res = await this.db.query(`
            SELECT * FROM promocoes
            WHERE ativa = true
            AND (data_fim IS NULL OR data_fim > CURRENT_TIMESTAMP)
            AND data_inicio <= CURRENT_TIMESTAMP
            ORDER BY id_promocao
        `);
        return res.rows.map((r: any) => this.mapRowToPromocao(r));
    }

    async create(promocao: Promocao): Promise<Promocao> {
        const res = await this.db.query(`
            INSERT INTO promocoes (nome, descricao, tipo_desconto, valor_desconto, dia_semana, 
                                  categoria_aplicavel, produto_especifico, valor_minimo_pedido, 
                                  ativa, data_inicio, data_fim)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
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

        return this.mapRowToPromocao(res.rows[0]);
    }

    async update(id: number, promocao: Promocao): Promise<Promocao> {
        const res = await this.db.query(`
            UPDATE promocoes SET nome=$1, descricao=$2, tipo_desconto=$3, valor_desconto=$4, 
                   dia_semana=$5, categoria_aplicavel=$6, produto_especifico=$7, 
                   valor_minimo_pedido=$8, ativa=$9, data_inicio=$10, data_fim=$11
            WHERE id_promocao=$12 RETURNING *
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

        return this.mapRowToPromocao(res.rows[0]);
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.query('DELETE FROM promocoes WHERE id_promocao=$1', [id]);
        return (res.rowCount ?? 0) > 0;
    }

    private mapRowToPromocao(row: any): Promocao {
        if (!row) return row;
        return new Promocao(
            row.id_promocao,
            row.nome,
            row.descricao,
            row.tipo_desconto,
            Number(row.valor_desconto),
            row.dia_semana,
            row.categoria_aplicavel,
            row.produto_especifico,
            row.valor_minimo_pedido ? Number(row.valor_minimo_pedido) : undefined,
            row.ativa,
            row.data_inicio ? new Date(row.data_inicio) : new Date(),
            row.data_fim ? new Date(row.data_fim) : undefined
        );
    }
}

export default PromocaoRepository;