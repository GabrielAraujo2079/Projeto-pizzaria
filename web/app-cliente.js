// Cliente Panel
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let produtos = [];
let pedidos = [];
let carrinho = [];
let filtroAtual = 'todos';
let currentPromotion = null; // promoção ativa no cliente

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Restaurar sessão se existir
    const saved = localStorage.getItem('pizzaria_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            if (currentUser.tipo === 'admin') {
                // usuario admin acessando área do cliente -> redireciona ao admin
                window.location.href = '/admin';
            } else {
                // restaura sessão do cliente
                showDashboard();
                carregarDados();
            }
        } catch (err) {
            console.error('Erro ao restaurar usuário do localStorage', err);
            localStorage.removeItem('pizzaria_user');
        }
    }
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
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

        // Salva sessão
        try { localStorage.setItem('pizzaria_user', JSON.stringify(currentUser)); } catch (err) { console.warn('Não foi possível salvar sessão', err); }

        // Se for admin, redireciona para painel admin
        if (currentUser.tipo === 'admin') {
            window.location.href = '/admin';
            return;
        }

        showDashboard();
        showAlert('Login realizado com sucesso!', 'success');
        await carregarDados();
    } catch (error) {
        // Erro já tratado
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
    
    // Ler campos adicionais do formulário
    const cpf = document.getElementById('regCpf').value.replace(/\D/g, '');
    const telefone = document.getElementById('regTelefone').value.replace(/\D/g, '');
    const dataCampo = document.getElementById('regDataNascimento').value; // formato YYYY-MM-DD
    let dataNascmto = '';
    if (dataCampo) {
        const d = new Date(dataCampo);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        dataNascmto = `${day}/${month}/${year}`; // formato DD/MM/YYYY esperado pelo servidor
    }

    const endereco = {
        rua: document.getElementById('regRua').value || '',
        numero: document.getElementById('regNumero').value || '',
        bairro: document.getElementById('regBairro').value || '',
        cidade: document.getElementById('regCidade').value || '',
        estado: document.getElementById('regEstado').value || '',
        cep: document.getElementById('regCep').value || '',
        complemento: document.getElementById('regComplemento').value || ''
    };

    // Validações do front-end
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!nome || nome.length < 3) { showAlert('Nome deve ter ao menos 3 caracteres', 'error'); return; }
    if (!emailRegex.test(email)) { showAlert('Email inválido', 'error'); return; }
    if (!senha || senha.length < 6) { showAlert('Senha deve ter ao menos 6 caracteres', 'error'); return; }
    if (senha !== confirmSenha) { showAlert('As senhas não coincidem!', 'error'); return; }
    if (!/^[0-9]{11}$/.test(cpf)) { showAlert('CPF deve ter 11 dígitos numéricos', 'error'); return; }
    if (!/^[0-9]{10,11}$/.test(telefone)) { showAlert('Telefone deve ter 10 ou 11 dígitos', 'error'); return; }
    if (!dataCampo) { showAlert('Data de nascimento é obrigatória', 'error'); return; }
    if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cep) {
        showAlert('Preencha o endereço (rua, número, bairro e CEP) corretamente', 'error');
        return;
    }

    const dadosCadastro = {
        nome,
        email,
        senha,
        cpf: cpf || '00000000000',
        telefone: telefone || '0000000000',
        endereco,
        tipo: document.getElementById('regTipo') ? document.getElementById('regTipo').value : 'cliente',
        dataNascmto: dataNascmto || ''
    };

    try {
        const response = await apiRequest('/auth/cadastro', {
            method: 'POST',
            body: JSON.stringify(dadosCadastro)
        });

        // Auto-login: servidor retorna o usuário criado
        if (response && response.usuario) {
            currentUser = response.usuario;
            try { localStorage.setItem('pizzaria_user', JSON.stringify(currentUser)); } catch (err) { console.warn('Não foi possível salvar sessão', err); }

            if (currentUser.tipo === 'admin') {
                window.location.href = '/admin';
                return;
            }

            showDashboard();
            await carregarDados();
            showAlert('Cadastro realizado e logado com sucesso!', 'success');
            return;
        }

        showAlert('Cadastro realizado com sucesso!', 'success');
        setTimeout(() => showLogin(), 1500);
    } catch (error) {
        // Erro já tratado
    }
}

function logout() {
    currentUser = null;
    carrinho = [];
    try { localStorage.removeItem('pizzaria_user'); } catch (err) {}
    showLogin();
}

// ============================================
// GERENCIAMENTO DE TELAS
// ============================================

function showLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.remove('active');
}

