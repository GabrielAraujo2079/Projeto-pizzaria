"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtoService = void 0;
const DataServices_js_1 = require("./DataServices.js");
// Classe que encapsula todas as operações de produto
class ProdutoService {
    // Retorna todos os produtos cadastrados
    listarProdutos() {
        return DataServices_js_1.dataService.getProdutos();
    }
    // Lista apenas produtos disponíveis (disponivel = true)
    listarProdutosDisponiveis() {
        return this.listarProdutos().filter(p => p.disponivel);
    }
    // Busca um produto pelo seu ID
    buscarPorId(id) {
        return DataServices_js_1.dataService.findProdutoById(id);
    }
    // Cria um novo produto com validações
    criarProduto(nome, descricao, preco, categoria) {
        // Valida campos obrigatórios
        if (!nome || !descricao || preco <= 0) {
            return { sucesso: false, mensagem: "Dados inválidos. Verifique nome, descrição e preço." };
        }
        // Valida categoria permitida
        if (!["pizza", "bebida", "sobremesa"].includes(categoria)) {
            return { sucesso: false, mensagem: "Categoria inválida." };
        }
        // Monta novo objeto de produto
        const novoProduto = {
            id: DataServices_js_1.dataService.proximoIdProduto(), // gera ID único incremental
            nome,
            descricao,
            preco,
            categoria,
            disponivel: true // por padrão, todo novo produto está disponível
        };
        // Persiste no repositório
        const produtos = DataServices_js_1.dataService.getProdutos();
        produtos.push(novoProduto);
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: `Produto "${nome}" criado com sucesso!`, produto: novoProduto };
    }
    // Atualiza os dados de um produto existente
    atualizarProduto(id, updates // aceita atualização parcial
    ) {
        const produtos = DataServices_js_1.dataService.getProdutos();
        const index = produtos.findIndex(p => p.id === id);
        if (index === -1) {
            return { sucesso: false, mensagem: "Produto não encontrado." };
        }
        // ID nunca pode ser alterado
        delete updates.id;
        // Se categoria for informada, valida antes de atualizar
        if (updates.categoria && !["pizza", "bebida", "sobremesa"].includes(updates.categoria)) {
            return { sucesso: false, mensagem: "Categoria inválida." };
        }
        // Se preço for informado, valida que seja positivo
        if (updates.preco !== undefined && updates.preco <= 0) {
            return { sucesso: false, mensagem: "Preço deve ser maior que zero." };
        }
        // Mescla dados antigos com os novos
        produtos[index] = { ...produtos[index], ...updates };
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: "Produto atualizado com sucesso!", produto: produtos[index] };
    }
    // Remove produto pelo ID
    removerProduto(id) {
        const produtos = DataServices_js_1.dataService.getProdutos();
        const index = produtos.findIndex(p => p.id === id);
        if (index === -1) {
            return { sucesso: false, mensagem: "Produto não encontrado." };
        }
        const nome = produtos[index].nome;
        produtos.splice(index, 1); // remove do array
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: `Produto "${nome}" removido com sucesso!` };
    }
}
// Exporta instância única (Singleton)
exports.produtoService = new ProdutoService();
