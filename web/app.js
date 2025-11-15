// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Estado da aplicação
let currentUser = null;
let produtos = [];
let pedidos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    carregarPromocoesDoDia();
});

// Setup de Event Listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('productForm').addEventListener('submit', handleAddProduct);
    document.getElementById('orderForm').addEventListener('submit', handleCreateOrder);
}

// ============================================
// FUNÇÕES DE API
// ============================================

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erro || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('Erro na API:', error);
        showAlert(error.message || 'Erro ao conectar com o servidor', 'error');
        throw error;
    }
}

// ============================================
// AUTENTICAÇÃO
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        currentUser = response.usuario;
        showDashboard();
        showAlert('Login realizado com sucesso!', 'success');
        await carregarDadosDashboard();
    } catch (error) {
        // Erro já tratado no apiRequest
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const nome = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regPassword').value;
    const confirmSenha = document.getElementById('regConfirmPassword').value;
    
    if (senha !== confirmSenha) {
        showAlert('As senhas não coincidem!', 'error');
        return;
    }
    
    // Dados fictícios para demonstração (em produção, seria um formulário completo)
    const dadosCadastro = {
        nome,
        email,
        senha,
        cpf: '00000000000', // Temporário
        telefone: '0000000000', // Temporário
        endereco: {
            rua: 'Rua Exemplo',
            numero: '123',
            bairro: 'Centro'
        },
        dataNascmto: '01/01/2000'
    };
    
    try {
        await apiRequest('/auth/cadastro', {
            method: 'POST',
            body: JSON.stringify(dadosCadastro)
        });
        
        showAlert('Cadastro realizado com sucesso!', 'success');
        setTimeout(() => showLogin(), 1500);
    } catch (error) {
        // Erro já tratado
    }
}

function logout() {
    currentUser = null;
    produtos = [];
    pedidos = [];
    showLogin();
}

// ============================================
// GERENCIAMENTO DE TELAS
// ============================================

function showLogin() {
    hideAllScreens();
    document.getElementById('loginScreen').classList.add('active');
}

function showRegister() {
    hideAllScreens();
    document.getElementById('registerScreen').classList.add('active');
}

function showDashboard() {
    hideAllScreens();
    document.getElementById('dashboardScreen').classList.add('active');
    document.getElementById('userName').textContent = currentUser.nome;
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}Section`).classList.add('active');
    
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Recarrega dados da seção
    if (sectionName === 'produtos') loadProdutos();
    if (sectionName === 'pedidos') loadPedidos();
    if (sectionName === 'relatorios') updateStats();
}

// ============================================
// PRODUTOS
// ============================================

async function carregarProdutos() {
    try {
        produtos = await apiRequest('/produtos');
        return produtos;
    } catch (error) {
        return [];
    }
}

async function loadProdutos() {
    const container = document.getElementById('productsList');
    container.innerHTML = '<p style="text-align: center;">Carregando produtos...</p>';
    
    await carregarProdutos();
    
    container.innerHTML = '';
    
    if (produtos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${produto.nome}</h3>
            <div class="product-info">
                <span>Categoria: ${produto.categoria}</span>
                <span>Status: ${produto.disponivel ? 'Disponível' : 'Indisponível'}</span>
            </div>
            <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
            <p style="color: #7f8c8d; font-size: 14px;">${produto.descricao || 'Sem descrição'}</p>
            <div class="product-actions">
                <button class="btn btn-primary btn-sm" onclick="editProduct(${produto.id})">Editar</button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProduct(${produto.id})">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function showAddProduct() {
    document.getElementById('addProductForm').style.display = 'block';
}

function hideAddProduct() {
    document.getElementById('addProductForm').style.display = 'none';
    document.getElementById('productForm').reset();
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const produto = {
        nome: document.getElementById('prodNome').value,
        categoria: document.getElementById('prodCategoria').value,
        preco: parseFloat(document.getElementById('prodPreco').value),
        descricao: document.getElementById('prodDescricao').value
    };
    
    try {
        await apiRequest('/produtos', {
            method: 'POST',
            body: JSON.stringify(produto)
        });
        
        hideAddProduct();
        await loadProdutos();
        showAlert('Produto adicionado com sucesso!', 'success');
    } catch (error) {
        // Erro já tratado
    }
}

async function editProduct(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    
    document.getElementById('prodNome').value = produto.nome;
    document.getElementById('prodCategoria').value = produto.categoria;
    document.getElementById('prodPreco').value = produto.preco;
    document.getElementById('prodDescricao').value = produto.descricao;
    
    // Remove o produto e permite re-adicionar (simula edição)
    await deleteProduct(id, false);
    showAddProduct();
}

async function deleteProduct(id, mostrarAlerta = true) {
    if (mostrarAlerta && !confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    try {
        await apiRequest(`/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (mostrarAlerta) {
            await loadProdutos();
            showAlert('Produto excluído com sucesso!', 'success');
        }
    } catch (error) {
        // Erro já tratado
    }
}

