class OrderManager {
    constructor() {
      this.currentOrder = {
        id: null, // ID do pedido (para edição)
        number: null, // Será gerado pela API
        date: new Date().toISOString().split('T')[0],
        customer: {
          code: '',
          name: '',
          document: ''
        },
        seller: '',
        freight: 'por_conta',
        carrier: '',
        freightValue: 0,
        insuranceValue: 0,
        items: [],
        observations: '',
        payment: {
          method: '58',
          term: '102',
          installments: []
        },
        totals: {
          subtotal: 0,
          discount: 0,
          freightInsurance: 0,
          total: 0
        }
      };
      
      // Inicializar número do pedido
      this.initializeOrderNumber();
    }
  
    async initializeOrderNumber() {
      try {
        // Tentar buscar da API
        if (typeof gerarNumeroPedido === 'function') {
          this.currentOrder.number = await gerarNumeroPedido();
        } else {
          this.currentOrder.number = this.generateOrderNumber();
        }
      } catch (error) {
        console.warn('Usando número de pedido local');
        this.currentOrder.number = this.generateOrderNumber();
      }
    }
  
    generateOrderNumber() {
      return Math.floor(100000 + Math.random() * 900000);
    }
  
    addItem(product, quantity) {
      const discount = this.calculateDiscount(product.price * quantity);
      
      this.currentOrder.items.push({
        product,
        quantity,
        unitPrice: product.price,
        discountPercent: discount.percent,
        discountValue: discount.value,
        total: (product.price * quantity) - discount.value
      });
  
      this.updateTotals();
      this.updateInstallments();
    }
  
    removeItem(index) {
      this.currentOrder.items.splice(index, 1);
      this.updateTotals();
      this.updateInstallments();
    }
  
    calculateDiscount(value) {
      // Sample discount logic - could be more complex in real application
      const percent = value > 2000 ? 2.3 : 1.4;
      return {
        percent,
        value: (value * percent) / 100
      };
    }
  
    updateTotals() {
      const subtotal = this.currentOrder.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0);
      
      const discount = this.currentOrder.items.reduce((sum, item) => 
        sum + item.discountValue, 0);
      
      const freightInsurance = 
        parseFloat(this.currentOrder.freightValue) + 
        parseFloat(this.currentOrder.insuranceValue);
  
