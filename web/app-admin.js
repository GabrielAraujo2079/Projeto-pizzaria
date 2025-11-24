// Painel Admin
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let produtos = [];
let pedidos = [];
let usuarios = [];
let promocoes = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Restaurar sessão se existir
    const saved = localStorage.getItem('pizzaria_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            if (currentUser.tipo === 'admin') {
                showDashboard();
                carregarDadosDashboard();
            } else {
                // Se for cliente, redireciona para o painel do cliente
                window.location.href = '/cliente';
            }
        } catch (err) {
            console.error('Erro ao restaurar usuário do localStorage', err);
            localStorage.removeItem('pizzaria_user');
            showLogin();
        }
    } else {
        // Mostrar tela de login se não houver usuário salvo
        showLogin();
    }
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('productForm').addEventListener('submit', handleAddProduct);
    document.getElementById('promotionForm').addEventListener('submit', handleAddPromotion);
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

        // Salva sessão no localStorage
        try { localStorage.setItem('pizzaria_user', JSON.stringify(currentUser)); } catch (err) { console.warn('Não foi possível salvar sessão', err); }

        // Redireciona de acordo com o tipo
        if (currentUser.tipo === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/cliente';
        }
    } catch (error) {
        // Erro já tratado
    }
}

function logout() {
    currentUser = null;
    try { localStorage.removeItem('pizzaria_user'); } catch (err) {}
    showLogin();
}

// ============================================
// GERENCIAMENTO DE TELAS
// ============================================

function showLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
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
    if (sectionName === 'produtos') loadProdutos();
    if (sectionName === 'pedidos') loadPedidos();
    if (sectionName === 'usuarios') loadUsuarios();
    if (sectionName === 'promocoes') loadPromocoes();
    if (sectionName === 'relatorios') generateReport();
    if (sectionName === 'dashboard') updateStats();
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
// DASHBOARD
// ============================================

