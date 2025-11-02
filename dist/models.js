"use strict";
// MODELS - Classes de Domínio
// ==========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promocao = exports.Pedido = exports.ItemPedido = exports.Produto = exports.Endereco = exports.Usuario = void 0;
class Usuario {
    constructor(id, nome = '', email = '', senha = '', cpf = '', telefone = '', tipo = 'cliente', dataNascimento = new Date(), endereco, criadoEm = new Date(), atualizadoEm = new Date()) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.tipo = tipo;
        this.dataNascimento = dataNascimento;
        this.endereco = endereco;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }
    validar() {
        const erros = [];
        if (!this.nome || this.nome.length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        }
        const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
            erros.push('Email inválido');
        }
        const cpfRegex = /^\d{11}$/;
        if (!cpfRegex.test(this.cpf)) {
            erros.push('CPF deve ter 11 dígitos');
        }
        const telRegex = /^\d{10,11}$/;
        if (!telRegex.test(this.telefone)) {
            erros.push('Telefone deve ter 10 ou 11 dígitos');
        }
        return erros;
    }
    isAdmin() {
        return this.tipo === 'admin';
    }
}
exports.Usuario = Usuario;
class Endereco {
    constructor(id, rua = '', numero = '', bairro = '', complemento, cidade = 'Campinas', estado = 'SP', cep) {
        this.id = id;
        this.rua = rua;
        this.numero = numero;
        this.bairro = bairro;
        this.complemento = complemento;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
    }
}
exports.Endereco = Endereco;
class Produto {
    constructor(id, nome = '', descricao = '', preco = 0, categoria = 'pizza', disponivel = true, imagemUrl, criadoEm = new Date(), atualizadoEm = new Date()) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.categoria = categoria;
        this.disponivel = disponivel;
        this.imagemUrl = imagemUrl;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }
    calcularPrecoComDesconto(desconto) {
        return this.preco - desconto;
    }
    validar() {
        const erros = [];
        if (!this.nome || this.nome.length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        }
        if (this.preco <= 0) {
            erros.push('Preço deve ser maior que zero');
        }
        return erros;
    }
}
exports.Produto = Produto;
class ItemPedido {
    constructor(id, pedidoId, produtoId = 0, nomeProduto = '', quantidade = 1, precoUnitario = 0, precoOriginal = 0, descontoAplicado = 0, subtotal = 0, promocaoAplicada, observacoes) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.nomeProduto = nomeProduto;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.precoOriginal = precoOriginal;
        this.descontoAplicado = descontoAplicado;
        this.subtotal = subtotal;
        this.promocaoAplicada = promocaoAplicada;
        this.observacoes = observacoes;
    }
    calcularSubtotal() {
        this.precoOriginal = this.precoUnitario * this.quantidade;
        this.subtotal = this.precoOriginal - this.descontoAplicado;
    }
}
exports.ItemPedido = ItemPedido;
class Pedido {
    constructor(id, clienteId, clienteNome = '', clienteEmail = '', clienteTelefone = '', tipoEntrega = 'retirada', enderecoEntrega, itens = [], subtotalOriginal = 0, totalDescontos = 0, total = 0, status = 'pendente', formaPagamento = 'dinheiro', observacoes, promocoesAplicadas = [], criadoEm = new Date(), atualizadoEm = new Date()) {
        this.id = id;
        this.clienteId = clienteId;
        this.clienteNome = clienteNome;
        this.clienteEmail = clienteEmail;
        this.clienteTelefone = clienteTelefone;
        this.tipoEntrega = tipoEntrega;
        this.enderecoEntrega = enderecoEntrega;
        this.itens = itens;
        this.subtotalOriginal = subtotalOriginal;
        this.totalDescontos = totalDescontos;
        this.total = total;
        this.status = status;
        this.formaPagamento = formaPagamento;
        this.observacoes = observacoes;
        this.promocoesAplicadas = promocoesAplicadas;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }
    adicionarItem(item) {
        item.calcularSubtotal();
        this.itens.push(item);
        this.recalcularTotal();
    }
    removerItem(itemId) {
        this.itens = this.itens.filter(item => item.id !== itemId);
        this.recalcularTotal();
    }
    recalcularTotal() {
        this.subtotalOriginal = this.itens.reduce((sum, item) => sum + item.precoOriginal, 0);
        this.totalDescontos = this.itens.reduce((sum, item) => sum + item.descontoAplicado, 0);
        this.total = this.subtotalOriginal - this.totalDescontos;
    }
    podeSerCancelado() {
        return this.status === 'pendente' || this.status === 'preparando';
    }
    cancelar() {
        if (!this.podeSerCancelado()) {
            throw new Error('Pedido não pode ser cancelado neste status');
        }
        this.status = 'cancelado';
        this.atualizadoEm = new Date();
    }
    atualizarStatus(novoStatus) {
        this.status = novoStatus;
        this.atualizadoEm = new Date();
    }
}
exports.Pedido = Pedido;
class Promocao {
    constructor(id, nome = '', descricao = '', tipoDesconto = 'percentual', valorDesconto = 0, diaSemana = 0, categoriaAplicavel = 'todos', produtoEspecifico, valorMinimoPedido, ativa = true, dataInicio = new Date(), dataFim) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.tipoDesconto = tipoDesconto;
        this.valorDesconto = valorDesconto;
        this.diaSemana = diaSemana;
        this.categoriaAplicavel = categoriaAplicavel;
        this.produtoEspecifico = produtoEspecifico;
        this.valorMinimoPedido = valorMinimoPedido;
        this.ativa = ativa;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
    estaAtiva() {
        if (!this.ativa)
            return false;
        const agora = new Date();
        if (agora < this.dataInicio)
            return false;
        if (this.dataFim && agora > this.dataFim)
            return false;
        return true;
    }
    seAplicaHoje() {
        const hoje = new Date().getDay();
        return this.estaAtiva() && this.diaSemana === hoje;
    }
    calcularDesconto(produto, quantidade) {
        if (!this.seAplicaAoProduto(produto))
            return 0;
        const subtotal = produto.preco * quantidade;
        if (this.tipoDesconto === 'percentual') {
            return subtotal * (this.valorDesconto / 100);
        }
        else {
            return Math.min(this.valorDesconto * quantidade, subtotal);
        }
    }
    seAplicaAoProduto(produto) {
        if (this.produtoEspecifico && this.produtoEspecifico !== produto.id) {
            return false;
        }
        if (this.categoriaAplicavel !== 'todos' && this.categoriaAplicavel !== produto.categoria) {
            return false;
        }
        return true;
    }
    seAplicaAoPedido(pedido) {
        if (!this.estaAtiva())
            return false;
        if (this.valorMinimoPedido && pedido.subtotalOriginal < this.valorMinimoPedido) {
            return false;
        }
        return true;
    }
}
exports.Promocao = Promocao;