      this.currentOrder.totals = {
        subtotal,
        discount,
        freightInsurance,
        total: subtotal - discount + freightInsurance
      };
    }
  
    updateInstallments() {
      const total = this.currentOrder.totals.total;
      const installments = [];
      
      // Sample installment calculation for "102 - 7/14/21/28 dias"
      if (this.currentOrder.payment.term === '102') {
        const installmentValue = (total / 4).toFixed(2);
        const today = new Date();
        
        [7, 14, 21, 28].forEach((days, index) => {
          const date = new Date(today);
          date.setDate(date.getDate() + days);
          
          installments.push({
            number: index + 1,
            date: date.toISOString().split('T')[0],
            value: installmentValue
          });
        });
      }
      
      this.currentOrder.payment.installments = installments;
    }
  
    setCustomer(code, name, document) {
      this.currentOrder.customer = { code, name, document };
    }
  
    setSeller(seller) {
      this.currentOrder.seller = seller;
    }
  
    setFreight(type, value) {
      this.currentOrder.freight = type;
      this.currentOrder.freightValue = parseFloat(value);
      this.updateTotals();
    }
  
    setCarrier(carrier) {
      this.currentOrder.carrier = carrier;
    }
  
    setInsurance(value) {
      this.currentOrder.insuranceValue = parseFloat(value);
      this.updateTotals();
    }
  
    setPaymentMethod(method) {
      this.currentOrder.payment.method = method;
      this.updateInstallments();
    }
  
    setPaymentTerm(term) {
      this.currentOrder.payment.term = term;
      this.updateInstallments();
    }
  
    setObservations(text) {
      this.currentOrder.observations = text;
    }
  
    validateOrder() {
      const errors = [];
  
      if (!this.currentOrder.customer.code || !this.currentOrder.customer.name) {
        errors.push('Dados do cliente são obrigatórios');
      }
  
      if (!this.currentOrder.seller) {
        errors.push('Selecione um vendedor');
      }
  
      if (this.currentOrder.items.length === 0) {
        errors.push('Adicione pelo menos um item ao pedido');
      }
  
      return errors;
    }
  
    async saveOrder() {
      const errors = this.validateOrder();
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
  
      try {
        // Verificar se as funções da API estão disponíveis
        if (typeof salvarPedidoVenda === 'function') {
          // Formatar pedido para API
          const pedidoFormatado = typeof formatarPedidoParaAPI === 'function' 
            ? formatarPedidoParaAPI(this.currentOrder)
            : this.currentOrder;
          
          // Salvar via API
          const result = this.currentOrder.id
            ? await atualizarPedidoVenda(this.currentOrder.id, pedidoFormatado)
            : await salvarPedidoVenda(pedidoFormatado);
          
          if (result.success) {
            console.log('✅ Pedido salvo na API:', result.data);
            this.currentOrder.id = result.data.id || result.data.codvenda;
            return result;
          } else {
            throw new Error(result.message || 'Erro ao salvar pedido');
          }
        } else {
          // Fallback: salvar localmente
          console.log('⚠️ API não disponível. Salvando localmente:', this.currentOrder);
          this.saveToLocalStorage();
          return {
            success: true,
            message: 'Pedido salvo localmente (API não disponível)'
          };
        }
      } catch (error) {
        console.error('❌ Erro ao salvar pedido:', error);
        // Tentar salvar localmente como backup
        this.saveToLocalStorage();
        throw error;
      }
    }
    
    saveToLocalStorage() {
      try {
        const pedidos = JSON.parse(localStorage.getItem('pedidos_offline') || '[]');
        pedidos.push({
          ...this.currentOrder,
          savedAt: new Date().toISOString(),
          synced: false
        });
        localStorage.setItem('pedidos_offline', JSON.stringify(pedidos));
        console.log('💾 Pedido salvo no localStorage');
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
      }
    }
    
    async loadOrder(id) {
      try {
        if (typeof buscarPedidoPorId === 'function') {
          const pedido = await buscarPedidoPorId(id);
          if (pedido) {
            this.currentOrder = this.mapApiToPedido(pedido);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
        return false;
      }
    }
    
    mapApiToPedido(apiData) {
      return {
        id: apiData.id || apiData.codvenda,
        number: apiData.numero_pedido || apiData.numero,
        date: apiData.data_venda || apiData.data,
        customer: {
          code: apiData.cliente_id || apiData.codcliente,
          name: apiData.cliente?.nome || apiData.nome_cliente,
          document: apiData.cliente?.cpf_cnpj || apiData.documento
        },
        seller: apiData.vendedor_id || apiData.codvendedor,
        freight: apiData.tipo_frete || 'por_conta',
        carrier: apiData.transportadora_id || apiData.codtransportadora,
        freightValue: parseFloat(apiData.valor_frete || 0),
        insuranceValue: parseFloat(apiData.valor_seguro || 0),
        items: (apiData.itens || apiData.items || []).map(item => ({
          product: {
            id: item.produto_id || item.codproduto,
            code: item.produto?.codigo || item.codigo,
            name: item.produto?.nome || item.nome_produto,
            price: parseFloat(item.valor_unitario || item.preco)
          },
          quantity: parseFloat(item.quantidade),
          unitPrice: parseFloat(item.valor_unitario),
          discountPercent: parseFloat(item.percentual_desconto || 0),
          discountValue: parseFloat(item.valor_desconto || 0),
          total: parseFloat(item.valor_total)
        })),
        observations: apiData.observacoes || '',
        payment: {
          method: apiData.forma_pagamento_id || apiData.codformapagamento,
          term: apiData.condicao_pagamento_id || apiData.codcondicao,
          installments: (apiData.parcelas || []).map(parcela => ({
            number: parcela.numero,
            date: parcela.data_vencimento,
            value: parseFloat(parcela.valor)
          }))
        },
        totals: {
          subtotal: parseFloat(apiData.totais?.subtotal || apiData.subtotal || 0),
          discount: parseFloat(apiData.totais?.desconto || apiData.desconto || 0),
          freightInsurance: parseFloat(apiData.totais?.frete_seguro || 0),
          total: parseFloat(apiData.totais?.total || apiData.valor_total || 0)
        }
      };
    }
  }
  
  const orderManager = new OrderManager();