// ============================================
// PEDIDOS
// ============================================

async function carregarPedidos() {
    try {
        if (currentUser.tipo === 'cliente') {
            pedidos = await apiRequest(`/pedidos?clienteEmail=${currentUser.email}`);
        } else {
            pedidos = await apiRequest('/pedidos');
        }
        return pedidos;
    } catch (error) {
        return [];
    }
}

async function loadPedidos() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '<p style="text-align: center;">Carregando pedidos...</p>';
    
    await carregarPedidos();
    
    container.innerHTML = '';
    
    if (pedidos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum pedido realizado ainda.</p>';
        return;
    }
    
    pedidos.slice().reverse().forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        const statusClass = pedido.status === 'entregue' ? 'completed' : 'pending';
        const statusText = pedido.status.toUpperCase();
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Pedido #${pedido.id}</h3>
                    <p style="color: #7f8c8d;">Cliente: ${pedido.clienteNome}</p>
                    <p style="color: #7f8c8d; font-size: 12px;">${new Date(pedido.dataHora).toLocaleString('pt-BR')}</p>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-items">
                ${pedido.itens.map(item => `
                    <div class="order-item">
                        <span>${item.quantidade}x ${item.nomeProduto}</span>
                        <span>R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">Total: R$ ${pedido.total.toFixed(2)}</div>
            ${pedido.status === 'pendente' && currentUser.tipo === 'admin' ? `
                <button class="btn btn-primary btn-sm" onclick="completeOrder(${pedido.id})" style="margin-top: 10px;">Marcar como Entregue</button>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function showNewOrder() {
    document.getElementById('newOrderForm').style.display = 'block';
    loadOrderProducts();
}

function hideNewOrder() {
    document.getElementById('newOrderForm').style.display = 'none';
    document.getElementById('orderForm').reset();
    document.getElementById('orderProducts').innerHTML = '';
}

async function loadOrderProducts() {
    await carregarProdutos();
    
    const container = document.getElementById('orderProducts');
    container.innerHTML = '';
    
    if (produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto disponível. Cadastre produtos primeiro.</p>';
        return;
    }
    
    addProductToOrder();
}

function addProductToOrder() {
    const container = document.getElementById('orderProducts');
    const productRow = document.createElement('div');
    productRow.className = 'form-row';
    productRow.style.marginBottom = '10px';
    
    productRow.innerHTML = `
        <div class="form-group" style="margin: 0;">
            <select class="order-product-select" onchange="updateOrderTotal()">
                <option value="">Selecione um produto</option>
                ${produtos.filter(p => p.disponivel).map(p => `
                    <option value="${p.id}" data-preco="${p.preco}">
                        ${p.nome} - R$ ${p.preco.toFixed(2)}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="form-group" style="margin: 0;">
            <input type="number" class="order-quantity" min="1" value="1" placeholder="Qtd" onchange="updateOrderTotal()" style="width: 80px;">
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="removeProductFromOrder(this)" style="width: auto;">×</button>
    `;
    
    container.appendChild(productRow);
}

function removeProductFromOrder(btn) {
    btn.parentElement.remove();
    updateOrderTotal();
}

function updateOrderTotal() {
    let total = 0;
    const rows = document.querySelectorAll('#orderProducts .form-row');
    
    rows.forEach(row => {
        const select = row.querySelector('.order-product-select');
        const quantity = row.querySelector('.order-quantity');
        
        if (select.value) {
            const option = select.options[select.selectedIndex];
            const preco = parseFloat(option.getAttribute('data-preco'));
            const qtd = parseInt(quantity.value) || 0;
            total += preco * qtd;
        }
    });
    
    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

async function handleCreateOrder(e) {
    e.preventDefault();
    
    const cliente = document.getElementById('orderCliente').value;
    const rows = document.querySelectorAll('#orderProducts .form-row');
    const itens = [];
    
    rows.forEach(row => {
        const select = row.querySelector('.order-product-select');
        const quantity = row.querySelector('.order-quantity');
        
        if (select.value) {
            const produto = produtos.find(p => p.id === parseInt(select.value));
            const qtd = parseInt(quantity.value);
            
            itens.push({
                produtoId: produto.id,
                nomeProduto: produto.nome,
                quantidade: qtd,
                precoUnitario: produto.preco,
                descontoAplicado: 0
            });
        }
    });
    
    if (itens.length === 0) {
        showAlert('Adicione pelo menos um produto ao pedido!', 'error');
        return;
    }
    
    const pedidoData = {
        clienteEmail: currentUser.email,
        clienteNome: cliente,
        clienteTelefone: currentUser.telefone || '0000000000',
        tipoEntrega: 'entrega',
        enderecoEntrega: currentUser.endereco,
        itens,
        observacoes: '',
        formaPagamento: 'dinheiro'
    };
    
    try {
        await apiRequest('/pedidos', {
            method: 'POST',
            body: JSON.stringify(pedidoData)
        });
        
        hideNewOrder();
        await loadPedidos();
        showAlert('Pedido criado com sucesso!', 'success');
    } catch (error) {
        // Erro já tratado
    }
}

async function completeOrder(id) {
    try {
        await apiRequest(`/pedidos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'entregue' })
        });
        
        await loadPedidos();
        await updateStats();
        showAlert('Pedido marcado como entregue!', 'success');
    } catch (error) {
        // Erro já tratado
    }
}

