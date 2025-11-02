"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // carrega variáveis do .env
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'pizzaria'
};
// Iniciar interface
const menuInterface = new interface_1.Interface(config);
menuInterface.iniciar().catch(console.error);
