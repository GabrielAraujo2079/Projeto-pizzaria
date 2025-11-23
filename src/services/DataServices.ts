// Importa o módulo "path" do Node.js, usado para manipular caminhos de arquivos e pastas
import * as path from "path";

// Importa funções utilitárias para manipulação de arquivos JSON e diretórios
import { loadJSON, saveJSON, ensureDir } from "../utils/fileUtils.js";

// Importa os modelos de dados (tipos/interfaces) do sistema
import { Usuario, Produto, Pedido } from "../models/index.js";

// Define o diretório principal de armazenamento dos arquivos de dados
const dataDir = path.join(process.cwd(), "data"); 
// process.cwd() retorna o diretório onde a aplicação está sendo executada
ensureDir(dataDir); // Garante que a pasta "data" exista (se não existir, cria)

// Define os caminhos completos dos arquivos JSON que armazenam os dados
const paths = {
    usuarios: path.join(dataDir, "usuarios.json"),
    produtos: path.join(dataDir, "produtos.json"),
    pedidos: path.join(dataDir, "pedidos.json"),
};

// Classe responsável por gerenciar os dados da aplicação (persistência em JSON)
class DataService {
    // Listas internas que representam os dados carregados da base
    private usuarios: Usuario[] = [];
    private produtos: Produto[] = [];
    private pedidos: Pedido[] = [];

    // Construtor é chamado ao criar a instância
    constructor() {
        // Carrega os dados de cada arquivo JSON
        // Se o arquivo não existir, retorna um array vazio (fallback padrão)
        this.usuarios = loadJSON(paths.usuarios, []);
        this.produtos = loadJSON(paths.produtos, []);
        this.pedidos = loadJSON(paths.pedidos, []);
    }

    // --- GETTERS ---
    // Métodos que retornam cópias dos dados (não a referência direta, para evitar alterações externas indesejadas)
    getUsuarios(): Usuario[] { return [...this.usuarios]; }
    getProdutos(): Produto[] { return [...this.produtos]; }
    getPedidos(): Pedido[] { return [...this.pedidos]; }

    // --- SETTERS ---
    // Atualizam os dados em memória e salvam automaticamente no respectivo arquivo JSON
    setUsuarios(usuarios: Usuario[]): void {
        this.usuarios = usuarios;
        saveJSON(paths.usuarios, usuarios); // Persiste no arquivo
    }

    setProdutos(produtos: Produto[]): void {
        this.produtos = produtos;
        saveJSON(paths.produtos, produtos);
    }

    setPedidos(pedidos: Pedido[]): void {
        this.pedidos = pedidos;
        saveJSON(paths.pedidos, pedidos);
    }

    // --- Geradores de ID ---
    // Cria IDs automáticos para produtos (incrementando o maior ID atual)
    proximoIdProduto(): number {
        return this.produtos.length > 0 
            ? Math.max(...this.produtos.map(p => p.id)) + 1 
            : 1;
    }

    // Cria IDs automáticos para pedidos
    proximoIdPedido(): number {
        return this.pedidos.length > 0 
            ? Math.max(...this.pedidos.map(p => p.id)) + 1 
            : 1;
    }

    // --- Métodos auxiliares de busca ---
    // Localiza um usuário pelo e-mail (ignora maiúsculas/minúsculas)
    findUsuarioByEmail(email: string): Usuario | undefined {
        return this.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // Localiza um produto pelo seu ID
    findProdutoById(id: number): Produto | undefined {
        return this.produtos.find(p => p.id === id);
    }

    // Localiza um pedido pelo seu ID
    findPedidoById(id: number): Pedido | undefined {
        return this.pedidos.find(p => p.id === id);
    }
}

// Exporta uma instância única (singleton) do serviço de dados
// Assim, toda a aplicação compartilha a mesma fonte de dados centralizada
export const dataService = new DataService();
