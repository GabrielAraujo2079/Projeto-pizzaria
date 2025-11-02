"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // carrega variáveis do .env
function getDatabaseConfigFromEnv() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const database = process.env.DB_NAME || 'pizzaria';
    return {
        host,
        port,
        user,
        password,
        database
    };
}
async function main() {
    // Ler configuração do banco de dados do .env
    const config = getDatabaseConfigFromEnv();
    // Criar instância da aplicação
    const app = new app_1.PizzariaApp(config);
    try {
        // Inicializar a aplicação
        await app.inicializar();
        console.log('✨ Aplicação iniciada com sucesso!');
        // Manter a aplicação rodando
        process.on('SIGINT', async () => {
            console.log('\n🛑 Encerrando aplicação...');
            await app.fechar();
            process.exit(0);
        });
        // Evitar que o processo termine
        setInterval(() => { }, 1000);
    }
    catch (error) {
        console.error('❌ Erro fatal:', error);
        await app.fechar();
        process.exit(1);
    }
}
// Executar a aplicação
main().catch(error => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
});
