// ...importação removida, configuração fixa abaixo...
import Database from './database/Database';
import { PizzariaApp } from './app';

async function main() {
    const config = {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '2079',
        database: 'Pizzaria'
    };
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
