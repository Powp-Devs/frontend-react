// Arquivo principal da aplicação - Powp ERP
// Este arquivo contém funcionalidades comuns a todas as páginas

// Configurações globais
const APP_CONFIG = {
    API_URL: 'http://127.0.0.1:8000/api',
    APP_NAME: 'Powp ERP',
    VERSION: '1.0.0'
};

// Classe principal da aplicação
class PowpApp {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupSidebar();
        this.setupGlobalEventListeners();
        this.highlightActiveMenuItem();
        console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} inicializado`);
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Funcionalidade de hover para mostrar/esconder submenu
        const dropdownItems = document.querySelectorAll('.menu-item.dropdown');
        
        dropdownItems.forEach(dropdown => {
            const submenu = dropdown.querySelector('.submenu');
            
            if (submenu) {
                dropdown.addEventListener('mouseenter', () => {
                    if (sidebar.matches(':hover')) {
                        submenu.style.display = 'block';
                    }
                });

                dropdown.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        if (!submenu.matches(':hover')) {
                            submenu.style.display = 'none';
                        }
                    }, 100);
                });

                submenu.addEventListener('mouseleave', () => {
                    submenu.style.display = 'none';
                });
            }
        });

        // Controlar visibilidade do submenu baseado no hover da sidebar
        sidebar.addEventListener('mouseenter', () => {
            dropdownItems.forEach(dropdown => {
                const submenu = dropdown.querySelector('.submenu');
                if (submenu && dropdown.matches(':hover')) {
                    submenu.style.display = 'block';
                }
            });
        });

        sidebar.addEventListener('mouseleave', () => {
            dropdownItems.forEach(dropdown => {
                const submenu = dropdown.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = 'none';
                }
            });
        });
    }

    setupGlobalEventListeners() {
        // Listener para navegação
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && !link.href.includes('#') && !link.target) {
                // Permitir navegação normal para links internos
                return true;
            }
        });

        // Listener para modais
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            }

            // Fechar modal clicando fora
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Listener para toasts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    highlightActiveMenuItem() {
        const currentPage = this.currentPage;
        
        // Remover classes ativas existentes
        document.querySelectorAll('.menu-item, .submenu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Destacar item ativo no submenu
        document.querySelectorAll('.submenu-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === currentPage) {
                item.classList.add('active');
                // Também destacar o item pai (dropdown)
                const parentDropdown = item.closest('.dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('active');
                }
            }
        });

        // Destacar itens do menu principal
        document.querySelectorAll('.menu-item a, .menu-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === currentPage) {
                if (item.tagName === 'A') {
                    item.parentElement.classList.add('active');
                } else {
                    item.classList.add('active');
                }
            }
        });

        // Casos especiais para páginas específicas
        this.handleSpecialPages(currentPage);
    }

    handleSpecialPages(currentPage) {
        // Destacar menu de cadastro para páginas de cadastro
        const cadastroPages = ['cadastroCliente.html', 'cadastroProduto.html', 'cadastroFornecedor.html', 'cadastroFuncionario.html'];
        if (cadastroPages.includes(currentPage)) {
            const cadastroDropdown = document.querySelector('.menu-item.dropdown');
            if (cadastroDropdown && cadastroDropdown.querySelector('.submenu')) {
                cadastroDropdown.classList.add('active');
            }
        }

        // Destacar menu de relatórios
        if (currentPage === 'relatorios.html') {
            const relatoriosDropdown = document.querySelectorAll('.menu-item.dropdown')[1]; // Segundo dropdown
            if (relatoriosDropdown) {
                relatoriosDropdown.classList.add('active');
            }
        }
    }

    // Utilitários para modais
    openModal(modal, options = {}) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (!modal) return;

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Aplicar opções se fornecidas
        if (options.title) {
            const title = modal.querySelector('.modal-header h2, .modal-title');
            if (title) title.textContent = options.title;
        }
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (!modal) return;

        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Utilitário para toast notifications
    showToast(message, type = 'success', duration = 3000) {
        let toast = document.getElementById('toast');
        
        if (!toast) {
            // Criar toast se não existir
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast hidden';
            toast.innerHTML = '<span id="toast-message"></span>';
            document.body.appendChild(toast);
        }

        const toastMessage = document.getElementById('toast-message');
        
        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }

    // Utilitário para requisições API
    async apiRequest(endpoint, options = {}) {
        const url = `${APP_CONFIG.API_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            this.showToast('Erro na comunicação com o servidor', 'error');
            throw error;
        }
    }

    // Utilitário para formatação de moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Utilitário para formatação de data
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        const config = { ...defaultOptions, ...options };
        
        return new Intl.DateTimeFormat('pt-BR', config).format(new Date(date));
    }

    // Utilitário para validação de formulários
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    }

    // Utilitário para loading states
    setLoading(element, isLoading = true) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (!element) return;

        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.powpApp = new PowpApp();
});

// Exportar para uso global
window.PowpApp = PowpApp;
window.APP_CONFIG = APP_CONFIG;