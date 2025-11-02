"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_1 = require("pg");
class Database {
    constructor(config) {
        this.pool = new pg_1.Pool(config);
    }
    static getInstance(config) {
        if (!Database.instance) {
            Database.instance = new Database(config);
        }
        return Database.instance;
    }
    async query(text, params) {
        return this.pool.query(text, params);
    }
    async getClient() {
        return this.pool.connect();
    }
    async close() {
        await this.pool.end();
    }
    async inicializarTabelas() {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            // Criar tabela de usuários
            await client.query(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id_cliente SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    senha VARCHAR(100) NOT NULL,
                    cpf VARCHAR(11) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    tipo VARCHAR(20) NOT NULL,
                    data_nascimento DATE,
                    telefone VARCHAR(20),
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Criar tabela de endereços
            await client.query(`
                CREATE TABLE IF NOT EXISTS enderecos (
                    id_endereco SERIAL PRIMARY KEY,
                    usuario_id INTEGER REFERENCES usuarios(id_cliente),
                    logradouro VARCHAR(100) NOT NULL,
                    numero VARCHAR(10) NOT NULL,
                    bairro VARCHAR(50) NOT NULL,
                    complemento VARCHAR(100),
                    cidade VARCHAR(50) NOT NULL,
                    estado VARCHAR(2) NOT NULL,
                    cep VARCHAR(8) NOT NULL,
                    principal BOOLEAN DEFAULT false,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Criar tabela de produtos
            await client.query(`
                CREATE TABLE IF NOT EXISTS produtos (
                    id_produto SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    descricao TEXT,
                    preco DECIMAL(10,2) NOT NULL,
                    categoria VARCHAR(50) NOT NULL,
                    tamanho VARCHAR(20),
                    disponivel BOOLEAN DEFAULT true,
                    imagem_url VARCHAR(255),
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Criar tabela de pedidos
            await client.query(`
                CREATE TABLE IF NOT EXISTS pedidos (
                    id_pedido SERIAL PRIMARY KEY,
                    usuario_id INTEGER REFERENCES usuarios(id_cliente),
                    endereco_id INTEGER REFERENCES enderecos(id_endereco),
                    status VARCHAR(20) NOT NULL,
                    valor_total DECIMAL(10,2) NOT NULL,
                    observacoes TEXT,
                    forma_pagamento VARCHAR(50),
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Criar tabela de itens do pedido
            await client.query(`
                CREATE TABLE IF NOT EXISTS itens_pedido (
                    id_item SERIAL PRIMARY KEY,
                    pedido_id INTEGER REFERENCES pedidos(id_pedido),
                    produto_id INTEGER REFERENCES produtos(id_produto),
                    quantidade INTEGER NOT NULL,
                    preco_unitario DECIMAL(10,2) NOT NULL,
                    observacoes TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Criar tabela de promoções
            await client.query(`
                CREATE TABLE IF NOT EXISTS promocoes (
                    id_promocao SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    descricao TEXT,
                    produto_id INTEGER REFERENCES produtos(id_produto),
                    preco_promocional DECIMAL(10,2) NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    ativa BOOLEAN DEFAULT true,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.Database = Database;
