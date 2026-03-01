// Sample data for initial suppliers
const initialSuppliers = [
    { id: 11, name: 'Mondelez Brasil LTDA', email: 'pedro@dominio.com', date: '02 feb 2023' },
    { id: 15, name: 'Bic Amazonia LTDA', email: 'joao@dominio.com', date: '02 feb 2023' },
    { id: 104, name: 'Colgate LTDA', email: 'matheus@dominio.com', date: '02 feb 2023' },
    { id: 105, name: 'Microsoft LTDS', email: 'marcos@dominio.com', date: '02 feb 2023' },
    { id: 201, name: 'Unilever LTDA', email: 'victor@dominio.com', date: '02 feb 2023' },
    { id: 210, name: 'Procter & Gamble Brasil LTDA', email: 'rebecca@dominio.com', date: '02 feb 2023' },
    { id: 212, name: 'Coca-cola LTDA', email: 'igor@dominio.com', date: '02 feb 2023' }
  ];
  
  // Utility to format the date as shown in the design
  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    
    // Get day with leading zero if needed
    const day = d.getDate().toString().padStart(2, '0');
    
    // Get month name (abbreviated)
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames[d.getMonth()];
    
    // Get full year
    const year = d.getFullYear();
    
    return `${day} ${month} ${year}`;
  }
  
  class SupplierManager {
    constructor() {
      // Initialize suppliers from localStorage or use the sample data
      this.suppliers = JSON.parse(localStorage.getItem('suppliers')) || initialSuppliers;
      this.selectedSupplier = null;
      this.sortColumn = 'id';
      this.sortDirection = 'asc';
      this.selectedSuppliers = new Set();
      
      // Save initial suppliers to localStorage if it doesn't exist
      if (!localStorage.getItem('suppliers')) {
        localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
      }
    }
  
    // Get all suppliers (optionally filtered and sorted)
    getAllSuppliers(searchTerm = '') {
      let filtered = this.suppliers;
      
      // Filter suppliers if search term is provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(supplier => 
          supplier.id.toString().includes(term) ||
          supplier.name.toLowerCase().includes(term) ||
          supplier.email.toLowerCase().includes(term)
        );
      }
      
      // Sort suppliers
      filtered.sort((a, b) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];
        
        if (typeof aValue === 'string') {
          return this.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        } else {
          return this.sortDirection === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
      });
      
      return filtered;
    }
  
    // Add a new supplier
    addSupplier(name, email) {
      // Generate a new unique ID
      const maxId = Math.max(...this.suppliers.map(s => s.id), 0);
      const newId = maxId + 1;
      
      const newSupplier = {
        id: newId,
        name,
        email,
        date: formatDate(new Date())
      };
      
      this.suppliers.push(newSupplier);
      this._saveSuppliers();
      return newSupplier;
    }
  
    // Update an existing supplier
    updateSupplier(id, name, email) {
      const index = this.suppliers.findIndex(s => s.id === id);
      if (index !== -1) {
        this.suppliers[index] = {
          ...this.suppliers[index],
          name,
          email
        };
        this._saveSuppliers();
        return this.suppliers[index];
      }
      return null;
    }
  
    // Delete a supplier
    deleteSupplier(id) {
      const index = this.suppliers.findIndex(s => s.id === id);
      if (index !== -1) {
        this.suppliers.splice(index, 1);
        this._saveSuppliers();
        return true;
      }
      return false;
    }
  
    // Delete multiple suppliers
    deleteSelectedSuppliers() {
      if (this.selectedSuppliers.size > 0) {
        this.suppliers = this.suppliers.filter(s => !this.selectedSuppliers.has(s.id));
        this._saveSuppliers();
        this.selectedSuppliers.clear();
        return true;
      }
      return false;
    }
  
    // Get a supplier by ID
    getSupplierById(id) {
      return this.suppliers.find(s => s.id === id);
    }
  
    // Toggle selection of a supplier
    toggleSupplierSelection(id) {
      if (this.selectedSuppliers.has(id)) {
        this.selectedSuppliers.delete(id);
      } else {
        this.selectedSuppliers.add(id);
      }
      return this.selectedSuppliers.has(id);
    }
  
    // Toggle selection of all suppliers
    toggleSelectAll(suppliers) {
      if (this.selectedSuppliers.size === suppliers.length) {
        // Deselect all
        this.selectedSuppliers.clear();
      } else {
        // Select all
        this.selectedSuppliers = new Set(suppliers.map(s => s.id));
      }
      return this.selectedSuppliers.size === suppliers.length;
    }
  
    // Check if a supplier is selected
    isSupplierSelected(id) {
      return this.selectedSuppliers.has(id);
    }
  
    // Export suppliers to CSV
    exportToCSV() {
      // Define columns
      const columns = ['Cod. Fornec', 'Fornecedor', 'E-MAIL', 'Data de cadastro'];
      
      // Create CSV header row
      let csvContent = columns.join(',') + '\n';
      
      // Add data rows
      this.suppliers.forEach(supplier => {
        const row = [
          supplier.id,
          `"${supplier.name.replace(/"/g, '""')}"`, // Escape quotes in name
          supplier.email,
          supplier.date
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fornecedores_${formatDate(new Date()).replace(/\s/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // Private method to save suppliers to localStorage
    _saveSuppliers() {
      localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
    }
  }
  
  // Create and export a supplier manager instance
  const supplierManager = new SupplierManager();