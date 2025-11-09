import { PizzariaApp } from './app';
import getDatabaseConfigFromEnv from './config/database';

const dbConfig = getDatabaseConfigFromEnv();
const app = new PizzariaApp(dbConfig);

async function iniciarServidor() {
    try {
        await app.inicializar();
        console.log('🚀 Servidor iniciado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar o servidor
iniciarServidor();

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n👋 Encerrando servidor...');
    await app.fechar();
    process.exit(0);
});