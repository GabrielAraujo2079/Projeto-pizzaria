import { Interface } from './interface';
import { getDatabaseConfigFromEnv } from './config/database';

async function main() {
    const config = getDatabaseConfigFromEnv();
    const ui = new Interface(config);
    await ui.iniciar();
}

main();
