// Importa módulos do Node.js
import * as fs from "fs";  // Módulo para manipulação de arquivos
import * as path from "path";  // Módulo para manipulação de caminhos de diretórios/arquivos

// Importa os modelos de dados usados no sistema
import { Pedido, ItemPedido, Usuario } from "../models/index.js";

// Importa o serviço de dados centralizado
import { dataService } from "./DataServices.js";

// Funções utilitárias para manipulação de diretórios e sanitização de nomes
import { ensureDir, sanitizeFileName } from "../utils/fileUtils.js";

// Classe responsável por toda a lógica de pedidos
class PedidoService {

    // Lista todos os pedidos cadastrados
    listarPedidos(): Pedido[] {
        return dataService.getPedidos();
    }

    // Lista apenas os pedidos de um cliente específico, filtrando pelo e-mail
    listarPedidosDoCliente(email: string): Pedido[] {
        return this.listarPedidos().filter(p => p.clienteEmail === email);
    }

    // Lista pedidos que ainda não foram finalizados (pendentes, preparando, prontos)
    listarPedidosAtivos(): Pedido[] {
        return this.listarPedidos().filter(p => !["entregue", "cancelado"].includes(p.status));
    }

    // Busca um pedido pelo seu ID único
    buscarPorId(id: number): Pedido | undefined {
        return dataService.findPedidoById(id);
    }

    // Cria e registra um novo pedido no sistema
    criarPedido(
        clienteEmail: string,
        clienteNome: string,
        clienteTelefone: string,
        itens: ItemPedido[],
        total: number,
        tipoEntrega: "entrega" | "retirada",
        enderecoEntrega?: { rua: string; numero: string; bairro: string }, // só necessário para entrega
        formaPagamento?: "dinheiro" | "pix" | "debito" | "credito",
        observacoes?: string
    ): { sucesso: boolean; mensagem: string; pedido?: Pedido } {

        // Validação: o pedido precisa ter pelo menos 1 item
        if (itens.length === 0) {
            return { sucesso: false, mensagem: "Pedido deve conter pelo menos um item." };
        }

        // Criação do objeto pedido
        const novoPedido: Pedido = {
            id: dataService.proximoIdPedido(), // gera ID único
            clienteEmail,
            clienteNome,
            clienteTelefone,
            tipoEntrega,
            enderecoEntrega,
            itens,
            total,
            status: "pendente", // todo pedido começa como "pendente"
            dataHora: new Date().toISOString(), // salva a data/hora de criação
            formaPagamento: formaPagamento || "dinheiro", // padrão: dinheiro
            observacoes
        };

        // Salva o pedido na lista de pedidos existente
        const pedidos = dataService.getPedidos();
        pedidos.push(novoPedido);
        dataService.setPedidos(pedidos);

        // Retorna sucesso
        return { sucesso: true, mensagem: `Pedido #${novoPedido.id} criado com sucesso!`, pedido: novoPedido };
    }

    // Atualiza o status de um pedido (pendente → preparando → pronto → entregue ou cancelado)
    atualizarStatusPedido(
        id: number,
        novoStatus: "pendente" | "preparando" | "pronto" | "entregue" | "cancelado"
    ): { sucesso: boolean; mensagem: string; pedido?: Pedido } {

        const pedidos = dataService.getPedidos();
        const index = pedidos.findIndex(p => p.id === id); // busca pelo índice

        if (index === -1) {
            return { sucesso: false, mensagem: "Pedido não encontrado." };
        }

        // Atualiza o status e adiciona a data/hora da mudança
        pedidos[index] = {
            ...pedidos[index],
            status: novoStatus,
            dataHoraStatus: new Date().toISOString()
        };

        dataService.setPedidos(pedidos);
        return { sucesso: true, mensagem: `Status do pedido #${id} atualizado para "${novoStatus}".`, pedido: pedidos[index] };
    }

    // Gera o conteúdo textual da nota fiscal (formato TXT)
    gerarConteudoNotaFiscal(pedido: Pedido): string {
        let conteudo = "=== NOTA FISCAL / COMPROVANTE ===\n";
        conteudo += `Pedido #: ${pedido.id}\n`;
        conteudo += `Cliente: ${pedido.clienteNome}\n`;
        conteudo += `Email: ${pedido.clienteEmail}\n`;
        conteudo += `Telefone: ${pedido.clienteTelefone}\n`;
        conteudo += `Data/Hora: ${new Date(pedido.dataHora).toLocaleString("pt-BR")}\n`;
        conteudo += `Forma de pagamento: ${(pedido.formaPagamento ?? "DINHEIRO").toUpperCase()}\n\n`;
        conteudo += `Tipo: ${pedido.tipoEntrega.toUpperCase()}\n`;

        // Se for entrega, mostra endereço
        if (pedido.tipoEntrega === "entrega" && pedido.enderecoEntrega) {
            conteudo += `Endereço de entrega: ${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero} - ${pedido.enderecoEntrega.bairro}\n`;
        }

        // Lista os itens comprados
        conteudo += "\nItens:\n";
        pedido.itens.forEach(item => {
            conteudo += `   ${item.quantidade}x ${item.nomeProduto} - R$ ${item.subtotal.toFixed(2)}\n`;
        });

        // Mostra total e observações
        conteudo += `\n💰 Total: R$ ${pedido.total.toFixed(2)}\n`;
        if (pedido.observacoes) conteudo += `📝 Observações: ${pedido.observacoes}\n`;
        conteudo += "─".repeat(50) + "\n";
        conteudo += "Obrigado pela preferência!\n";

        return conteudo;
    }

