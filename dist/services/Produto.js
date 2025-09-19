"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtoService = void 0;
const DataServices_js_1 = require("./DataServices.js");
class ProdutoService {
    listarProdutos() {
        return DataServices_js_1.dataService.getProdutos();
    }
    listarProdutosDisponiveis() {
        return this.listarProdutos().filter(p => p.disponivel);
    }
    buscarPorId(id) {
        return DataServices_js_1.dataService.findProdutoById(id);
    }
    criarProduto(nome, descricao, preco, categoria) {
        if (!nome || !descricao || preco <= 0) {
            return { sucesso: false, mensagem: "Dados inválidos. Verifique nome, descrição e preço." };
        }
        if (!["pizza", "bebida", "sobremesa"].includes(categoria)) {
            return { sucesso: false, mensagem: "Categoria inválida." };
        }
        const novoProduto = {
            id: DataServices_js_1.dataService.proximoIdProduto(),
            nome,
            descricao,
            preco,
            categoria,
            disponivel: true
        };
        const produtos = DataServices_js_1.dataService.getProdutos();
        produtos.push(novoProduto);
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: `Produto "${nome}" criado com sucesso!`, produto: novoProduto };
    }
    atualizarProduto(id, updates) {
        const produtos = DataServices_js_1.dataService.getProdutos();
        const index = produtos.findIndex(p => p.id === id);
        if (index === -1) {
            return { sucesso: false, mensagem: "Produto não encontrado." };
        }
        // Não permite alterar ID
        delete updates.id;
        // Valida categoria se presente
        if (updates.categoria && !["pizza", "bebida", "sobremesa"].includes(updates.categoria)) {
            return { sucesso: false, mensagem: "Categoria inválida." };
        }
        // Valida preço se presente
        if (updates.preco !== undefined && updates.preco <= 0) {
            return { sucesso: false, mensagem: "Preço deve ser maior que zero." };
        }
        produtos[index] = { ...produtos[index], ...updates };
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: "Produto atualizado com sucesso!", produto: produtos[index] };
    }
    removerProduto(id) {
        const produtos = DataServices_js_1.dataService.getProdutos();
        const index = produtos.findIndex(p => p.id === id);
        if (index === -1) {
            return { sucesso: false, mensagem: "Produto não encontrado." };
        }
        const nome = produtos[index].nome;
        produtos.splice(index, 1);
        DataServices_js_1.dataService.setProdutos(produtos);
        return { sucesso: true, mensagem: `Produto "${nome}" removido com sucesso!` };
    }
}
exports.produtoService = new ProdutoService();
