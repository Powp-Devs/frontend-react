// ============================================
// MÓDULO DE VENDAS - INTEGRAÇÃO COM API
// ============================================

const VENDA_API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000/api',
    endpoints: {
        clientes: '/clientes',
        produtos: '/produtos',
        vendedores: '/funcionarios',
        transportadoras: '/transportadoras',
        vendas: '/vendas',
        formasPagamento: '/formas-pagamento',
        condicoesP agamento: '/condicoes-pagamento'
    }
};

// ============================================
// HELPER PARA REQUESTS AUTENTICADOS
// ============================================

async function vendaApiRequest(endpoint, options = {}) {
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
        const response = await fetch(`${VENDA_API_CONFIG.baseURL}${endpoint}`, mergedOptions);
        
        if (response.status === 401) {
            console.warn('Sessão expirada');
            throw new Error('Não autenticado');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na API (${endpoint}):`, error);
        throw error;
    }
}

// ============================================
// FUNÇÕES DE BUSCA - CLIENTES
// ============================================

/**
 * Busca cliente por código
 */
async function buscarClientePorCodigo(codigo) {
    try {
        const result = await vendaApiRequest(`${VENDA_API_CONFIG.endpoints.clientes}/${codigo}`);
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return null;
    }
}

/**
 * Busca cliente por CPF/CNPJ
 */
async function buscarClientePorDocumento(documento) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.clientes}?documento=${documento}`
        );
        return result.data?.[0] || result[0] || null;
    } catch (error) {
        console.error('Erro ao buscar cliente por documento:', error);
        return null;
    }
}

/**
 * Busca clientes (autocomplete)
 */
async function buscarClientes(termo = '', limit = 10) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.clientes}?search=${termo}&limit=${limit}`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
    }
}

// ============================================
// FUNÇÕES DE BUSCA - PRODUTOS
// ============================================

/**
 * Busca produto por código
 */
async function buscarProdutoPorCodigo(codigo) {
    try {
        const result = await vendaApiRequest(`${VENDA_API_CONFIG.endpoints.produtos}/${codigo}`);
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
    }
}

/**
 * Busca produtos (autocomplete)
 */
async function buscarProdutos(termo = '', limit = 20) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.produtos}?search=${termo}&limit=${limit}`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
}

/**
 * Verifica estoque do produto
 */
async function verificarEstoque(produtoId, quantidade) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.produtos}/${produtoId}/estoque`
        );
        const estoque = result.data?.estoque || result.estoque || 0;
        return {
            disponivel: estoque >= quantidade,
            estoque: estoque,
            faltam: quantidade > estoque ? quantidade - estoque : 0
        };
    } catch (error) {
        console.error('Erro ao verificar estoque:', error);
        return { disponivel: false, estoque: 0, faltam: quantidade };
    }
}

// ============================================
// FUNÇÕES DE BUSCA - VENDEDORES
// ============================================

/**
 * Busca vendedores ativos
 */
async function buscarVendedores() {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.vendedores}?cargo=vendedor&ativo=true`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
        return [];
    }
}

// ============================================
// FUNÇÕES DE BUSCA - TRANSPORTADORAS
// ============================================

/**
 * Busca transportadoras ativas
 */
async function buscarTransportadoras() {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.transportadoras}?ativo=true`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar transportadoras:', error);
        return [];
    }
}

/**
 * Calcula frete
 */
async function calcularFrete(cep, peso, valor) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.transportadoras}/calcular-frete`,
            {
                method: 'POST',
                body: JSON.stringify({ cep, peso, valor })
            }
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        return { valor: 0, prazo: 0 };
    }
}

// ============================================
// FUNÇÕES DE BUSCA - FORMAS DE PAGAMENTO
// ============================================

/**
 * Busca formas de pagamento
 */
async function buscarFormasPagamento() {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.formasPagamento}?ativo=true`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar formas de pagamento:', error);
        return [];
    }
}

/**
 * Busca condições de pagamento
 */
async function buscarCondicoesPagamento() {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.condicoesPagamento}?ativo=true`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar condições de pagamento:', error);
        return [];
    }
}

// ============================================
// FUNÇÕES DE VENDA
// ============================================

/**
 * Gera número do próximo pedido
 */
async function gerarNumeroPedido() {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.vendas}/proximo-numero`
        );
        return result.data?.numero || result.numero || Math.floor(100000 + Math.random() * 900000);
    } catch (error) {
        console.error('Erro ao gerar número do pedido:', error);
        return Math.floor(100000 + Math.random() * 900000);
    }
}

/**
 * Salva pedido de venda
 */
async function salvarPedidoVenda(pedido) {
    try {
        const result = await vendaApiRequest(
            VENDA_API_CONFIG.endpoints.vendas,
            {
                method: 'POST',
                body: JSON.stringify(pedido)
            }
        );
        return {
            success: true,
            data: result.data || result,
            message: 'Pedido salvo com sucesso!'
        };
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        return {
            success: false,
            error: error.message,
            message: 'Erro ao salvar pedido'
        };
    }
}

/**
 * Atualiza pedido de venda
 */
async function atualizarPedidoVenda(id, pedido) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.vendas}/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(pedido)
            }
        );
        return {
            success: true,
            data: result.data || result,
            message: 'Pedido atualizado com sucesso!'
        };
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        return {
            success: false,
            error: error.message,
            message: 'Erro ao atualizar pedido'
        };
    }
}

/**
 * Busca pedido por ID
 */
async function buscarPedidoPorId(id) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.vendas}/${id}`
        );
        return result.data || result;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return null;
    }
}

