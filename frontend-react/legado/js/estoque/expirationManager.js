// Gerenciador de Produtos Próximos ao Vencimento

class ExpirationManager {
    constructor() {
        this.expirationThreshold = 30; // dias
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.checkExpirations();
    }

    attachEventListeners() {
        // Card de vencimento
        const cardVencimento = document.getElementById('card-vencimento');
        if (cardVencimento) {
            cardVencimento.addEventListener('click', () => {
                this.showExpirationProducts();
            });
        }

        // Link no alerta
        const showLink = document.getElementById('show-expiration-products');
        if (showLink) {
            showLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showExpirationProducts();
            });
        }
    }

    checkExpirations() {
        // Simular produtos com vencimento próximo
        // Em produção, isso viria da API
        const products = this.getMockProducts();
        const expiringProducts = this.getExpiringProducts(products);

        this.updateExpirationCard(expiringProducts.length);
        this.updateExpirationAlert(expiringProducts.length);

        // Armazenar para uso posterior
        this.expiringProducts = expiringProducts;
    }

    getMockProducts() {
        // Dados de exemplo - em produção viriam da API
        const today = new Date();
        return [
            {
                id: 1,
                codigo: 'PROD001',
                nome: 'Leite Integral 1L',
                categoria: 'Alimentos',
                fornecedor: 'Laticínios ABC',
                quantidade: 50,
                quantidadeMinima: 20,
                validade: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 dias
                lote: 'L20241125',
                precoCusto: 3.50,
                precoVenda: 5.90
            },
            {
                id: 2,
                codigo: 'PROD002',
                nome: 'Iogurte Natural 500g',
                categoria: 'Alimentos',
                fornecedor: 'Laticínios ABC',
                quantidade: 30,
                quantidadeMinima: 15,
                validade: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 dias
                lote: 'L20241120',
                precoCusto: 4.20,
                precoVenda: 7.50
            },
            {
                id: 3,
                codigo: 'PROD003',
                nome: 'Pão de Forma Integral',
                categoria: 'Alimentos',
                fornecedor: 'Padaria XYZ',
                quantidade: 25,
                quantidadeMinima: 10,
                validade: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias
                lote: 'L20241126',
                precoCusto: 5.00,
                precoVenda: 8.90
            },
            {
                id: 4,
                codigo: 'PROD004',
                nome: 'Medicamento Paracetamol 500mg',
                categoria: 'Medicamentos',
                fornecedor: 'Farmacêutica DEF',
                quantidade: 100,
                quantidadeMinima: 50,
                validade: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 dias
                lote: 'M20241101',
                precoCusto: 8.50,
                precoVenda: 15.90
            },
            {
                id: 5,
                codigo: 'PROD005',
                nome: 'Vitamina C 1000mg',
                categoria: 'Suplementos',
                fornecedor: 'Farmacêutica DEF',
                quantidade: 45,
                quantidadeMinima: 20,
                validade: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 dias
                lote: 'V20241110',
                precoCusto: 12.00,
                precoVenda: 22.90
            }
        ];
    }

    getExpiringProducts(products) {
        const today = new Date();
        const thresholdDate = new Date(today.getTime() + this.expirationThreshold * 24 * 60 * 60 * 1000);

        return products.filter(product => {
            if (!product.validade) return false;
            return product.validade <= thresholdDate;
        }).sort((a, b) => a.validade - b.validade); // Ordenar por data mais próxima
    }

    updateExpirationCard(count) {
        const element = document.getElementById('proximo-vencimento');
        if (element) {
            element.textContent = count;
        }
    }

    updateExpirationAlert(count) {
        const alert = document.getElementById('expiration-alert');
        const countElement = document.getElementById('expiration-count');
        
        if (count > 0) {
            if (alert) alert.style.display = 'block';
            if (countElement) countElement.textContent = count;
        } else {
            if (alert) alert.style.display = 'none';
        }
    }

    showExpirationProducts() {
        // Filtrar tabela para mostrar apenas produtos próximos ao vencimento
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            filterStatus.value = 'vencimento';
            // Disparar evento de mudança para atualizar a tabela
            filterStatus.dispatchEvent(new Event('change'));
        }

        // Scroll suave até a tabela
        const table = document.getElementById('products-table');
        if (table) {
            table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    getDaysUntilExpiration(expirationDate) {
        const today = new Date();
        const expiration = new Date(expirationDate);
        const diffTime = expiration - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    getExpirationStatus(expirationDate) {
        const days = this.getDaysUntilExpiration(expirationDate);
        
        if (days < 0) {
            return { status: 'vencido', label: 'Vencido', class: 'expired' };
        } else if (days <= 3) {
            return { status: 'critico', label: `${days} dia(s)`, class: 'critical' };
        } else if (days <= 7) {
            return { status: 'urgente', label: `${days} dias`, class: 'urgent' };
        } else if (days <= 30) {
            return { status: 'atencao', label: `${days} dias`, class: 'warning' };
        } else {
            return { status: 'normal', label: `${days} dias`, class: 'normal' };
        }
    }

    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    // Método para adicionar produtos à tabela com informação de validade
    renderProductRow(product) {
        const expirationInfo = this.getExpirationStatus(product.validade);
        
        return `
            <tr data-product-id="${product.id}">
                <td><input type="checkbox" class="product-checkbox" /></td>
                <td>${product.codigo}</td>
                <td>${product.nome}</td>
                <td>${product.categoria}</td>
                <td>${product.fornecedor}</td>
                <td>${product.quantidade}</td>
                <td>${product.quantidadeMinima}</td>
                <td>
                    <div class="expiration-cell ${expirationInfo.class}">
                        <span class="expiration-date">${this.formatDate(product.validade)}</span>
                        <span class="expiration-badge">${expirationInfo.label}</span>
                    </div>
                </td>
                <td>R$ ${product.precoCusto.toFixed(2)}</td>
                <td>R$ ${product.precoVenda.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="window.expirationManager.editProduct(${product.id})" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.expirationManager.deleteProduct(${product.id})" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStockStatus(product) {
        if (product.quantidade === 0) return 'Zerado';
        if (product.quantidade <= product.quantidadeMinima) return 'Baixo';
        return 'Normal';
    }

    getStockStatusClass(product) {
        if (product.quantidade === 0) return 'badge-danger';
        if (product.quantidade <= product.quantidadeMinima) return 'badge-warning';
        return 'badge-success';
    }

    // Método para carregar produtos na tabela
    loadProductsTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        const products = this.getMockProducts();
        const filterStatus = document.getElementById('filter-status');
        let filteredProducts = products;

        // Aplicar filtro se selecionado
        if (filterStatus && filterStatus.value === 'vencimento') {
            filteredProducts = this.getExpiringProducts(products);
        }

        tbody.innerHTML = filteredProducts.map(product => this.renderProductRow(product)).join('');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const expirationManager = new ExpirationManager();
    
    // Expor globalmente para uso em outros scripts
    window.expirationManager = expirationManager;
    
    // Carregar produtos na tabela
    expirationManager.loadProductsTable();
    
    // Atualizar tabela quando filtro mudar
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            expirationManager.loadProductsTable();
        });
    }
});


    // Método para editar produto
    editProduct(productId) {
        const products = this.getMockProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }

        // Preencher formulário com dados do produto
        document.getElementById('product-code').value = product.codigo;
        document.getElementById('product-name').value = product.nome;
        document.getElementById('product-category').value = product.categoria.toLowerCase();
        document.getElementById('product-quantity').value = product.quantidade;
        document.getElementById('product-min-quantity').value = product.quantidadeMinima;
        document.getElementById('product-cost-price').value = product.precoCusto;
        document.getElementById('product-sale-price').value = product.precoVenda;
        
        // Preencher validade se existir
        if (product.validade) {
            const date = new Date(product.validade);
            const dateStr = date.toISOString().split('T')[0];
            document.getElementById('product-expiration').value = dateStr;
        }
        
        if (product.lote) {
            document.getElementById('product-batch').value = product.lote;
        }

        // Abrir modal
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('modal-title').textContent = 'Editar Produto';
        }

        this.showToast(`Editando produto: ${product.nome}`, 'info');
    }

    // Método para excluir produto
    deleteProduct(productId) {
        const products = this.getMockProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }

        // Confirmar exclusão
        if (confirm(`Deseja realmente excluir o produto "${product.nome}"?`)) {
            // Aqui você faria a chamada para API
            console.log('Excluindo produto:', productId);
            
            this.showToast(`Produto "${product.nome}" excluído com sucesso!`, 'success');
            
            // Remover da tabela
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                row.remove();
            }
            
            // Atualizar contadores
            this.checkExpirations();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
