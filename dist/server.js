"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = require("dotenv");
// Carregar variáveis de ambiente
(0, dotenv_1.config)();
// Configuração do banco de dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'pizzaria',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};
// Criar e inicializar a aplicação
const app = new app_1.PizzariaApp(dbConfig);
async function iniciarServidor() {
    try {
        await app.inicializar();
        console.log('🚀 Servidor iniciado com sucesso!');
    }
    catch (error) {
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