function showRegister() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    document.getElementById('userName').textContent = currentUser.nome;
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
    if (sectionName === 'catalogo') loadProdutos();
    if (sectionName === 'carrinho') renderCarrinho();
    if (sectionName === 'pedidos') loadPedidos();
    if (sectionName === 'perfil') loadPerfil();
}

// ============================================
// API REQUESTS
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
// CATÁLOGO
// ============================================

async function loadProdutos() {
    try {
        produtos = await apiRequest('/produtos');
        renderProdutos();
        await renderPromocaoDoDia();
    } catch (error) {
        console.log('Erro ao carregar produtos');
    }
}

function renderProdutos() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    
    // Sempre mostrar apenas produtos disponíveis para o cliente
    const produtosFiltrados = produtos
        .filter(p => p.disponivel)
        .filter(p => filtroAtual === 'todos' ? true : p.categoria === filtroAtual);
    
    if (produtosFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #7f8c8d;">Nenhum produto disponível nesta categoria.</p>';
        return;
    }
    
    produtosFiltrados.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const placeholder = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='260'><rect width='100%' height='100%' fill='%23f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23808c8d' font-size='18'>Sem imagem</text></svg>`);
        const imgSrc = produto.imagemUrl ? produto.imagemUrl : `data:image/svg+xml;utf8,${placeholder}`;
        card.innerHTML = `
            <div style="width:100%; height:160px; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                <img src="${imgSrc}" alt="${produto.nome}" style="max-width:100%; max-height:160px; object-fit:cover; border-radius:8px;">
            </div>
            <h3>${produto.nome}</h3>
            <p style="color: #7f8c8d; font-size: 14px; min-height: 40px;">${produto.descricao || 'Sem descrição'}</p>
            <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
            <button class="btn btn-primary btn-block" onclick="addToCart(${produto.id}, '${produto.nome}', ${produto.preco})">
                🛒 Adicionar ao Carrinho
            </button>
        `;
        container.appendChild(card);
    });
}

function filterProducts(categoria) {
    filtroAtual = categoria;
    
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderProdutos();
}

async function renderPromocaoDoDia() {
    const container = document.getElementById('promotionOfDay');
    
    try {
        // Chama endpoint específico que retorna promoções válidas para hoje
        const promocoesHoje = await apiRequest('/promocoes/hoje');
        const promocaoDia = Array.isArray(promocoesHoje) ? promocoesHoje[0] : null;

        if (promocaoDia) {
            // armazena promoção atual para cálculo no carrinho
            currentPromotion = promocaoDia;
            const desconto = promocaoDia.tipoDesconto === 'percentual'
                ? `${promocaoDia.valorDesconto}%`
                : `R$ ${parseFloat(promocaoDia.valorDesconto).toFixed(2)}`;

            const categoriaTexto = {
                'pizza': '🍕 Pizzas',
                'bebida': '🥤 Bebidas',
                'sobremesa': '🍰 Sobremesas',
                'todos': '✨ Todos os Produtos'
            }[promocaoDia.categoriaAplicavel] || promocaoDia.categoriaAplicavel;

            // Exibir em texto simples (sem imagem) conforme solicitado
            container.innerHTML = `
                <h3>🎉 Promoção do Dia</h3>
                <p><strong>${promocaoDia.nome}</strong></p>
                <p>${promocaoDia.descricao}</p>
                <div class="promo-discount">${desconto} OFF</div>
                <span class="promo-category">${categoriaTexto}</span>
            `;
        } else {
            currentPromotion = null;
            container.innerHTML = '<p style="color:#666;">Nenhuma promoção ativa para hoje.</p>';
        }
    } catch (error) {
        console.log('Erro ao carregar promoção do dia');
        document.getElementById('promotionOfDay').innerHTML = '';
    }
}

// ============================================
// CARRINHO
// ============================================

function addToCart(produtoId, nome, preco) {
    const itemExistente = carrinho.find(item => item.produtoId === produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            produtoId,
            nomeProduto: nome,
            quantidade: 1,
            precoUnitario: preco,
            descontoAplicado: 0
        });
    }
    
    showAlert(`${nome} adicionado ao carrinho!`, 'success');
    updateCartCount();
}

function updateCartCount() {
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
    });
}

function renderCarrinho() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    
    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; grid-column: 1/-1;">Seu carrinho está vazio.</p>';
        updateCartTotals();
        return;
    }
    
    carrinho.forEach((item, index) => {
        const subtotal = item.precoUnitario * item.quantidade;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.nomeProduto}</h4>
                <p>R$ ${item.precoUnitario.toFixed(2)}</p>
            </div>
            <div class="item-controls">
                <button class="btn btn-sm" onclick="updateCartQty(${index}, -1)">−</button>
                <span class="qty">${item.quantidade}</span>
                <button class="btn btn-sm" onclick="updateCartQty(${index}, 1)">+</button>
            </div>
            <div class="item-total">
                R$ ${subtotal.toFixed(2)}
            </div>
            <button class="btn btn-sm btn-secondary" onclick="removeFromCart(${index})">🗑️</button>
        `;
        container.appendChild(itemDiv);
    });
    
    updateCartTotals();
}

