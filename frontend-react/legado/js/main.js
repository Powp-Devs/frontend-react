document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tableBody = document.getElementById('suppliers-table-body');
    const searchInput = document.getElementById('search-input');
    const selectAllCheckbox = document.getElementById('select-all');
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const exportBtn = document.getElementById('export-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const supplierForm = document.getElementById('supplier-form');
    const supplierCodeInput = document.getElementById('supplier-code');
    const supplierNameInput = document.getElementById('supplier-name');
    const supplierEmailInput = document.getElementById('supplier-email');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteConfirmBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // referências para os elementos HTML importantes que o JS vai manipular.
    function closeModal(modal) {
      modal.classList.remove('show');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    
    function openModal(modal, isEdit = false) {
      modal.style.display = 'flex';
      setTimeout(() => { modal.classList.add('show'); }, 10);
      
      if (modal === supplierModal) {
        if (isEdit) {
          modalTitle.textContent = 'Editar Fornecedor';
        } else {
          modalTitle.textContent = 'Novo Fornecedor';
          supplierForm.reset();
          supplierCodeInput.value = 'Automático';
        }
      }
    }
    
    function showToast(message, type = 'success') {
      toast.className = `toast ${type}`;
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }
    
    // atualiza a tabela com os fornecedores!
    function renderSuppliers() {
      const suppliers = supplierManager.getAllSuppliers(searchInput.value);
      tableBody.innerHTML = '';
      
      suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        
        // Checkbox column
        const checkboxCell = document.createElement('td');
        checkboxCell.className = 'checkbox-column';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = supplierManager.isSupplierSelected(supplier.id);
        checkbox.addEventListener('change', () => {
          supplierManager.toggleSupplierSelection(supplier.id);
          renderSuppliers(); // Re-render to update checkbox states
        });
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // ID column
        const idCell = document.createElement('td');
        idCell.textContent = supplier.id;
        row.appendChild(idCell);
        
        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = supplier.name;
        row.appendChild(nameCell);
        
        // Email column
        const emailCell = document.createElement('td');
        emailCell.textContent = supplier.email;
        row.appendChild(emailCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = supplier.date;
        row.appendChild(dateCell);
        
        // Edit column
        const editCell = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        `;
        editBtn.addEventListener('click', () => {
          editSupplier(supplier.id);
        });
        editCell.appendChild(editBtn);
        row.appendChild(editCell);
        
        // Delete column
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        `;
        deleteBtn.addEventListener('click', () => {
          confirmDeleteSupplier(supplier.id);
        });
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);
        
        tableBody.appendChild(row);
      });
      
      // Update select all checkbox state
      selectAllCheckbox.checked = 
        suppliers.length > 0 && supplierManager.selectedSuppliers.size === suppliers.length;
    }
    
    // Handle adding a new supplier
    function addSupplier() {
      openModal(supplierModal, false);
    }
    
    // Handle editing a supplier
    function editSupplier(id) {
      const supplier = supplierManager.getSupplierById(id);
      if (supplier) {
        supplierCodeInput.value = supplier.id;
        supplierNameInput.value = supplier.name;
        supplierEmailInput.value = supplier.email;
        supplierManager.selectedSupplier = id;
        openModal(supplierModal, true);
      }
    }
    
    // Handle confirming supplier deletion
    function confirmDeleteSupplier(id) {
      supplierManager.selectedSupplier = id;
      openModal(confirmationModal);
    }
    
    // Handle deleting a supplier
    function deleteSupplier() {
      const id = supplierManager.selectedSupplier;
      if (id && supplierManager.deleteSupplier(id)) {
        closeModal(confirmationModal);
        renderSuppliers();
        showToast('Fornecedor excluído com sucesso!');
      }
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
      e.preventDefault();
      
      const name = supplierNameInput.value.trim();
      const email = supplierEmailInput.value.trim();
      
      if (!name || !email) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
      }
      
      if (supplierManager.selectedSupplier) {
        // Update existing supplier
        supplierManager.updateSupplier(
          supplierManager.selectedSupplier,
          name,
          email
        );
        showToast('Fornecedor atualizado com sucesso!');
      } else {
        // Add new supplier
        supplierManager.addSupplier(name, email);
        showToast('Fornecedor adicionado com sucesso!');
      }
      
      closeModal(supplierModal);
      renderSuppliers();
    }
    
    // Set up event listeners
    function setupEventListeners() {
      // Search functionality
      searchInput.addEventListener('input', renderSuppliers);
      
      // Table header sorting
      document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.sort;
          
          // Update sort direction
          if (supplierManager.sortColumn === column) {
            supplierManager.sortDirection = 
              supplierManager.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            supplierManager.sortColumn = column;
            supplierManager.sortDirection = 'asc';
          }
          
          // Update UI
          document.querySelectorAll('th.sortable').forEach(el => {
            el.classList.remove('asc', 'desc');
          });
          
          th.classList.add(supplierManager.sortDirection);
          
          renderSuppliers();
        });
      });
      
      // Select all checkbox
      selectAllCheckbox.addEventListener('change', () => {
        const suppliers = supplierManager.getAllSuppliers(searchInput.value);
        supplierManager.toggleSelectAll(suppliers);
        renderSuppliers();
      });
      
      // New supplier button
      newSupplierBtn.addEventListener('click', addSupplier);
      
      // Export button
      exportBtn.addEventListener('click', () => {
        supplierManager.exportToCSV();
        showToast('Dados exportados com sucesso!');
      });
      
      // Form submission
      supplierForm.addEventListener('submit', handleFormSubmit);
      
      // Cancel button
      cancelBtn.addEventListener('click', () => closeModal(supplierModal));
      
      // Delete confirmation
      deleteConfirmBtn.addEventListener('click', deleteSupplier);
      
      // Cancel delete
      cancelDeleteBtn.addEventListener('click', () => closeModal(confirmationModal));
      
      // Close buttons for modals
      document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
          closeModal(btn.closest('.modal'));
        });
      });
      
      // Close modals when clicking outside
      document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modal);
          }
        });
      });
      
      // Sidebar interactions
      document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
          document.querySelectorAll('.sidebar-item').forEach(i => {
            i.classList.remove('active');
          });
          item.classList.add('active');
          
          // Here you would normally navigate to the selected section
          // For demo purposes, we'll just show a toast
          if (item.dataset.section !== 'cadastro') {
            showToast(`Navegando para ${item.querySelector('.sidebar-text').textContent}`);
          }
        });
      });
    }
    
    // Initialize the application
    function init() {
      renderSuppliers();
      setupEventListeners();
    }
    
    init();
  });