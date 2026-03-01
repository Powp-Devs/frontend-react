// JavaScript para funcionalidade da sidebar
class SidebarManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupDropdowns();
    this.setupNavigation();
    this.setActiveItem();
  }

  setupDropdowns() {
    const dropdownItems = document.querySelectorAll('.sidebar-item.dropdown');
    
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle dropdown
        item.classList.toggle('open');
        
        // Close other dropdowns
        dropdownItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
          }
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      dropdownItems.forEach(item => {
        item.classList.remove('open');
      });
    });
  }

  setupNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-section]');
    
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        // Remove active class from all items
        sidebarItems.forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Store active section in localStorage
        localStorage.setItem('activeSidebarSection', section);
      });
    });
  }

  setActiveItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const activeSection = localStorage.getItem('activeSidebarSection');
    
    // Map pages to sections
    const pageToSection = {
      'dashboard.html': 'dashboard',
      'dashboardFinanceiro.html': 'financeiro',
      'cadastroCliente.html': 'cadastro',
      'cadastroProduto.html': 'cadastro',
      'cadastroFornecedor.html': 'cadastro',
      'cadastroFuncionario.html': 'cadastro',
      'controleEstoque.html': 'estoque',
      'pedidoVenda.html': 'vendas',
      'relatorios.html': 'relatorios',
      'chatBot.html': 'chat'
    };

    const section = pageToSection[currentPage] || activeSection || 'dashboard';
    
    // Set active item
    const activeItem = document.querySelector(`[data-section="${section}"]`);
    if (activeItem) {
      document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
      });
      activeItem.classList.add('active');
    }
  }
}

// Navigation function
function navigateTo(page) {
  window.location.href = page;
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SidebarManager();
});

// Export for use in other files
window.SidebarManager = SidebarManager;