// ============================================
// ESTATÍSTICAS
// ============================================

async function updateStats() {
    try {
        const stats = await apiRequest('/estatisticas');
        
        document.getElementById('totalVendas').textContent = stats.totalVendas.toFixed(2);
        document.getElementById('pedidosHoje').textContent = stats.pedidosHoje;
        document.getElementById('totalProdutos').textContent = stats.totalProdutos;
        document.getElementById('ticketMedio').textContent = stats.ticketMedio.toFixed(2);
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function generateReport() {
    await carregarPedidos();
    
    const reportContent = document.getElementById('reportContent');
    
    const produtosMaisVendidos = {};
    pedidos.forEach(pedido => {
        pedido.itens.forEach(item => {
            if (!produtosMaisVendidos[item.nomeProduto]) {
                produtosMaisVendidos[item.nomeProduto] = 0;
            }
            produtosMaisVendidos[item.nomeProduto] += item.quantidade;
        });
    });
    
    const sortedProdutos = Object.entries(produtosMaisVendidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const totalPedidos = pedidos.length;
    const pedidosCompletos = pedidos.filter(p => p.status === 'entregue').length;
    const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
    
    reportContent.innerHTML = `
        <h4>Produtos Mais Vendidos</h4>
        <ol>
            ${sortedProdutos.map(([nome, qtd]) => `
                <li>${nome}: ${qtd} unidades vendidas</li>
            `).join('')}
        </ol>
        <h4 style="margin-top: 20px;">Resumo de Vendas</h4>
        <p>Total de Pedidos: ${totalPedidos}</p>
        <p>Pedidos Entregues: ${pedidosCompletos}</p>
        <p>Pedidos Pendentes: ${pedidosPendentes}</p>
    `;
}

// ============================================
// PROMOÇÕES
// ============================================

async function carregarPromocoesDoDia() {
    try {
        const promocoes = await apiRequest('/promocoes/hoje');
        exibirPromocoesNaTela(promocoes);
    } catch (error) {
        console.error('Erro ao carregar promoções:', error);
    }
}

function exibirPromocoesNaTela(promocoes) {
    if (promocoes.length === 0) return;
    
    console.log('🔥 Promoções de hoje:', promocoes);
    // Você pode adicionar um banner de promoções na interface se desejar
}

// ============================================
// CARREGAR DADOS DO DASHBOARD
// ============================================

async function carregarDadosDashboard() {
    await loadProdutos();
    await loadPedidos();
    await updateStats();
}

// ============================================
// ALERTAS
// ============================================

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}