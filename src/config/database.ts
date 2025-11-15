import { config as dotenvConfig } from 'dotenv';
import { DatabaseConfig } from '../types';

dotenvConfig();

export function getDatabaseConfigFromEnv(): DatabaseConfig {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER || 'Paulo',
        password: process.env.DB_PASSWORD || 'Piloto26',
        database: process.env.DB_NAME || 'Pizzaria'
    };
}

export default getDatabaseConfigFromEnv;