async function updateStats() {
    try {
        const stats = await apiRequest('/estatisticas');
        const allPedidos = await apiRequest('/pedidos');
        const allUsuarios = await apiRequest('/usuarios');
        
        const pedidosPending = allPedidos.filter(p => p.status === 'pendente').length;
        
        document.getElementById('totalVendas').textContent = stats.totalVendas.toFixed(2);
        document.getElementById('pedidosHoje').textContent = stats.pedidosHoje;
        document.getElementById('totalProdutos').textContent = stats.totalProdutos;
        document.getElementById('ticketMedio').textContent = stats.ticketMedio.toFixed(2);
        document.getElementById('totalUsuarios').textContent = allUsuarios.length;
        document.getElementById('pedidosPendentes').textContent = pedidosPending;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ============================================
// PRODUTOS
// ============================================

async function loadProdutos() {
    try {
        produtos = await apiRequest('/produtos');
        renderProdutos();
    } catch (error) {
        console.log('Erro ao carregar produtos');
    }
}

function renderProdutos() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    
    if (produtos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    // Se o admin não marcou "Mostrar produtos excluídos", filtrar apenas disponiveis
    const showExcluded = document.getElementById('showExcluded') && document.getElementById('showExcluded').checked;
    const produtosParaMostrar = showExcluded ? produtos : produtos.filter(p => p.disponivel);

    produtosParaMostrar.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const placeholder = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='260'><rect width='100%' height='100%' fill='%23f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23808c8d' font-size='18'>Sem imagem</text></svg>`);
        const imgSrc = produto.imagemUrl ? produto.imagemUrl : `data:image/svg+xml;utf8,${placeholder}`;
        card.innerHTML = `
            <div style="width:100%; height:140px; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:12px; border-radius:8px; background:#f5f5f5;">
                <img src="${imgSrc}" alt="${produto.nome}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">
            </div>
            <h3 style="margin-bottom:6px; font-size:16px; min-height:22px;">${produto.nome}</h3>
            <div class="product-info" style="flex-grow:1;">
                <span style="font-size:12px;">📂 ${produto.categoria}</span>
                <span style="font-size:12px; margin-top:4px;">${produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}</span>
            </div>
            <div class="product-price" style="margin:10px 0; font-size:1.3em;">R$ ${produto.preco.toFixed(2)}</div>
            <p style="color: #7f8c8d; font-size: 12px; line-height: 1.4; margin-bottom:12px; flex-grow:1;">${produto.descricao || 'Sem descrição'}</p>
            <div class="product-actions">
                <button class="btn btn-primary btn-sm" onclick="editProduct(${produto.id})" style="flex:1; font-size:12px; padding:6px 8px;">✏️ Editar</button>
                <button class="btn btn-secondary btn-sm" onclick="deleteProduct(${produto.id})" style="flex:1; font-size:12px; padding:6px 8px;">🗑️ Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

    async function deletePromocao(id) {
        if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;
        try {
            await apiRequest(`/promocoes/${id}`, { method: 'DELETE' });
            await loadPromocoes();
            showAlert('Promoção excluída com sucesso!', 'success');
        } catch (error) {
            console.log('Erro ao excluir promoção');
        }
    }

    function searchPromocoes() {
        loadPromocoes();
    }

    function clearPromoSearch() {
        const el = document.getElementById('promoSearch');
        if (el) el.value = '';
        loadPromocoes();
    }

function showAddProduct() {
    // Só reseta o formulário se não estiver editando
    if (!editingProductId) {
        document.getElementById('productForm').reset();
        // Limpar o input de arquivo também
        const fileEl = document.getElementById('prodImagem');
        if (fileEl) fileEl.value = '';
    }
    document.getElementById('addProductForm').style.display = 'block';
}

function hideAddProduct() {
    document.getElementById('addProductForm').style.display = 'none';
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const produto = {
        nome: document.getElementById('prodNome').value,
        categoria: document.getElementById('prodCategoria').value,
        preco: parseFloat(document.getElementById('prodPreco').value),
        descricao: document.getElementById('prodDescricao').value,
        disponivel: document.getElementById('prodDisponivel').value === 'true'
    };
    const fileEl = document.getElementById('prodImagem');
    const file = fileEl ? fileEl.files[0] : null;

    try {
        if (editingProductId) {
            // Atualiza dados do produto
            const updated = await apiRequest(`/produtos/${editingProductId}`, {
                method: 'PUT',
                body: JSON.stringify(produto)
            });

            // Se houver imagem, enviar para endpoint de upload (mantendo os outros dados intactos)
            if (file) {
                const form = new FormData();
                form.append('imagem', file);
                await fetch(`${API_URL}/produtos/${editingProductId}/imagem`, {
                    method: 'POST',
                    body: form
                });
            }

            showAlert('Produto atualizado com sucesso!', 'success');
            editingProductId = null; // Limpar apenas após sucesso
        } else {
            // Criar produto primeiro
            const created = await apiRequest('/produtos', {
                method: 'POST',
                body: JSON.stringify(produto)
            });

            // Se imagem selecionada, fazer upload para o produto criado
            if (file && created && created.id) {
                const form = new FormData();
                form.append('imagem', file);
                await fetch(`${API_URL}/produtos/${created.id}/imagem`, {
                    method: 'POST',
                    body: form
                });
            }

            showAlert('Produto adicionado com sucesso!', 'success');
        }

        hideAddProduct();
        // limpar input de arquivo
        if (fileEl) fileEl.value = '';
        await loadProdutos();
    } catch (error) {
        console.log('Erro ao salvar produto', error);
    }
}

function editProduct(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    
    editingProductId = id;
    document.getElementById('prodNome').value = produto.nome;
    document.getElementById('prodCategoria').value = produto.categoria;
    document.getElementById('prodPreco').value = produto.preco;
    document.getElementById('prodDescricao').value = produto.descricao;
    document.getElementById('prodDisponivel').value = produto.disponivel;
    
    // Limpar o input de arquivo para permitir selecionar nova imagem
    const fileEl = document.getElementById('prodImagem');
    if (fileEl) fileEl.value = '';
    
    showAddProduct();
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        await apiRequest(`/produtos/${id}`, { method: 'DELETE' });
        await loadProdutos();
        showAlert('Produto excluído com sucesso!', 'success');
    } catch (error) {
        console.log('Erro ao excluir produto');
    }
}

// ============================================
// PEDIDOS
// ============================================

async function loadPedidos() {
    try {
        const q = document.getElementById('orderSearch') ? document.getElementById('orderSearch').value : '';
        pedidos = q ? await apiRequest(`/pedidos?q=${encodeURIComponent(q)}`) : await apiRequest('/pedidos');
        renderPedidos();
    } catch (error) {
        console.log('Erro ao carregar pedidos');
    }
}

function renderPedidos() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '';
    
    if (pedidos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum pedido realizado ainda.</p>';
        return;
    }
    
    pedidos.slice().reverse().forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const statusClass = pedido.status === 'entregue' ? 'completed' : 'pending';
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Pedido #${pedido.id}</h3>
                    <p style="color: #7f8c8d;">Cliente: ${pedido.clienteNome}</p>
                    <p style="color: #7f8c8d;">Email: ${pedido.clienteEmail}</p>
                    <p style="color: #7f8c8d; font-size: 12px;">${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
                <span class="order-status ${statusClass}">${pedido.status.toUpperCase()}</span>
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
            <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-primary btn-sm" onclick="editOrderStatus(${pedido.id})">✏️ Editar Status</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${pedido.id})">🗑️ Excluir Pedido</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function updateOrderStatus(id, status) {
    try {
        await apiRequest(`/pedidos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        await loadPedidos();
        showAlert(`Pedido atualizado para ${status}!`, 'success');
    } catch (error) {
        console.log('Erro ao atualizar pedido');
    }
}

async function deleteOrder(id) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
        await apiRequest(`/pedidos/${id}`, { method: 'DELETE' });
        await loadPedidos();
        showAlert('Pedido excluído com sucesso!', 'success');
    } catch (error) {
        console.log('Erro ao excluir pedido');
    }
}

function editOrderStatus(id) {
    document.getElementById('editOrderID').value = id;
    document.getElementById('editOrderStatusForm').style.display = 'block';
}

function hideEditOrderStatusForm() {
    document.getElementById('editOrderStatusForm').style.display = 'none';
}

async function handleEditOrderStatus(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editOrderID').value);
    const status = document.getElementById('editOrderStatus').value;
    
    try {
        await apiRequest(`/pedidos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showAlert(`Pedido atualizado para ${status}!`, 'success');
        hideEditOrderStatusForm();
        await loadPedidos();
    } catch (error) {
        console.log('Erro ao atualizar status do pedido');
    }
}

function searchPedidos() {
    loadPedidos();
}

function clearOrderSearch() {
    const el = document.getElementById('orderSearch');
    if (el) el.value = '';
    loadPedidos();
}

// ============================================
// USUÁRIOS
// ============================================

async function loadUsuarios() {
    try {
        const q = document.getElementById('userSearch') ? document.getElementById('userSearch').value : '';
        usuarios = q ? await apiRequest(`/usuarios?q=${encodeURIComponent(q)}`) : await apiRequest('/usuarios');
        renderUsuarios();
    } catch (error) {
        console.log('Erro ao carregar usuários');
    }
}

function renderUsuarios() {
    const container = document.getElementById('usersList');
    container.innerHTML = '';
    
    if (usuarios.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum usuário cadastrado.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'users-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Telefone</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${usuarios.map(u => `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td><span class="badge ${u.tipo === 'admin' ? 'badge-admin' : 'badge-client'}">${u.tipo}</span></td>
                    <td>${u.telefone}</td>
                    <td>${new Date(u.criadoEm).toLocaleDateString('pt-BR')}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editUsuario(${u.id})" style="margin-right:5px;">✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUsuario(${u.id})">🗑️ Excluir</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

async function deleteUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
        await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
        await loadUsuarios();
        showAlert('Usuário excluído com sucesso!', 'success');
    } catch (error) {
        console.log('Erro ao excluir usuário');
    }
}

function editUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    document.getElementById('editUserID').value = usuario.id;
    document.getElementById('editUserNome').value = usuario.nome;
    document.getElementById('editUserEmail').value = usuario.email;
    document.getElementById('editUserTelefone').value = usuario.telefone || '';
    document.getElementById('editUserCpf').value = usuario.cpf || '';
    // dataNascimento pode ser Date ou string
    if (usuario.dataNascimento) {
        const d = new Date(usuario.dataNascimento);
        const iso = d.toISOString().slice(0,10);
        document.getElementById('editUserDataNascimento').value = iso;
    } else {
        document.getElementById('editUserDataNascimento').value = '';
    }
    document.getElementById('editUserTipo').value = usuario.tipo || 'cliente';

    if (usuario.endereco) {
        document.getElementById('editUserEnderecoId').value = usuario.endereco.id || '';
        document.getElementById('editUserRua').value = usuario.endereco.rua || '';
        document.getElementById('editUserNumero').value = usuario.endereco.numero || '';
        document.getElementById('editUserBairro').value = usuario.endereco.bairro || '';
        document.getElementById('editUserComplemento').value = usuario.endereco.complemento || '';
        document.getElementById('editUserCidade').value = usuario.endereco.cidade || '';
        document.getElementById('editUserEstado').value = usuario.endereco.estado || '';
        document.getElementById('editUserCep').value = usuario.endereco.cep || '';
    } else {
        document.getElementById('editUserEnderecoId').value = '';
        document.getElementById('editUserRua').value = '';
        document.getElementById('editUserNumero').value = '';
        document.getElementById('editUserBairro').value = '';
        document.getElementById('editUserComplemento').value = '';
        document.getElementById('editUserCidade').value = '';
        document.getElementById('editUserEstado').value = '';
        document.getElementById('editUserCep').value = '';
    }
    
    document.getElementById('editUserForm').style.display = 'block';
}

function hideEditUserForm() {
    document.getElementById('editUserForm').style.display = 'none';
}

async function handleEditUser(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editUserID').value);
    const enderecoId = document.getElementById('editUserEnderecoId').value;
    const usuario = {
        nome: document.getElementById('editUserNome').value,
        email: document.getElementById('editUserEmail').value,
        telefone: document.getElementById('editUserTelefone').value,
        cpf: document.getElementById('editUserCpf').value,
        dataNascimento: document.getElementById('editUserDataNascimento').value || undefined,
        tipo: document.getElementById('editUserTipo').value || 'cliente',
        senha: document.getElementById('editUserSenha').value || undefined,
        endereco: {
            id: enderecoId ? parseInt(enderecoId) : undefined,
            rua: document.getElementById('editUserRua').value || '',
            numero: document.getElementById('editUserNumero').value || '',
            bairro: document.getElementById('editUserBairro').value || '',
            complemento: document.getElementById('editUserComplemento').value || '',
            cidade: document.getElementById('editUserCidade').value || '',
            estado: document.getElementById('editUserEstado').value || '',
            cep: document.getElementById('editUserCep').value || ''
        }
    };
    
    try {
        await apiRequest(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuario)
        });
        showAlert('Usuário atualizado com sucesso!', 'success');
        hideEditUserForm();
        await loadUsuarios();
    } catch (error) {
        console.log('Erro ao atualizar usuário');
    }
}

function searchUsuarios() {
    loadUsuarios();
}

function clearUserSearch() {
    const el = document.getElementById('userSearch');
    if (el) el.value = '';
    loadUsuarios();
}

// ============================================
// PROMOÇÕES
// ============================================

async function loadPromocoes() {
    try {
        const q = document.getElementById('promoSearch') ? document.getElementById('promoSearch').value : '';
        promocoes = q ? await apiRequest(`/promocoes/todas?q=${encodeURIComponent(q)}`) : await apiRequest('/promocoes/todas');
        renderPromocoes();
    } catch (error) {
        console.log('Erro ao carregar promoções');
    }
}

function renderPromocoes() {
    const container = document.getElementById('promotionsList');
    container.innerHTML = '';
    
    if (promocoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhuma promoção cadastrada.</p>';
        return;
    }
    
    promocoes.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.innerHTML = `
            <h3>${promo.nome}</h3>
            <p>${promo.descricao}</p>
            <div class="promo-info">
                <span>Desconto: ${promo.tipoDesconto === 'percentual' ? promo.valorDesconto + '%' : 'R$ ' + promo.valorDesconto.toFixed(2)}</span>
                <span>Dia: ${getDiaSemana(promo.diaSemana)}</span>
                <span>Categoria: ${promo.categoriaAplicavel}</span>
                <span>${promo.ativa ? '✅ Ativa' : '❌ Inativa'}</span>
            </div>
            <div style="margin-top:8px;">
                <button class="btn btn-danger btn-sm" onclick="deletePromocao(${promo.id})">🗑️ Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function getDiaSemana(dia) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia];
}

function showAddPromotion() {
    document.getElementById('promotionForm').reset();
    document.getElementById('addPromotionForm').style.display = 'block';
}

function hideAddPromotion() {
    document.getElementById('addPromotionForm').style.display = 'none';
}

async function handleAddPromotion(e) {
    e.preventDefault();
    
    const promocao = {
        nome: document.getElementById('promNome').value,
        descricao: document.getElementById('promDescricao').value,
        tipoDesconto: document.getElementById('promTipo').value,
        valorDesconto: parseFloat(document.getElementById('promValor').value),
        diaSemana: parseInt(document.getElementById('promDia').value),
        categoriaAplicavel: document.getElementById('promCategoria').value,
        ativa: true
    };
    
    try {
        await apiRequest('/promocoes', {
            method: 'POST',
            body: JSON.stringify(promocao)
        });
        showAlert('Promoção adicionada com sucesso!', 'success');
        hideAddPromotion();
        await loadPromocoes();
    } catch (error) {
        console.log('Erro ao salvar promoção');
    }
}

// ============================================
// RELATÓRIOS
// ============================================

async function generateReport() {
    try {
        const allPedidos = await apiRequest('/pedidos');
        
        const produtosMaisVendidos = {};
        allPedidos.forEach(pedido => {
            pedido.itens.forEach(item => {
                if (!produtosMaisVendidos[item.nomeProduto]) {
                    produtosMaisVendidos[item.nomeProduto] = 0;
                }
                produtosMaisVendidos[item.nomeProduto] += item.quantidade;
            });
        });
        
        const sortedProdutos = Object.entries(produtosMaisVendidos)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const totalPedidos = allPedidos.length;
        const pedidosCompletos = allPedidos.filter(p => p.status === 'entregue').length;
        const pedidosPendentes = allPedidos.filter(p => p.status === 'pendente').length;
        const totalVendas = allPedidos.reduce((sum, p) => sum + p.total, 0);
        
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <div style="margin-top: 20px;">
                <h4>Resumo Geral</h4>
                <p>Total de Pedidos: <strong>${totalPedidos}</strong></p>
                <p>Pedidos Entregues: <strong>${pedidosCompletos}</strong></p>
                <p>Pedidos Pendentes: <strong>${pedidosPendentes}</strong></p>
                <p>Total de Vendas: <strong>R$ ${totalVendas.toFixed(2)}</strong></p>
                
                <h4 style="margin-top: 20px;">Top 10 Produtos Mais Vendidos</h4>
                <ol>
                    ${sortedProdutos.map(([nome, qtd]) => `
                        <li>${nome}: ${qtd} unidades vendidas</li>
                    `).join('')}
                </ol>
            </div>
        `;
        
        // Mostrar botões de imprimir e baixar
        document.getElementById('printBtn').style.display = 'inline-block';
        document.getElementById('downloadBtn').style.display = 'inline-block';
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
    }
}

