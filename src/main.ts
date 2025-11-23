// Importa a classe "MenuController" do arquivo localizado em "./controllers/MenuControllers.js".
// Esse "MenuController" provavelmente gerencia as opções de menu da sua aplicação (entrada do usuário, navegação, etc.).
import { MenuController } from "./controllers/MenuControllers.js";

// Define a função principal da aplicação, marcada como "async".
// O uso de "async" permite que você utilize "await" dentro dela para lidar com código assíncrono (promises).
async function main() {
    // Cria uma nova instância do controlador de menu.
    // Aqui o objeto "menu" passa a ter acesso a todos os métodos e atributos da classe "MenuController".
    const menu = new MenuController();

    // Chama o método "iniciar" do controlador de menu e aguarda sua conclusão.
    // O "await" significa que o código vai pausar até "iniciar()" terminar (sem travar o programa por completo).
    await menu.iniciar();
}

// Chama a função principal.
// ".catch()" captura qualquer erro não tratado que aconteça dentro de "main" ou em funções que ela chama.
// Se ocorrer um erro fatal, o erro é exibido no console e o processo é finalizado com código de saída 1.
main().catch(err => {
    console.error("Erro fatal:", err);
    process.exit(1); // "1" indica erro; "0" indicaria execução bem-sucedida.
});