function updateCartQty(index, delta) {
    carrinho[index].quantidade += delta;
    
    if (carrinho[index].quantidade <= 0) {
        removeFromCart(index);
    } else {
        renderCarrinho();
    }
}

function removeFromCart(index) {
    carrinho.splice(index, 1);
    renderCarrinho();
}

function updateCartTotals() {
    const subtotal = carrinho.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    let desconto = 0;
    // Se houver promoção ativa, calcular desconto dinamicamente
    if (currentPromotion) {
        // se houver valor mínimo de pedido, aplica somente se subtotal >= valorMinimoPedido
        if (currentPromotion.valorMinimoPedido && subtotal < currentPromotion.valorMinimoPedido) {
            desconto = 0;
        } else {
            carrinho.forEach(item => {
                // encontrar produto para categoria
                const produto = produtos.find(p => p.id === item.produtoId);
                const categoria = produto ? produto.categoria : null;

                // verifica se a promoção se aplica ao item
                const aplicaCategoria = !currentPromotion.categoriaAplicavel || currentPromotion.categoriaAplicavel === 'todos' || (categoria && currentPromotion.categoriaAplicavel === categoria);
                const aplicaProduto = !currentPromotion.produtoEspecifico || currentPromotion.produtoEspecifico === item.produtoId;

                if (aplicaCategoria && aplicaProduto) {
                    const itemSubtotal = item.precoUnitario * item.quantidade;
                    if (currentPromotion.tipoDesconto === 'percentual') {
                        desconto += itemSubtotal * (currentPromotion.valorDesconto / 100);
                    } else {
                        // valor fixo por unidade
                        desconto += Math.min(currentPromotion.valorDesconto * item.quantidade, itemSubtotal);
                    }
                }
            });
        }
    } else {
        desconto = carrinho.reduce((sum, item) => sum + item.descontoAplicado, 0);
    }

    const total = subtotal - desconto;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('discount').textContent = desconto.toFixed(2);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function proceedCheckout() {
    if (carrinho.length === 0) {
        showAlert('Adicione produtos ao carrinho!', 'warning');
        return;
    }
    
    document.getElementById('checkoutNome').value = currentUser.nome;
    document.getElementById('checkoutTelefone').value = currentUser.telefone || '';
    // Preencher endereço salvo, se houver
    const endereco = currentUser.endereco || null;
    if (endereco) {
        const parts = [];
        if (endereco.rua) parts.push(endereco.rua + (endereco.numero ? ', ' + endereco.numero : ''));
        if (endereco.bairro) parts.push(endereco.bairro);
        if (endereco.cidade || endereco.estado) parts.push(((endereco.cidade || '') + (endereco.estado ? ' / ' + endereco.estado : '')));
        if (endereco.cep) parts.push('CEP ' + endereco.cep);
        const enderecoFormatado = parts.join(' - ');
        document.getElementById('checkoutEndereco').value = enderecoFormatado;
    } else {
        document.getElementById('checkoutEndereco').value = '';
    }

    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

async function handleCheckout(e) {
    e.preventDefault();
    
    if (carrinho.length === 0) {
        showAlert('Adicione produtos ao carrinho!', 'error');
        return;
    }
    
    const pedidoData = {
        clienteEmail: currentUser.email,
        clienteNome: document.getElementById('checkoutNome').value,
        clienteTelefone: document.getElementById('checkoutTelefone').value,
        tipoEntrega: 'entrega',
        enderecoEntrega: {
            rua: document.getElementById('checkoutEndereco').value,
            numero: document.getElementById('checkoutNumero')?.value || '',
            bairro: document.getElementById('checkoutBairro')?.value || '',
            cidade: document.getElementById('checkoutCidade')?.value || '',
            estado: document.getElementById('checkoutEstado')?.value || '',
            cep: document.getElementById('checkoutCep')?.value || '',
            complemento: document.getElementById('checkoutComplemento')?.value || ''
        },
        itens: carrinho,
        observacoes: document.getElementById('checkoutObs').value,
        formaPagamento: document.getElementById('checkoutPagamento').value
    };
    
    try {
        const response = await apiRequest('/pedidos', {
            method: 'POST',
            body: JSON.stringify(pedidoData)
        });
        
        closeCheckout();
        carrinho = [];
        renderCarrinho();
        showAlert('Pedido realizado com sucesso! 🎉', 'success');
        setTimeout(() => { showSection('pedidos'); loadPedidos(); }, 1500);
    } catch (error) {
        showAlert(error.message || 'Erro ao criar pedido', 'error');
    }
}

// ============================================
// PEDIDOS
// ============================================

async function loadPedidos() {
    try {
        const allPedidos = await apiRequest('/pedidos');
        pedidos = allPedidos.filter(p => p.clienteEmail === currentUser.email);
        renderPedidos();
    } catch (error) {
        console.log('Erro ao carregar pedidos');
    }
}

function renderPedidos() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '';
    
    if (pedidos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Você não tem pedidos ainda.</p>';
        return;
    }
    
    pedidos.slice().reverse().forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const statusClass = pedido.status === 'entregue' ? 'completed' : 'pending';
        const statusEmoji = {
            'pendente': '⏳',
            'preparando': '👨‍🍳',
            'pronto': '✅',
            'entregue': '🎉',
            'cancelado': '❌'
        };
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Pedido #${pedido.id}</h3>
                    <p style="color: #7f8c8d; font-size: 12px;">${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
                <span class="order-status ${statusClass}">${statusEmoji[pedido.status]} ${pedido.status.toUpperCase()}</span>
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
            <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d;">
                    <p>Entrega em: ${pedido.enderecoEntrega ? `${pedido.enderecoEntrega.rua || ''}${pedido.enderecoEntrega.numero ? ', ' + pedido.enderecoEntrega.numero : ''}${pedido.enderecoEntrega.bairro ? ' - ' + pedido.enderecoEntrega.bairro : ''}${pedido.enderecoEntrega.cep ? ' - CEP: ' + pedido.enderecoEntrega.cep : ''}` : 'Não informado'}</p>
                <p>Pagamento: ${pedido.formaPagamento}</p>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="btn btn-primary btn-sm" onclick="gerarNotaFiscal(${pedido.id})">📄 Emitir Nota Fiscal</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function gerarNotaFiscal(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
        showAlert('Pedido não encontrado', 'error');
        return;
    }

    // Gerar conteúdo HTML da nota fiscal
    const notaHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="utf-8">
            <title>Nota Fiscal - Pedido ${pedido.id}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 5px 0;
                    color: #666;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 4px;
                }
                .info-block h3 {
                    margin: 0 0 10px 0;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #333;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                .info-block p {
                    margin: 5px 0;
                    font-size: 13px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                table th {
                    background: #333;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-size: 12px;
                }
                table td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #ddd;
                    font-size: 13px;
                }
                table tr:hover {
                    background: #f9f9f9;
                }
                .totals {
                    text-align: right;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #333;
                }
                .totals-row {
                    display: flex;
                    justify-content: flex-end;
                    margin: 8px 0;
                    font-size: 13px;
                }
                .totals-row span:first-child {
                    min-width: 150px;
                    text-align: right;
                    margin-right: 50px;
                }
                .totals-row.total {
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 15px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 11px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .status-entregue {
                    background: #27ae60;
                    color: white;
                }
                .status-pendente {
                    background: #f39c12;
                    color: white;
                }
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    .container {
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍕 NOTA FISCAL ELETRÔNICA</h1>
                    <p>Pedido #${pedido.id}</p>
                    <p>${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                </div>

                <div class="info-grid">
                    <div class="info-block">
                        <h3>📋 Dados do Cliente</h3>
                        <p><strong>Nome:</strong> ${pedido.clienteNome}</p>
                        <p><strong>Email:</strong> ${pedido.clienteEmail}</p>
                        <p><strong>Telefone:</strong> ${pedido.clienteTelefone}</p>
                    </div>
                    <div class="info-block">
                        <h3>🚚 Entrega</h3>
                        <p><strong>Endereço:</strong> ${pedido.enderecoEntrega?.rua || 'Não informado'}, ${pedido.enderecoEntrega?.numero || 'S/N'}</p>
                        <p><strong>Bairro:</strong> ${pedido.enderecoEntrega?.bairro || 'Não informado'}</p>
                        <p><strong>Forma Pagamento:</strong> ${pedido.formaPagamento.toUpperCase()}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th style="text-align: center;">Qtd</th>
                            <th style="text-align: right;">Valor Unit.</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedido.itens.map(item => `
                            <tr>
                                <td>${item.nomeProduto}</td>
                                <td style="text-align: center;">${item.quantidade}</td>
                                <td style="text-align: right;">R$ ${item.precoUnitario.toFixed(2)}</td>
                                <td style="text-align: right;">R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-row">
                        <span>Subtotal:</span>
                        <span>R$ ${pedido.subtotalOriginal?.toFixed(2) || (pedido.itens.reduce((sum, i) => sum + (i.precoUnitario * i.quantidade), 0)).toFixed(2)}</span>
                    </div>
                    ${pedido.totalDescontos > 0 ? `
                    <div class="totals-row">
                        <span>Descontos:</span>
                        <span>-R$ ${pedido.totalDescontos.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="totals-row total">
                        <span>TOTAL:</span>
                        <span>R$ ${pedido.total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Nota Fiscal gerada em ${new Date().toLocaleString('pt-BR')}</p>
                    <p>Status do Pedido: <span class="status-badge status-${pedido.status}">${pedido.status.toUpperCase()}</span></p>
                    <p style="margin-top: 20px; color: #999;">Obrigado por sua compra!</p>
                </div>
            </div>

            <script>
                window.print();
                window.onafterprint = function() {
                    window.close();
                };
            </script>
        </body>
        </html>
    `;

    // Abrir em nova janela e imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(notaHTML);
    printWindow.document.close();
}

// ============================================
// PERFIL
// ============================================

function loadPerfil() {
    // Preencher todos os campos de perfil
    document.getElementById('profNome').value = currentUser.nome || '';
    document.getElementById('profEmail').value = currentUser.email || '';
    document.getElementById('profCpf').value = currentUser.cpf || '';
    document.getElementById('profTelefone').value = currentUser.telefone || '';
    
    // Data de nascimento (converter se necessário)
    if (currentUser.dataNascimento) {
        const d = new Date(currentUser.dataNascimento);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        document.getElementById('profDataNascimento').value = `${year}-${month}-${day}`;
    }
    
    document.getElementById('profTipo').value = currentUser.tipo || 'cliente';
    
    // Endereço
    if (currentUser.endereco) {
        document.getElementById('profRua').value = currentUser.endereco.rua || '';
        document.getElementById('profNumero').value = currentUser.endereco.numero || '';
        document.getElementById('profBairro').value = currentUser.endereco.bairro || '';
        document.getElementById('profComplemento').value = currentUser.endereco.complemento || '';
        document.getElementById('profCidade').value = currentUser.endereco.cidade || '';
        document.getElementById('profEstado').value = currentUser.endereco.estado || '';
        document.getElementById('profCep').value = currentUser.endereco.cep || '';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const usuarioAtualizado = {
        nome: document.getElementById('profNome').value,
        email: document.getElementById('profEmail').value,
        telefone: document.getElementById('profTelefone').value,
        endereco: {
            rua: document.getElementById('profRua').value,
            numero: document.getElementById('profNumero').value,
            bairro: document.getElementById('profBairro').value,
            complemento: document.getElementById('profComplemento').value,
            cidade: document.getElementById('profCidade').value,
            estado: document.getElementById('profEstado').value,
            cep: document.getElementById('profCep').value
        }
    };
    
    try {
        // Se já houver um endereço salvo localmente, envie também o id do endereço para que o backend atualize em vez de inserir
        if (currentUser && currentUser.endereco && currentUser.endereco.id) {
            usuarioAtualizado.endereco.id = currentUser.endereco.id;
        }

        const response = await apiRequest(`/usuarios/${currentUser.id}`, {
            method: 'PUT',
            body: JSON.stringify(usuarioAtualizado)
        });

        // O backend pode retornar diretamente o usuário ou um objeto { usuario }
        const updatedUser = response.usuario ? response.usuario : response;

        // Garantir que o endereco final esteja presente (fallback para o que enviamos)
        if (!updatedUser.endereco) {
            updatedUser.endereco = usuarioAtualizado.endereco;
        }

        currentUser = { ...currentUser, ...updatedUser };
        localStorage.setItem('pizzaria_user', JSON.stringify(currentUser));
        showAlert('Perfil atualizado com sucesso! ✅', 'success');
    } catch (error) {
        console.log('Erro ao atualizar perfil:', error);
        showAlert('Erro ao atualizar perfil', 'error');
    }
}

// ============================================
// CARREGAR DADOS INICIAIS
// ============================================

async function carregarDados() {
    await loadProdutos();
    await loadPedidos();
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

// Inicializar
loadProdutos();
