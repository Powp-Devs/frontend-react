// Sidebar Submenu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Função para navegação
    function navigateTo(url) {
        window.location.href = url;
    }

    // Adicionar funcionalidade de navegação aos links do menu
    document.querySelectorAll('.menu-item a, .submenu-item').forEach(link => {
        if (link.href && !link.href.includes('#')) {
            link.addEventListener('click', function(e) {
                // Permitir navegação normal
                return true;
            });
        }
    });

    // Destacar item ativo baseado na URL atual
    function highlightActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Remover classes ativas existentes
        document.querySelectorAll('.menu-item, .submenu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Destacar item ativo no submenu
        document.querySelectorAll('.submenu-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === currentPage) {
                item.classList.add('active');
                // Também destacar o item pai (Cadastro)
                const parentDropdown = item.closest('.dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('active');
                }
            }
        });

        // Destacar itens do menu principal
        document.querySelectorAll('.menu-item a').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === currentPage) {
                item.parentElement.classList.add('active');
            }
        });
    }

    // Executar ao carregar a página
    highlightActiveMenuItem();

    // Funcionalidade para mostrar/esconder submenu no hover
    const sidebar = document.querySelector('.sidebar');
    const dropdownItems = document.querySelectorAll('.menu-item.dropdown');

    dropdownItems.forEach(dropdown => {
        const submenu = dropdown.querySelector('.submenu');
        
        if (submenu) {
            dropdown.addEventListener('mouseenter', function() {
                if (sidebar.matches(':hover')) {
                    submenu.style.display = 'block';
                }
            });

            dropdown.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    if (!submenu.matches(':hover')) {
                        submenu.style.display = 'none';
                    }
                }, 100);
            });

            submenu.addEventListener('mouseleave', function() {
                submenu.style.display = 'none';
            });
        }
    });

    // Controlar visibilidade do submenu baseado no hover da sidebar
    sidebar.addEventListener('mouseenter', function() {
        dropdownItems.forEach(dropdown => {
            const submenu = dropdown.querySelector('.submenu');
            if (submenu && dropdown.matches(':hover')) {
                submenu.style.display = 'block';
            }
        });
    });

    sidebar.addEventListener('mouseleave', function() {
        dropdownItems.forEach(dropdown => {
            const submenu = dropdown.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'none';
            }
        });
    });
});