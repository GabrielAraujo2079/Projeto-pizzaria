// Reexporta todos os tipos para importação fácil em outros arquivos
// (ex: import { Usuario, Produto } from './tipos'; )

// Representa um usuário do sistema (tanto cliente quanto administrador)
export interface Usuario {
    nome: string;               // Nome completo do usuário
    senha: string;              // Senha (presumivelmente hash ou texto - deve ser tratada com segurança)
    cpf: string;                // CPF do usuário (formato: 000.000.000-00)
    email: string;              // Email de contato/login do usuário
    telefone: string;           // Telefone do usuário
    endereco: {                 // Endereço residencial do usuário
        rua: string;            // Nome da rua
        numero: string;         // Número da residência (string para permitir letras, ex: "123A")
        bairro: string;         // Bairro onde o usuário reside
    };
    tipo: "admin" | "cliente";  // Define o tipo do usuário: administrador ou cliente
    dataNascmto: string;        // Data de nascimento (formato: "AAAA-MM-DD")
}

// Representa um produto do cardápio
export interface Produto {
    id: number;                             // Identificador único do produto
    nome: string;                           // Nome do produto (ex: "Pizza de Calabresa")
    descricao: string;                      // Descrição detalhada do produto
    preco: number;                          // Preço unitário em reais (ex: 29.90)
    categoria: "pizza" | "bebida" | "sobremesa";  // Categoria do produto
    disponivel: boolean;                    // Define se o produto está disponível para venda
}

// Representa um item individual dentro de um pedido
export interface ItemPedido {
    produtoId: number;          // ID do produto (relaciona com a interface Produto)
    nomeProduto: string;        // Nome do produto (redundância útil para histórico do pedido)
    quantidade: number;         // Quantidade solicitada deste produto
    precoUnitario: number;      // Preço do produto no momento da compra (pode mudar futuramente)
    subtotal: number;           // Total para este item: precoUnitario * quantidade
}

// Representa um pedido feito por um cliente
export interface Pedido {
    id: number;                             // ID único do pedido
    clienteEmail: string;                  // Email do cliente que fez o pedido
    clienteNome: string;                   // Nome do cliente
    clienteTelefone: string;               // Telefone para contato
    tipoEntrega: "entrega" | "retirada";   // Define se o pedido será entregue ou retirado no local
    enderecoEntrega?: {                    // Endereço de entrega (necessário se tipoEntrega for "entrega")
        rua: string;
        numero: string;
        bairro: string;
    };
    itens: ItemPedido[];                   // Lista de itens incluídos no pedido
    total: number;                         // Valor total do pedido (soma dos subtotais dos itens)
    status: "pendente" | "preparando" | "pronto" | "entregue" | "cancelado"; 
                                          // Status atual do pedido
    dataHora: string;                      // Data e hora em que o pedido foi feito (formato: ISO ou customizado)
    dataHoraStatus?: string;               // Data e hora da última mudança de status
    formaPagamento?: "dinheiro" | "pix" | "debito" | "credito"; 
                                          // Forma de pagamento escolhida pelo cliente
    observacoes?: string;                  // Observações adicionais deixadas pelo cliente (ex: "sem cebola")
}
