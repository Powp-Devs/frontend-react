document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const orderNumberInput = document.getElementById('orderNumber');
    const orderDateInput = document.getElementById('orderDate');
    const customerCodeInput = document.getElementById('customerCode');
    const customerNameInput = document.getElementById('customerName');
    const documentInput = document.getElementById('document');
    const sellerSelect = document.getElementById('seller');
    const freightSelect = document.getElementById('freight');
    const carrierSelect = document.getElementById('carrier');
    const freightValueInput = document.getElementById('freightValue');
    const insuranceValueInput = document.getElementById('insuranceValue');
    const observationsInput = document.getElementById('observations');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentTermSelect = document.getElementById('paymentTerm');
    const itemsTableBody = document.getElementById('itemsTableBody');
    const installmentsTableBody = document.getElementById('installmentsTableBody');
    const addItemButton = document.getElementById('addItem');
    const backButton = document.getElementById('backButton');
    const saveButton = document.getElementById('saveButton');
    const toast = document.getElementById('toast');
  
    // Initialize form with current order data
    function initializeForm() {
      orderNumberInput.value = orderManager.currentOrder.number;
      orderDateInput.value = orderManager.currentOrder.date;
      renderItems();
      updateSummary();
    }
  
    // Show toast message
    function showToast(message, type = 'success') {
      toast.className = `toast ${type}`;
      toast.textContent = message;
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }
  
    // Render order items
    function renderItems() {
      itemsTableBody.innerHTML = '';
      
      orderManager.currentOrder.items.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${item.product.name}</td>
          <td>${item.quantity.toFixed(2)}</td>
          <td>R$ ${item.unitPrice.toFixed(2)}</td>
          <td>${item.discountPercent.toFixed(1)}%</td>
          <td>R$ ${item.discountValue.toFixed(2)}</td>
          <td>R$ ${item.total.toFixed(2)}</td>
          <td>
            <button class="btn btn-danger remove-item" data-index="${index}">×</button>
          </td>
        `;
        
        itemsTableBody.appendChild(row);
      });
  
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
          const index = parseInt(button.dataset.index);
          orderManager.removeItem(index);
          renderItems();
          updateSummary();
        });
      });
    }
  
    // Update order summary
    function updateSummary() {
      const { totals } = orderManager.currentOrder;
      
      document.getElementById('subtotal').textContent = 
        `R$ ${totals.subtotal.toFixed(2)}`;
      document.getElementById('discount').textContent = 
        `R$ ${totals.discount.toFixed(2)}`;
      document.getElementById('freightInsurance').textContent = 
        `R$ ${totals.freightInsurance.toFixed(2)}`;
      document.getElementById('total').textContent = 
        `R$ ${totals.total.toFixed(2)}`;
  
      renderInstallments();
    }
  
    // Render payment installments
    function renderInstallments() {
      installmentsTableBody.innerHTML = '';
      
      orderManager.currentOrder.payment.installments.forEach(installment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${installment.number}</td>
          <td>${new Date(installment.date).toLocaleDateString('pt-BR')}</td>
          <td>R$ ${parseFloat(installment.value).toFixed(2)}</td>
        `;
        
        installmentsTableBody.appendChild(row);
      });
    }
  
    // Add new item handler
    function handleAddItem() {
      // In a real application, this would open a product search modal
      // For this example, we'll add a sample product
      const sampleProduct = productManager.getProduct(1);
      orderManager.addItem(sampleProduct, 2);
      renderItems();
      updateSummary();
    }
  
    // Save order handler
    function handleSave() {
      try {
        orderManager.saveOrder();
        showToast('Pedido salvo com sucesso!');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  
    // Set up event listeners
    function setupEventListeners() {
      addItemButton.addEventListener('click', handleAddItem);
      saveButton.addEventListener('click', handleSave);
      backButton.addEventListener('click', () => {
        // In a real application, this would navigate back
        show
  Toast('Voltando para a lista de pedidos...');
      });
  
      // Input change handlers
      customerCodeInput.addEventListener('change', () => {
        orderManager.setCustomer(
          customerCodeInput.value,
          customerNameInput.value,
          documentInput.value
        );
      });
  
      customerNameInput.addEventListener('change', () => {
        orderManager.setCustomer(
          customerCodeInput.value,
          customerNameInput.value,
          documentInput.value
        );
      });
  
      documentInput.addEventListener('change', () => {
        orderManager.setCustomer(
          customerCodeInput.value,
          customerNameInput.value,
          documentInput.value
        );
      });
  
      sellerSelect.addEventListener('change', () => {
        orderManager.setSeller(sellerSelect.value);
      });
  
      freightSelect.addEventListener('change', () => {
        orderManager.setFreight(
          freightSelect.value,
          freightValueInput.value
        );
      });
  
      carrierSelect.addEventListener('change', () => {
        orderManager.setCarrier(carrierSelect.value);
      });
  
      freightValueInput.addEventListener('change', () => {
        orderManager.setFreight(
          freightSelect.value,
          freightValueInput.value
        );
        updateSummary();
      });
  
      insuranceValueInput.addEventListener('change', () => {
        orderManager.setInsurance(insuranceValueInput.value);
        updateSummary();
      });
  
      observationsInput.addEventListener('change', () => {
        orderManager.setObservations(observationsInput.value);
      });
  
      paymentMethodSelect.addEventListener('change', () => {
        orderManager.setPaymentMethod(paymentMethodSelect.value);
        updateSummary();
      });
  
      paymentTermSelect.addEventListener('change', () => {
        orderManager.setPaymentTerm(paymentTermSelect.value);
        updateSummary();
      });
    }
  
    // Initialize the application
    function init() {
      initializeForm();
      setupEventListeners();
    }
  
    init();
  });