document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de elementos ---
    const newProductBtn = document.getElementById('new-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const productForm = document.getElementById('product-form');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');

    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmeDeleteBtn = document.getElementById('confirm-delete-btn');

    const successModal = document.getElementById('success-modal');
    const successMessageText = document.getElementById('success-message-text');

    let productIdToDelete = null;
    let currentPage = 1;
    const itemsPerPage = 10;
    let editingProductId = null;
    
    const tableBody = document.getElementById('products-table-body');

    // --- Funções ---

    const openNewProductModal = () => {
        productForm.reset();
        modalTitle.textContent = 'Novo Produto';
        saveButton.disabled = false; 
        editingProductId = null;
        saveButton.textContent = 'Salvar';
        productModal.classList.add('show');
    };

    const showSuccessModal = (message) => {
        productModal.classList.remove('show');
        confirmationModal.classList.remove('show');
        successMessageText.textContent = message;
        successModal.classList.add('show');
        setTimeout(() => {
            successModal.classList.remove('show');
            loadProducts();
        }, 2000);
    };

    const closeModal = () => {
        productModal.classList.remove('show');
    };

    const openConfirmationModal = (id) => {
        productIdToDelete = id;
        confirmationModal.classList.add('show');
    };

    const closeConfirmationModal = () => {
        productIdToDelete = null;
        confirmationModal.classList.remove('show');
    };

    const openEditModal = async (id) => {
        productForm.reset();
        modalTitle.textContent = 'Carregando dados...';
        saveButton.disabled = true;

        const apiUrl = `http://127.0.0.1:8000/api/produtos/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do produto.');

            const product = await response.json();

            document.getElementById('product-code').value = product.codproduto || '';
            document.getElementById('product-name').value = product.nome || '';
            document.getElementById('product-category').value = product.categoria || '';
            document.getElementById('product-supplier').value = product.codfornecedor || '';
            document.getElementById('product-brand').value = product.marca || '';
            document.getElementById('product-cost-price').value = product.preco_custo || '';
            document.getElementById('product-sale-price').value = product.preco_venda || '';
            document.getElementById('product-barcode').value = product.codigo_barras || '';
            document.getElementById('product-unit').value = product.unidade || 'UN';
            document.getElementById('product-status').value = product.status || 'ativo';
            document.getElementById('product-description').value = product.descricao || '';

            editingProductId = id;
            modalTitle.textContent = 'Editar Produto';
            saveButton.disabled = false;
            productModal.classList.add('show');

        } catch (error) {
            console.error('Erro ao abrir o modal de edição: ', error);
            alert(error.message);
        }
    };

    const deleteProduct = async () => {
        if (!productIdToDelete) return;

        confirmeDeleteBtn.disabled = true;
        confirmeDeleteBtn.textContent = 'Excluindo...';

        const apiUrl = `http://127.0.0.1:8000/api/produtos/${productIdToDelete}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir produto.');
            }

            showSuccessModal('Produto excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            confirmeDeleteBtn.disabled = false;
            confirmeDeleteBtn.textContent = 'Excluir';
        }
    };

    const loadProducts = async () => {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Carregando...</td></tr>';

        const apiUrl = `http://127.0.0.1:8000/api/produtos?page=${currentPage}&perPage=${itemsPerPage}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`Falha ao carregar produtos: ${response.statusText}`);
            }

            const result = await response.json();
            const products = result.data;
            const totalItems = result.total;

            tableBody.innerHTML = '';

            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum produto cadastrado.</td></tr>';
                renderPagination(totalItems); 
                return;
            }

            products.forEach(product => {
                const tr = document.createElement('tr');
                const margin = product.preco_venda && product.preco_custo 
                    ? (((product.preco_venda - product.preco_custo) / product.preco_custo) * 100).toFixed(2) 
                    : '0.00';

                tr.innerHTML = `
                    <td class="checkbox-column">
                        <input type="checkbox" data-id="${product.codproduto}" />
                    </td>
                    <td>${product.codproduto}</td>
                    <td>${product.nome}</td>
                    <td>${product.categoria || '-'}</td>
                    <td>${product.fornecedor_nome || '-'}</td>
                    <td>R$ ${parseFloat(product.preco_custo || 0).toFixed(2)}</td>
                    <td>R$ ${parseFloat(product.preco_venda || 0).toFixed(2)}</td>
                    <td>${margin}%</td>
                    <td><span class="status-badge ${product.status}">${product.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${product.codproduto}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${product.codproduto}" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            renderPagination(totalItems);

        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red;">${error.message}</td></tr>`;
        }
    };

    const renderPagination = (totalItems) => {
        const paginationContainer = document.getElementById('pagination-controls');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.textContent = '« Anterior';
        prevButton.className = 'btn btn-secondary';
        prevButton.disabled = (currentPage === 1);
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadProducts();
            }
        });
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        pageInfo.style.margin = '0 10px';
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próximo »';
        nextButton.className = 'btn btn-secondary';
        nextButton.disabled = (currentPage === totalPages);
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadProducts();
            }
        });
        paginationContainer.appendChild(nextButton);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        
        const originalButtonText = editingProductId ? 'Atualizar' : 'Salvar';
        saveButton.textContent = editingProductId ? 'Atualizando...' : 'Salvando...';

        const formData = new FormData(productForm);
        const productData = Object.fromEntries(formData.entries());

        let apiUrl = 'http://127.0.0.1:8000/api/produtos';
        let httpMethod = 'POST';

        if (editingProductId) {
            apiUrl = `http://127.0.0.1:8000/api/produtos/${editingProductId}`;
            httpMethod = 'PUT';
        }

        try {
            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMessage = result.message || 'Ocorreu um erro desconhecido.';
                if(result.errors) {
                    errorMessage = 'Por favor, corrija os erros:\n'; 
                    for (const field in result.errors) {
                        errorMessage += `- ${result.errors[field].join(', ')}\n`;
                    }
                }
                throw new Error(errorMessage);
            }

            const successMessage = editingProductId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
            showSuccessModal(successMessage);
            closeModal();

        } catch (error) {
            console.error('Falha ao salvar produto: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText; 
            if (httpMethod === 'PUT') {
                editingProductId = null;
            }
        }
    };

    tableBody.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            openConfirmationModal(id);
        }

        const editButton = event.target.closest('.btn-edit');
        if (editButton) {
            const id = editButton.dataset.id;
            openEditModal(id);
        }
    });

    // --- Event Listeners ---
    newProductBtn.addEventListener('click', openNewProductModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    productForm.addEventListener('submit', handleFormSubmit);
    productModal.addEventListener('click', (event) => {
        if (event.target === productModal) closeModal();
    });
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmeDeleteBtn.addEventListener('click', deleteProduct);
    confirmationModal.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);

    loadProducts();
});
