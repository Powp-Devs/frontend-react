// ============================================
// CHATBOT COM INTEGRAÇÃO DE API
// ============================================

const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000/api',
    endpoints: {
        context: '/chatbot/context',
        clientes: '/chatbot/clientes',
        fornecedores: '/chatbot/fornecedores',
        estoque: '/chatbot/estoque',
        vendas: '/chatbot/vendas',
        financeiro: '/chatbot/financeiro'
    }
};

// Helper para fazer requests autenticados
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    const defaultOptions = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, mergedOptions);
        
        if (response.status === 401) {
            console.warn('Sessão expirada ou não autenticado');
            // Opcional: redirecionar para login
            // window.location.href = '/login.html';
            throw new Error('Não autenticado');
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na API (${endpoint}):`, error);
        throw error;
    }
}

// ============================================
// FUNÇÕES DE BUSCA DE DADOS
// ============================================

/**
 * Carrega contexto completo do sistema
 */
async function loadSystemContext() {
    try {
        const result = await apiRequest(API_CONFIG.endpoints.context);
        
        if (result.success) {
            console.log('✅ Contexto carregado do banco de dados');
            return result.data;
        }
        
        throw new Error('Falha ao carregar contexto');
    } catch (error) {
        console.warn('⚠️ Usando dados fictícios (API não disponível)');
        return null;
    }
}

/**
 * Busca dados de clientes
 */
async function buscarClientes(tipo = 'resumo') {
    try {
        const result = await apiRequest(`${API_CONFIG.endpoints.clientes}?tipo=${tipo}`);
        return result.success ? result.data : null;
    } catch (error) {
        return null;
    }
}

/**
 * Busca clientes inadimplentes
 */
async function buscarClientesInadimplentes() {
    return await buscarClientes('inadimplentes');
}

/**
 * Busca dados de estoque
 */
async function buscarEstoque(tipo = 'resumo') {
    try {
        const result = await apiRequest(`${API_CONFIG.endpoints.estoque}?tipo=${tipo}`);
        return result.success ? result.data : null;
    } catch (error) {
        return null;
    }
}

/**
 * Busca produtos com estoque crítico
 */
async function buscarEstoqueCritico() {
    return await buscarEstoque('critico');
}

/**
 * Busca produtos zerados
 */
async function buscarEstoqueZerado() {
    return await buscarEstoque('zerados');
}

/**
 * Busca dados de vendas
 */
async function buscarVendas(periodo = 'mes') {
    try {
        const result = await apiRequest(`${API_CONFIG.endpoints.vendas}?periodo=${periodo}`);
        return result.success ? result.data : null;
    } catch (error) {
        return null;
    }
}

/**
 * Busca vendas da semana
 */
async function buscarVendasSemana() {
    return await buscarVendas('semana');
}

/**
 * Busca vendas do mês
 */
async function buscarVendasMes() {
    return await buscarVendas('mes');
}

/**
 * Busca situação financeira
 */
async function buscarFinanceiro() {
    try {
        const result = await apiRequest(API_CONFIG.endpoints.financeiro);
        return result.success ? result.data : null;
    } catch (error) {
        return null;
    }
}

/**
 * Busca dados de fornecedores
 */
async function buscarFornecedores() {
    try {
        const result = await apiRequest(API_CONFIG.endpoints.fornecedores);
        return result.success ? result.data : null;
    } catch (error) {
        return null;
    }
}

// ============================================
// FORMATADORES DE RESPOSTA
// ============================================

/**
 * Formata resposta de clientes inadimplentes
 */
function formatarInadimplentes(dados) {
    if (!dados || !dados.clientes) return null;
    
    const top5 = dados.clientes.slice(0, 5);
    
    return `💳 **Relatório de Inadimplência (Dados Reais)**

⚠️ Clientes em atraso: ${dados.total}
💰 Valor total em aberto: R$ ${dados.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**Top 5 Maiores Devedores:**
${top5.map((c, i) => 
    `${i + 1}. ${c.nome}
   💰 Deve: R$ ${c.valor_devido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
   📅 Atraso: ${c.dias_atraso} dias`
).join('\n\n')}

**Recomendação:** Entre em contato urgente com os clientes acima de 30 dias de atraso.`;
}

/**
 * Formata resposta de estoque crítico
 */
function formatarEstoqueCritico(dados) {
    if (!dados || !dados.produtos) return null;
    
    return `⚠️ **Produtos com Estoque Crítico (Dados Reais)**

🔴 **Total de produtos em alerta:** ${dados.total}

**Produtos que precisam de reposição urgente:**
${dados.produtos.map((p, i) => 
    `${i + 1}. **${p.nome}** (${p.codigo})
   📦 Estoque atual: ${p.estoque} unidades
   ⚠️ Estoque mínimo: ${p.estoque_minimo} unidades
   🚨 Faltam: ${p.estoque_minimo - p.estoque} unidades`
).join('\n\n')}

**Ação Recomendada:** Fazer pedidos de reposição imediatamente! 🚨`;
}

/**
 * Formata resposta de vendas da semana
 */
function formatarVendasSemana(dados) {
    if (!dados || !dados.por_dia) return null;
    
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return `📈 **Vendas da Última Semana (Dados Reais)**

${dados.por_dia.map(dia => {
    const data = new Date(dia.data);
    const diaSemana = diasSemana[data.getDay()];
    return `• **${diaSemana}** (${dia.data}): R$ ${dia.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}).join('\n')}

**Total da Semana:** R$ ${dados.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
**Média Diária:** R$ ${(dados.total / dados.por_dia.length).toLocaleString('pt-BR', {minimumFractionDigits: 2})}

${dados.por_dia.length > 0 ? `O melhor dia foi ${diasSemana[new Date(dados.por_dia[0].data).getDay()]}! 🎉` : ''}`;
}

/**
 * Formata resposta financeira
 */
function formatarFinanceiro(dados) {
    if (!dados) return null;
    
    const totalDisponivel = dados.caixaTesouraria + dados.contasBancarias;
    
    return `💰 **Situação Financeira (Dados Reais)**

**Disponível Agora:**
🏦 Caixa Tesouraria: R$ ${dados.caixaTesouraria.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
💳 Contas Bancárias: R$ ${dados.contasBancarias.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
**💵 Total Disponível: R$ ${totalDisponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}**

**A Receber:**
📥 Contas a Receber: R$ ${dados.contasReceber.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**A Pagar:**
📤 Contas a Pagar: R$ ${dados.contasPagar.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**Saldo Projetado:** R$ ${dados.saldo_projetado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

${dados.saldo_projetado > 0 ? '✅ Sua situação financeira está saudável!' : '⚠️ Atenção: Saldo projetado negativo!'}`;
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

// Se estiver usando módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiRequest,
        loadSystemContext,
        buscarClientes,
        buscarClientesInadimplentes,
        buscarEstoque,
        buscarEstoqueCritico,
        buscarEstoqueZerado,
        buscarVendas,
        buscarVendasSemana,
        buscarVendasMes,
        buscarFinanceiro,
        buscarFornecedores,
        formatarInadimplentes,
        formatarEstoqueCritico,
        formatarVendasSemana,
        formatarFinanceiro
    };
}
