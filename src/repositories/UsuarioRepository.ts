import Database from '../database/Database';
import { Usuario, Endereco } from '../models';

export class UsuarioRepository {
    constructor(private db: Database) {}

    async findAll(): Promise<Usuario[]> {
        const res = await this.db.query(`
            SELECT u.*, a.id_endereco AS address_id, a.logradouro AS rua, a.numero, a.bairro, 
                   a.complemento, a.cidade, a.estado, a.cep
            FROM usuarios u
            LEFT JOIN enderecos a ON a.usuario_id = u.id_cliente AND a.principal = true
            ORDER BY u.id_cliente
        `);

        return res.rows.map((r: any) => this.mapRowToUsuario(r));
    }

    async findById(id: number): Promise<Usuario | null> {
        const res = await this.db.query(`
            SELECT u.*, a.id_endereco AS address_id, a.logradouro AS rua, a.numero, a.bairro,
                   a.complemento, a.cidade, a.estado, a.cep
            FROM usuarios u
            LEFT JOIN enderecos a ON a.usuario_id = u.id_cliente AND a.principal = true
            WHERE u.id_cliente = $1
        `, [id]);

        return res.rows.length ? this.mapRowToUsuario(res.rows[0]) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const res = await this.db.query(`
            SELECT u.*, a.id_endereco AS address_id, a.logradouro AS rua, a.numero, a.bairro,
                   a.complemento, a.cidade, a.estado, a.cep
            FROM usuarios u
            LEFT JOIN enderecos a ON a.usuario_id = u.id_cliente AND a.principal = true
            WHERE u.email = $1
        `, [email]);

        return res.rows.length ? this.mapRowToUsuario(res.rows[0]) : null;
    }

    async create(usuario: Usuario): Promise<Usuario> {
        const client = await (this.db as any).getClient();
        try {
            await client.query('BEGIN');
            const result = await client.query(`
                INSERT INTO usuarios (nome, senha, cpf, email, tipo, data_nascimento, telefone)
                VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
            `, [usuario.nome, usuario.senha, usuario.cpf, usuario.email, usuario.tipo, usuario.dataNascimento, usuario.telefone]);

            const novo = result.rows[0];
            if (usuario.endereco) {
                // Garantir que não enviamos nulls para colunas que podem ser NOT NULL no DB
                const complemento = usuario.endereco.complemento !== undefined && usuario.endereco.complemento !== null
                    ? usuario.endereco.complemento
                    : '';
                const cep = usuario.endereco.cep !== undefined && usuario.endereco.cep !== null
                    ? usuario.endereco.cep
                    : '';

                await client.query(`
                    INSERT INTO enderecos (usuario_id, logradouro, numero, bairro, complemento, cidade, estado, cep, principal)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *
                `, [novo.id_cliente, usuario.endereco.rua, usuario.endereco.numero, usuario.endereco.bairro,
                    complemento, usuario.endereco.cidade, usuario.endereco.estado,
                    cep]);
            }

            await client.query('COMMIT');
            return (await this.findById(novo.id_cliente)) as Usuario;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async update(id: number, usuario: Usuario): Promise<Usuario> {
        const client = await (this.db as any).getClient();
        try {
            await client.query('BEGIN');
            console.log(`UsuarioRepository.update: id=${id}, enderecoProvided=${!!usuario.endereco}, enderecoId=${usuario.endereco && usuario.endereco.id}`);
            await client.query(`
                UPDATE usuarios SET nome=$1, email=$2, cpf=$3, telefone=$4, tipo=$5,
                       data_nascimento=$6, senha=COALESCE(NULLIF($7, ''), senha), atualizado_em=CURRENT_TIMESTAMP
                WHERE id_cliente=$8
            `, [usuario.nome, usuario.email, usuario.cpf, usuario.telefone, usuario.tipo, usuario.dataNascimento, usuario.senha || '', id]);

            if (usuario.endereco && usuario.endereco.id) {
                console.log(`UsuarioRepository.update: updating existing endereco id=${usuario.endereco.id}`);
                const complemento = usuario.endereco.complemento !== undefined && usuario.endereco.complemento !== null
                    ? usuario.endereco.complemento
                    : '';
                const cep = usuario.endereco.cep !== undefined && usuario.endereco.cep !== null
                    ? usuario.endereco.cep
                    : '';

                await client.query(`
                    UPDATE enderecos SET logradouro=$1, numero=$2, bairro=$3, complemento=$4, 
                           cidade=$5, estado=$6, cep=$7, atualizado_em=CURRENT_TIMESTAMP
                    WHERE id_endereco=$8
                `, [usuario.endereco.rua, usuario.endereco.numero, usuario.endereco.bairro,
                    complemento, usuario.endereco.cidade, usuario.endereco.estado,
                    cep, usuario.endereco.id]);
            }
            else if (usuario.endereco) {
                console.log('UsuarioRepository.update: inserting new endereco for usuario id=', id);
                // inserir novo endereço do usuário
                const complemento = usuario.endereco.complemento !== undefined && usuario.endereco.complemento !== null
                    ? usuario.endereco.complemento
                    : '';
                const cep = usuario.endereco.cep !== undefined && usuario.endereco.cep !== null
                    ? usuario.endereco.cep
                    : '';

                await client.query(`
                    INSERT INTO enderecos (usuario_id, logradouro, numero, bairro, complemento, cidade, estado, cep, principal)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
                `, [id, usuario.endereco.rua, usuario.endereco.numero, usuario.endereco.bairro,
                    complemento, usuario.endereco.cidade, usuario.endereco.estado, cep]);
            }

            await client.query('COMMIT');
            return (await this.findById(id)) as Usuario;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.query('DELETE FROM usuarios WHERE id_cliente = $1', [id]);
        return (res.rowCount ?? 0) > 0;
    }

    private mapRowToUsuario(row: any): Usuario {
        if (!row) return row;
        const usuario = new Usuario(
            row.id_cliente,
            row.nome,
            row.email,
            row.senha,
            row.cpf,
            row.telefone,
            row.tipo,
            row.data_nascimento ? new Date(row.data_nascimento) : new Date(),
            undefined,
            row.criado_em ? new Date(row.criado_em) : new Date(),
            row.atualizado_em ? new Date(row.atualizado_em) : new Date()
        );

        if (row.rua || row.address_id) {
            usuario.endereco = new Endereco(
                row.address_id, 
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

export default UsuarioRepository;