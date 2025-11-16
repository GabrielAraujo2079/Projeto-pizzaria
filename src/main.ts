import getDatabaseConfigFromEnv from './config/database';
import Database from './database/Database';
import { PizzariaApp } from './app';

async function main() {
    const config = getDatabaseConfigFromEnv();
    const app = new PizzariaApp(config);

    try {
        await app.inicializar();
        console.log('✅ Sistema Pizzaria iniciado com sucesso!');
    } catch (err) {
        console.error('❌ Falha ao iniciar sistema:', err);
        process.exit(1);
    }
}

main();
