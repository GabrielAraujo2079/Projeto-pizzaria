import { Produto } from "../models/index.js";
import { dataService } from "./DataServices.js";

// Classe que encapsula todas as operações de produto
class ProdutoService {
    // Retorna todos os produtos cadastrados
    listarProdutos(): Produto[] {
        return dataService.getProdutos();
    }

    // Lista apenas produtos disponíveis (disponivel = true)
    listarProdutosDisponiveis(): Produto[] {
        return this.listarProdutos().filter(p => p.disponivel);
    }

    // Busca um produto pelo seu ID
    buscarPorId(id: number): Produto | undefined {
        return dataService.findProdutoById(id);
    }

    // Cria um novo produto com validações
    criarProduto(
        nome: string,
        descricao: string,
        preco: number,
        categoria: "pizza" | "bebida" | "sobremesa"
    ): { sucesso: boolean; mensagem: string; produto?: Produto } {

        // Valida campos obrigatórios
        if (!nome || !descricao || preco <= 0) {
            return { sucesso: false, mensagem: "Dados inválidos. Verifique nome, descrição e preço." };
        }

        // Valida categoria permitida
        if (!["pizza", "bebida", "sobremesa"].includes(categoria)) {
            return { sucesso: false, mensagem: "Categoria inválida." };
        }

        // Monta novo objeto de produto
        const novoProduto: Produto = {
            id: dataService.proximoIdProduto(), // gera ID único incremental
            nome,
            descricao,
            preco,
            categoria,
            disponivel: true // por padrão, todo novo produto está disponível
        };

        // Persiste no repositório
        const produtos = dataService.getProdutos();
        produtos.push(novoProduto);
        dataService.setProdutos(produtos);

        return { sucesso: true, mensagem: `Produto "${nome}" criado com sucesso!`, produto: novoProduto };
    }

    // Atualiza os dados de um produto existente
    atualizarProduto(
        id: number,
        updates: Partial<Produto> // aceita atualização parcial
    ): { sucesso: boolean; mensagem: string; produto?: Produto } {

        const produtos = dataService.getProdutos();
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
        dataService.setProdutos(produtos);

        return { sucesso: true, mensagem: "Produto atualizado com sucesso!", produto: produtos[index] };
    }

    // Remove produto pelo ID
    removerProduto(id: number): { sucesso: boolean; mensagem: string } {
        const produtos = dataService.getProdutos();
        const index = produtos.findIndex(p => p.id === id);

        if (index === -1) {
            return { sucesso: false, mensagem: "Produto não encontrado." };
        }

        const nome = produtos[index].nome;
        produtos.splice(index, 1); // remove do array
        dataService.setProdutos(produtos);

        return { sucesso: true, mensagem: `Produto "${nome}" removido com sucesso!` };
    }
}

// Exporta instância única (Singleton)
export const produtoService = new ProdutoService();
