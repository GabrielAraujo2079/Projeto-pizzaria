import { Pool, PoolClient } from 'pg';
import { Usuario, Endereco } from './models';
import * as bcrypt from 'bcrypt';

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor(config: DatabaseConfig) {
        this.pool = new Pool(config);
    }

    static getInstance(config: DatabaseConfig): Database {
        if (!Database.instance) {
            Database.instance = new Database(config);
        }
        return Database.instance;
    }

    async query(text: string, params?: any[]): Promise<any> {
        const client = await this.pool.connect();
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    }

    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    async close(): Promise<void> {
        await this.pool.end();
    }

    // Criar todas as tabelas
    async inicializarTabelas(): Promise<void> {
        const queries = [
            `CREATE TABLE IF NOT EXISTS enderecos (
                id SERIAL PRIMARY KEY,
                rua VARCHAR(255) NOT NULL,
                numero VARCHAR(20) NOT NULL,
                bairro VARCHAR(100) NOT NULL,
                complemento VARCHAR(255),
                cidade VARCHAR(100) DEFAULT 'Campinas',
                estado CHAR(2) DEFAULT 'SP',
                cep VARCHAR(10),
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                cpf VARCHAR(11) UNIQUE NOT NULL,
                telefone VARCHAR(11) NOT NULL,
                tipo VARCHAR(10) CHECK (tipo IN ('admin', 'cliente')) DEFAULT 'cliente',
                data_nascimento DATE NOT NULL,
                endereco_id INTEGER REFERENCES enderecos(id),
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10,2) NOT NULL,
                categoria VARCHAR(20) CHECK (categoria IN ('pizza', 'bebida', 'sobremesa')) NOT NULL,
                disponivel BOOLEAN DEFAULT true,
                imagem_url VARCHAR(500),
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS promocoes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                tipo_desconto VARCHAR(20) CHECK (tipo_desconto IN ('percentual', 'valor_fixo')) NOT NULL,
                valor_desconto DECIMAL(10,2) NOT NULL,
                dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
                categoria_aplicavel VARCHAR(20) CHECK (categoria_aplicavel IN ('pizza', 'bebida', 'sobremesa', 'todos')) DEFAULT 'todos',
                produto_especifico INTEGER REFERENCES produtos(id),
                valor_minimo_pedido DECIMAL(10,2),
                ativa BOOLEAN DEFAULT true,
                data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_fim TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES usuarios(id),
                cliente_nome VARCHAR(255) NOT NULL,
                cliente_email VARCHAR(255) NOT NULL,
                cliente_telefone VARCHAR(11) NOT NULL,
                tipo_entrega VARCHAR(10) CHECK (tipo_entrega IN ('entrega', 'retirada')) DEFAULT 'retirada',
                endereco_entrega_id INTEGER REFERENCES enderecos(id),
                subtotal_original DECIMAL(10,2) NOT NULL,
                total_descontos DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')) DEFAULT 'pendente',
                forma_pagamento VARCHAR(10) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'debito', 'credito')) DEFAULT 'dinheiro',
                observacoes TEXT,
                promocoes_aplicadas TEXT[],
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS itens_pedido (
                id SERIAL PRIMARY KEY,
                pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
                produto_id INTEGER REFERENCES produtos(id),
                nome_produto VARCHAR(255) NOT NULL,
                quantidade INTEGER NOT NULL,
                preco_unitario DECIMAL(10,2) NOT NULL,
                preco_original DECIMAL(10,2) NOT NULL,
                desconto_aplicado DECIMAL(10,2) DEFAULT 0,
                subtotal DECIMAL(10,2) NOT NULL,
                promocao_aplicada VARCHAR(255),
                observacoes TEXT
            )`,

            `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`,
            `CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf)`,
            `CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id)`,
            `CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)`,
            `CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(criado_em)`,
            `CREATE INDEX IF NOT EXISTS idx_promocoes_dia ON promocoes(dia_semana, ativa)`
        ];

        for (const query of queries) {
            await this.query(query);
        }

        console.log('✅ Tabelas criadas/verificadas com sucesso!');
    }
}

// ==========================================
// USUARIO REPOSITORY
// ==========================================

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

    private mapRowToUsuario(row: Record<string, any>): Usuario {
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