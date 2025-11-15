import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types';

class Database {
    private pool: Pool;
    private static instance: Database | null = null;

    private constructor(config: DatabaseConfig) {
        this.pool = new Pool(config as any);
    }

    static getInstance(config: DatabaseConfig): Database {
        if (!Database.instance) Database.instance = new Database(config);
        return Database.instance;
    }

    async query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }

    async getClient(): Promise<PoolClient> {
        return this.pool.connect();
    }

    async close() {
        await this.pool.end();
        Database.instance = null;
    }

    async verificarConexao(): Promise<boolean> {
        try {
            await this.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar no banco:', error);
            return false;
        }
    }

    async inicializarTabelas(): Promise<void> {
        console.log('📋 Verificando tabelas no banco de dados...\n');
        const tabelas = ['usuarios','enderecos','produtos','pedidos','itens_pedido','promocoes'];

        const faltando: string[] = [];
        for (const t of tabelas) {
            const r = await this.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = $1
                )
            `, [t]);
            if (!r.rows[0].exists) {
                faltando.push(t);
                console.log(`   ❌ ${t} - NÃO ENCONTRADA`);
            } else {
                console.log(`   ✅ ${t}`);
            }
        }

        if (faltando.length > 0) {
            throw new Error(`Tabelas não encontradas: ${faltando.join(', ')}`);
        }

        console.log('✅ Todas as tabelas foram encontradas!');
    }
}

export default Database;