    // Salva a nota fiscal em arquivo TXT dentro da pasta "data/notas-fiscais"
    emitirNotaFiscalTXT(pedido: Pedido): string | null {
        const notasDir = path.join(process.cwd(), "data", "notas-fiscais");
        ensureDir(notasDir); // garante que a pasta existe

        const fileName = `nota_pedido_${pedido.id}.txt`;
        const filePath = path.join(notasDir, fileName);
        const conteudo = this.gerarConteudoNotaFiscal(pedido);

        try {
            fs.writeFileSync(filePath, conteudo, "utf-8");
            return filePath; // retorna caminho da nota
        } catch (error) {
            console.error("[ERRO] Falha ao salvar nota fiscal:", error);
            return null;
        }
    }

    // Gera relatório de vendas de um mês/ano específico
    gerarRelatorioVendas(mes?: number, ano?: number): { sucesso: boolean; mensagem: string; caminho?: string } {
        const now = new Date();
        const mesAlvo = mes ?? now.getMonth() + 1; // se não informado, usa o mês atual
        const anoAlvo = ano ?? now.getFullYear();  // se não informado, usa o ano atual

        // Filtra apenas pedidos do período desejado
        const pedidos = this.listarPedidos().filter(p => {
            const data = new Date(p.dataHora);
            return data.getMonth() + 1 === mesAlvo && data.getFullYear() === anoAlvo;
        });

        if (pedidos.length === 0) {
            return { sucesso: false, mensagem: `Nenhum pedido encontrado para ${mesAlvo}/${anoAlvo}.` };
        }

        // Agrupa vendas por dia
        const vendasPorDia: { [key: string]: { qtd: number; valor: number } } = {};
        pedidos.forEach(p => {
            const dia = new Date(p.dataHora).toLocaleDateString("pt-BR");
            const qtd = p.itens.reduce((sum, item) => sum + item.quantidade, 0);
            const valor = p.total;

            if (!vendasPorDia[dia]) vendasPorDia[dia] = { qtd: 0, valor: 0 };
            vendasPorDia[dia].qtd += qtd;
            vendasPorDia[dia].valor += valor;
        });

        // Nome do mês em português (para pasta de relatório)
        const nomeMes = new Date(anoAlvo, mesAlvo - 1).toLocaleString("pt-BR", { month: "long" });
        const nomePasta = `Relatorio_${sanitizeFileName(nomeMes)}_${anoAlvo}`;

        // Garante que o diretório existe
        const relatorioDir = path.join(process.cwd(), "data", nomePasta);
        ensureDir(relatorioDir);

        // Caminho do arquivo final
        const relatorioPath = path.join(relatorioDir, "relatorio_vendas.txt");

        // Monta o conteúdo do relatório
        let conteudo = `=== RELATÓRIO DE VENDAS - ${nomeMes} ${anoAlvo} ===\n\n`;
        conteudo += "📅 Vendas por dia:\n";
        for (const dia in vendasPorDia) {
            conteudo += `   ${dia}: ${vendasPorDia[dia].qtd} produtos | R$ ${vendasPorDia[dia].valor.toFixed(2)}\n`;
        }

        // Calcula totais gerais
        const totalGeralQtd = Object.values(vendasPorDia).reduce((s, v) => s + v.qtd, 0);
        const totalGeralValor = Object.values(vendasPorDia).reduce((s, v) => s + v.valor, 0);

        conteudo += `\n🔢 Total do período: ${totalGeralQtd} produtos | R$ ${totalGeralValor.toFixed(2)}\n`;

        // Salva no arquivo
        try {
            fs.writeFileSync(relatorioPath, conteudo, "utf-8");
            return { sucesso: true, mensagem: "Relatório gerado com sucesso!", caminho: relatorioPath };
        } catch (error) {
            console.error("[ERRO] Falha ao gerar relatório:", error);
            return { sucesso: false, mensagem: "Erro ao salvar relatório." };
        }
    }
}

// Exporta instância do serviço (singleton)
export const pedidoService = new PedidoService();