function printReport() {
    const reportContent = document.getElementById('reportContent').innerHTML;
    if (!reportContent) {
        alert('Gere um relatório primeiro!');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório - Pizzaria</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h2 { color: #0f0f0f; border-bottom: 2px solid #0f0f0f; padding-bottom: 10px; }
                h4 { margin-top: 20px; color: #333; }
                p { margin: 8px 0; }
                ol { margin: 15px 0; }
                li { margin: 5px 0; }
                strong { color: #27ae60; }
            </style>
        </head>
        <body>
            <h2>📊 Relatório de Vendas - Pizzaria</h2>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            ${reportContent}
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
            <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                Relatório gerado automaticamente pelo sistema de gerenciamento
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    // Aguardar carregamento e depois imprimir
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

function downloadReport() {
    const reportContent = document.getElementById('reportContent').innerHTML;
    if (!reportContent) {
        alert('Gere um relatório primeiro!');
        return;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório - Pizzaria</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h2 { color: #0f0f0f; border-bottom: 2px solid #0f0f0f; padding-bottom: 10px; }
                h4 { margin-top: 20px; color: #333; }
                p { margin: 8px 0; }
                ol { margin: 15px 0; }
                li { margin: 5px 0; }
                strong { color: #27ae60; }
            </style>
        </head>
        <body>
            <h2>📊 Relatório de Vendas - Pizzaria</h2>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            ${reportContent}
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
            <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                Relatório gerado automaticamente pelo sistema de gerenciamento
            </p>
        </body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_pizzaria_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ============================================
// CARREGAR DADOS INICIAIS
// ============================================

async function carregarDadosDashboard() {
    await updateStats();
    await loadProdutos();
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
