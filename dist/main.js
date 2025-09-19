"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MenuControllers_js_1 = require("./controllers/MenuControllers.js");
async function main() {
    const menu = new MenuControllers_js_1.MenuController();
    await menu.iniciar();
}
main().catch(err => {
    console.error("Erro fatal:", err);
    process.exit(1);
});