/**
 * Cancela pedido
 */
async function cancelarPedido(id, motivo) {
    try {
        const result = await vendaApiRequest(
            `${VENDA_API_CONFIG.endpoints.vendas}/${id}/cancelar`,
            {
                method: 'POST',
                body: JSON.stringify({ motivo })
            }
        );
        return {
            success: true,
            message: 'Pedido cancelado com sucesso!'
        };
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        return {
            success: false,
            error: error.message,
            message: 'Erro ao cancelar pedido'
        };
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Formata dados do pedido para envio à API
 */
function formatarPedidoParaAPI(pedido) {
    return {
        numero_pedido: pedido.number,
        data_venda: pedido.date,
        cliente_id: pedido.customer.code,
        vendedor_id: pedido.seller,
        transportadora_id: pedido.carrier,
        tipo_frete: pedido.freight,
        valor_frete: parseFloat(pedido.freightValue) || 0,
        valor_seguro: parseFloat(pedido.insuranceValue) || 0,
        observacoes: pedido.observations,
        forma_pagamento_id: pedido.payment.method,
        condicao_pagamento_id: pedido.payment.term,
        itens: pedido.items.map(item => ({
            produto_id: item.product.id,
            quantidade: parseFloat(item.quantity),
            valor_unitario: parseFloat(item.unitPrice),
            percentual_desconto: parseFloat(item.discountPercent),
            valor_desconto: parseFloat(item.discountValue),
            valor_total: parseFloat(item.total)
        })),
        parcelas: pedido.payment.installments.map(parcela => ({
            numero: parcela.number,
            data_vencimento: parcela.date,
            valor: parseFloat(parcela.value)
        })),
        totais: {
            subtotal: parseFloat(pedido.totals.subtotal),
            desconto: parseFloat(pedido.totals.discount),
            frete_seguro: parseFloat(pedido.totals.freightInsurance),
            total: parseFloat(pedido.totals.total)
        }
    };
}

/**
 * Valida dados do pedido antes de enviar
 */
function validarPedido(pedido) {
    const erros = [];

    if (!pedido.customer.code) {
        erros.push('Cliente não selecionado');
    }

    if (!pedido.seller) {
        erros.push('Vendedor não selecionado');
    }

    if (!pedido.items || pedido.items.length === 0) {
        erros.push('Adicione pelo menos um item ao pedido');
    }

    if (!pedido.payment.method) {
        erros.push('Forma de pagamento não selecionada');
    }

    if (!pedido.payment.term) {
        erros.push('Condição de pagamento não selecionada');
    }

    // Validar estoque dos itens
    pedido.items.forEach((item, index) => {
        if (item.quantity <= 0) {
            erros.push(`Item ${index + 1}: Quantidade inválida`);
        }
        if (item.unitPrice <= 0) {
            erros.push(`Item ${index + 1}: Preço inválido`);
        }
    });

    return {
        valido: erros.length === 0,
        erros
    };
}

// ============================================
// CACHE LOCAL (OPCIONAL)
// ============================================

const vendaCache = {
    clientes: [],
    produtos: [],
    vendedores: [],
    transportadoras: [],
    formasPagamento: [],
    condicoesPagamento: [],
    
    set(key, data) {
        this[key] = data;
        localStorage.setItem(`venda_cache_${key}`, JSON.stringify(data));
    },
    
    get(key) {
        if (this[key].length > 0) return this[key];
        
        const cached = localStorage.getItem(`venda_cache_${key}`);
        if (cached) {
            this[key] = JSON.parse(cached);
            return this[key];
        }
        
        return [];
    },
    
    clear() {
        Object.keys(this).forEach(key => {
            if (Array.isArray(this[key])) {
                this[key] = [];
                localStorage.removeItem(`venda_cache_${key}`);
            }
        });
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Carrega dados iniciais necessários
 */
async function inicializarDadosVenda() {
    try {
        console.log('🔄 Carregando dados iniciais...');
        
        const [vendedores, transportadoras, formasPagamento, condicoesPagamento] = await Promise.all([
            buscarVendedores(),
            buscarTransportadoras(),
            buscarFormasPagamento(),
            buscarCondicoesPagamento()
        ]);
        
        vendaCache.set('vendedores', vendedores);
        vendaCache.set('transportadoras', transportadoras);
        vendaCache.set('formasPagamento', formasPagamento);
        vendaCache.set('condicoesPagamento', condicoesPagamento);
        
        console.log('✅ Dados iniciais carregados');
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        return false;
    }
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Clientes
        buscarClientePorCodigo,
        buscarClientePorDocumento,
        buscarClientes,
        
        // Produtos
        buscarProdutoPorCodigo,
        buscarProdutos,
        verificarEstoque,
        
        // Vendedores
        buscarVendedores,
        
        // Transportadoras
        buscarTransportadoras,
        calcularFrete,
        
        // Pagamento
        buscarFormasPagamento,
        buscarCondicoesPagamento,
        
        // Vendas
        gerarNumeroPedido,
        salvarPedidoVenda,
        atualizarPedidoVenda,
        buscarPedidoPorId,
        cancelarPedido,
        
        // Auxiliares
        formatarPedidoParaAPI,
        validarPedido,
        inicializarDadosVenda,
        
        // Cache
        vendaCache
    };
}
