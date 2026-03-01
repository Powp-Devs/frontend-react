// Controle de Estoque - JavaScript
class EstoqueManager {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('products')) || [];
    this.movements = JSON.parse(localStorage.getItem('movements')) || [];
    this.suppliers = JSON.parse(localStorage.getItem('suppliers')) || [
      { id: 1, name: 'Fornecedor A' },
      { id: 2, name: 'Fornecedor B' },
      { id: 3, name: 'Fornecedor C' }
    ];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSuppliers();
    this.loadProducts();
    this.updateSummaryCards();
    this.generateSampleData();
  }

  generateSampleData() {
    if (this.products.length === 0) {
      const sampleProducts = [
        {
          id: 1,
          code: 'PROD001',
          name: 'Smartphone Samsung Galaxy',
          category: 'eletronicos',
          supplier: 'Fornecedor A',
          quantity: 15,
          minQuantity: 5,
          costPrice: 800.00,
          salePrice: 1200.00,
          description: 'Smartphone Android com 128GB'
        },
        {
          id: 2,
          code: 'PROD002',
          name: 'Camiseta Polo',
          category: 'roupas',
          supplier: 'Fornecedor B',
          quantity: 3,
          minQuantity: 10,
          costPrice: 25.00,
          salePrice: 45.00,
          description: 'Camiseta polo 100% algodão'
        },
        {
          id: 3,
          code: 'PROD003',
          name: 'Mesa de Jantar',
          category: 'casa',
          supplier: 'Fornecedor C',
          quantity: 8,
          minQuantity: 3,
          costPrice: 300.00,
          salePrice: 500.00,
          description: 'Mesa de jantar para 6 pessoas'
        }
      ];
      
      this.products = sampleProducts;
      this.saveProducts();
    }
  }

  setupEventListeners() {
    // Botões principais
    document.getElementById('new-product-btn').addEventListener('click', () => this.openProductModal());
    document.getElementById('movement-btn').addEventListener('click', () => this.openMovementModal());
    document.getElementById('export-btn').addEventListener('click', () => this.exportData());

    // Modais
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal(document.getElementById('product-modal')));
    document.getElementById('cancel-movement-btn').addEventListener('click', () => this.closeModal(document.getElementById('movement-modal')));

    // Formulários
    document.getElementById('product-form').addEventListener('submit', (e) => this.saveProduct(e));
    document.getElementById('movement-form').addEventListener('submit', (e) => this.saveMovement(e));

    // Filtros
    document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
    document.getElementById('search-input').addEventListener('input', (e) => this.searchProducts(e.target.value));

    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', (e) => this.selectAllProducts(e.target.checked));
  }

  loadSuppliers() {
    const supplierSelects = ['product-supplier', 'filter-fornecedor'];
    
    supplierSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      select.innerHTML = selectId === 'filter-fornecedor' ? '<option value="">Todos os fornecedores</option>' : '<option value="">Selecione um fornecedor</option>';
      
      this.suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.name;
        option.textContent = supplier.name;
        select.appendChild(option);
      });
    });

    // Carregar produtos no select de movimentação
    const movementSelect = document.getElementById('movement-product');
    movementSelect.innerHTML = '<option value="">Selecione um produto</option>';
    
    this.products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.code} - ${product.name}`;
      movementSelect.appendChild(option);
    });
  }

  loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    this.products.forEach(product => {
      const row = this.createProductRow(product);
      tbody.appendChild(row);
    });
  }

  createProductRow(product) {
    const row = document.createElement('tr');
    const status = this.getStockStatus(product);
    
    row.innerHTML = `
      <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td>${this.getCategoryName(product.category)}</td>
      <td>${product.supplier}</td>
      <td>${product.quantity}</td>
      <td>${product.minQuantity}</td>
      <td>R$ ${product.costPrice.toFixed(2)}</td>
      <td>R$ ${product.salePrice.toFixed(2)}</td>
      <td><span class="status-badge ${status.class}">${status.text}</span></td>
      <td>
        <button class="btn btn-outline" onclick="estoqueManager.editProduct(${product.id})" style="padding: 4px 8px; margin-right: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn-danger" onclick="estoqueManager.deleteProduct(${product.id})" style="padding: 4px 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    return row;
  }

  getStockStatus(product) {
    if (product.quantity === 0) {
      return { class: 'status-danger', text: 'Zerado' };
    } else if (product.quantity <= product.minQuantity) {
      return { class: 'status-warning', text: 'Baixo' };
    } else {
      return { class: 'status-success', text: 'Normal' };
    }
  }

  getCategoryName(category) {
    const categories = {
      'eletronicos': 'Eletrônicos',
      'roupas': 'Roupas',
      'casa': 'Casa e Jardim',
      'esportes': 'Esportes'
    };
    return categories[category] || category;
  }

  updateSummaryCards() {
    const totalProducts = this.products.length;
    const lowStock = this.products.filter(p => p.quantity <= p.minQuantity).length;
    const totalValue = this.products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const todayMovements = this.movements.filter(m => {
      const today = new Date().toDateString();
      return new Date(m.date).toDateString() === today;
    }).length;

    document.getElementById('total-produtos').textContent = totalProducts;
    document.getElementById('estoque-baixo').textContent = lowStock;
    document.getElementById('valor-total').textContent = `R$ ${totalValue.toFixed(2)}`;
    document.getElementById('movimentacoes-hoje').textContent = todayMovements;
  }

  openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (product) {
      title.textContent = 'Editar Produto';
      this.fillProductForm(product);
    } else {
      title.textContent = 'Novo Produto';
      form.reset();
      document.getElementById('product-code').value = this.generateProductCode();
    }
    
    modal.classList.add('show');
  }

  openMovementModal() {
    const modal = document.getElementById('movement-modal');
    const form = document.getElementById('movement-form');
    
    form.reset();
    this.loadSuppliers(); // Recarregar produtos no select
    modal.classList.add('show');
  }

  closeModal(modal) {
    modal.classList.remove('show');
  }

  generateProductCode() {
    const lastProduct = this.products[this.products.length - 1];
    const lastNumber = lastProduct ? parseInt(lastProduct.code.replace('PROD', '')) : 0;
    return `PROD${String(lastNumber + 1).padStart(3, '0')}`;
  }

  fillProductForm(product) {
    document.getElementById('product-code').value = product.code;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-supplier').value = product.supplier;
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-min-quantity').value = product.minQuantity;
    document.getElementById('product-cost-price').value = product.costPrice;
    document.getElementById('product-sale-price').value = product.salePrice;
    document.getElementById('product-description').value = product.description || '';
  }

  saveProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
      id: Date.now(),
      code: document.getElementById('product-code').value,
      name: document.getElementById('product-name').value,
      category: document.getElementById('product-category').value,
      supplier: document.getElementById('product-supplier').value,
      quantity: parseInt(document.getElementById('product-quantity').value),
      minQuantity: parseInt(document.getElementById('product-min-quantity').value),
      costPrice: parseFloat(document.getElementById('product-cost-price').value),
      salePrice: parseFloat(document.getElementById('product-sale-price').value),
      description: document.getElementById('product-description').value
    };

    // Verificar se é edição ou novo produto
    const existingIndex = this.products.findIndex(p => p.code === productData.code);
    
    if (existingIndex >= 0) {
      productData.id = this.products[existingIndex].id;
      this.products[existingIndex] = productData;
    } else {
      this.products.push(productData);
    }

    this.saveProducts();
    this.loadProducts();
    this.loadSuppliers();
    this.updateSummaryCards();
    this.closeModal(document.getElementById('product-modal'));
    this.showToast('Produto salvo com sucesso!', 'success');
  }

  saveMovement(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('movement-product').value);
    const type = document.getElementById('movement-type').value;
    const quantity = parseInt(document.getElementById('movement-quantity').value);
    const reason = document.getElementById('movement-reason').value;
    
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      this.showToast('Produto não encontrado!', 'error');
      return;
    }

    // Calcular nova quantidade
    let newQuantity = product.quantity;
    if (type === 'entrada') {
      newQuantity += quantity;
    } else if (type === 'saida') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        this.showToast('Quantidade insuficiente em estoque!', 'error');
        return;
      }
    } else if (type === 'ajuste') {
      newQuantity = quantity;
    }

    // Registrar movimentação
    const movement = {
      id: Date.now(),
      productId: productId,
      productName: product.name,
      type: type,
      quantity: quantity,
      previousQuantity: product.quantity,
      newQuantity: newQuantity,
      reason: reason,
      date: new Date().toISOString(),
      user: 'Usuário Atual' // Aqui você pode pegar do sistema de login
    };

    this.movements.push(movement);
    
    // Atualizar quantidade do produto
    product.quantity = newQuantity;
    
    this.saveProducts();
    this.saveMovements();
    this.loadProducts();
    this.updateSummaryCards();
    this.closeModal(document.getElementById('movement-modal'));
    this.showToast('Movimentação registrada com sucesso!', 'success');
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.openProductModal(product);
    }
  }

  deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.saveProducts();
      this.loadProducts();
      this.loadSuppliers();
      this.updateSummaryCards();
      this.showToast('Produto excluído com sucesso!', 'success');
    }
  }

  applyFilters() {
    const category = document.getElementById('filter-categoria').value;
    const status = document.getElementById('filter-status').value;
    const supplier = document.getElementById('filter-fornecedor').value;
    
    let filteredProducts = [...this.products];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (supplier) {
      filteredProducts = filteredProducts.filter(p => p.supplier === supplier);
    }
    
    if (status) {
      filteredProducts = filteredProducts.filter(p => {
        const productStatus = this.getStockStatus(p);
        return (status === 'baixo' && productStatus.class === 'status-warning') ||
               (status === 'zerado' && productStatus.class === 'status-danger') ||
               (status === 'normal' && productStatus.class === 'status-success');
      });
    }
    
    this.displayFilteredProducts(filteredProducts);
  }

  searchProducts(query) {
    if (!query.trim()) {
      this.loadProducts();
      return;
    }
    
    const filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.code.toLowerCase().includes(query.toLowerCase()) ||
      product.supplier.toLowerCase().includes(query.toLowerCase())
    );
    
    this.displayFilteredProducts(filteredProducts);
  }

  displayFilteredProducts(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
      const row = this.createProductRow(product);
      tbody.appendChild(row);
    });
  }

  selectAllProducts(checked) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
    });
  }

  exportData() {
    const data = {
      products: this.products,
      movements: this.movements,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('Dados exportados com sucesso!', 'success');
  }

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  saveMovements() {
    localStorage.setItem('movements', JSON.stringify(this.movements));
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Adicionar estilos para status badges
const style = document.createElement('style');
style.textContent = `
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-warning {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status-danger {
    background-color: #f8d7da;
    color: #721c24;
  }
`;
document.head.appendChild(style);

// Inicializar quando a página carregar
let estoqueManager;
document.addEventListener('DOMContentLoaded', () => {
  estoqueManager = new EstoqueManager();
});