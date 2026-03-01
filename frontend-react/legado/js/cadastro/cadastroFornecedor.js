document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de elementos ---
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const supplierForm = document.getElementById('supplier-form');
    const cepInput = document.getElementById('endereco-cep');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');

    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmeDeleteBtn = document.getElementById('confirm-delete-btn');

    const successModal = document.getElementById('success-modal');
    const successMessageText = document.getElementById('success-message-text');

    let supplierIdToDelete = null;

    let currentPage = 1;
    const itemsPerPage = 10;

    let editingSupplierId = null;
    
    // --- CORREÇÃO DE BUG 1: ID Correto do CNPJ ---
    const cnpjInput = document.getElementById('fornecedor-cnpj'); 
    
    // --- NOVO: Seleção do corpo da tabela ---
    const tableBody = document.getElementById('suppliers-table-body');

    // --- Funções ---

    //Limpa o formulário e abre o modal para um novo cadastro
    const openNewSupplierModal = () => {
        supplierForm.reset();
        modalTitle.textContent = 'Novo Fornecedor';
        saveButton.disabled = false; 

        editingSupplierId = null;

        saveButton.textContent = 'Salvar';
        supplierModal.classList.add('show');
    };

    const showSuccessModal = (message) => {
        supplierModal.classList.remove('show');
        confirmationModal.classList.remove('show');

        successMessageText.textContent = message

        successModal.classList.add('show');

        setTimeout(() => {
            successModal.classList.remove('show');
        }, 2000);
    }

    //Fecha o Modal
    const closeModal = () => {
        supplierModal.classList.remove('show');
    };

    //Modal de exclusão
    const openConfirmationModal = (id) => {
        supplierIdToDelete = id;
        confirmationModal.classList.add('show');
    }

    const closeConfirmationModal = () => {
        supplierIdToDelete = null;
        confirmationModal.classList.remove('show');
    }

    //Função de editar um fornecedor
    const openEditModal = async (id) => {
        supplierForm.reset();
        modalTitle.textContent = 'Carregando dados...';
        saveButton.disabled = true;

        const apiUrl = `http://127.0.0.1:8000/api/fornecedores/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do fornecedor.');

            const supplier = await response.json();

            document.getElementById('fornecedor-cnpj').value = supplier.cnpj;
            document.getElementById('fornecedor-nome').value = supplier.fornecedor;
            document.getElementById('fornecedor-fantasia').value = supplier.fantasia;

            if (supplier.pwendereco) {
                document.getElementById('endereco-cep').value = supplier.pwendereco.cep;
                document.getElementById('endereco-logradouro').value = supplier.pwendereco.logradouro;
                document.getElementById('endereco-numero').value = supplier.pwendereco.numero;
                document.getElementById('endereco-bairro').value = supplier.pwendereco.bairro;
                document.getElementById('endereco-cidade').value = supplier.pwendereco.cidade;
                document.getElementById('endereco-estado').value = supplier.pwendereco.estado;
            }

            if (supplier.pwtelefone) {
                document.getElementById('contato-email').value = supplier.email;
                document.getElementById('contato-telefone').value = supplier.pwtelefone.telefone;
                document.getElementById('contato-celular').value = supplier.pwtelefone.celular;
            }

            editingSupplierId = id;
            modalTitle.textContent = 'Editar Fornecedor';
            saveButton.disabled = false;
            supplierModal.classList.add('show');

        } catch (error) {
            console.error('Erro ao abrir o modal de edição: ', error);
            alert(error.message);
        }
    }

    //Função que irá chamar a API para apagar o fornecedor
    const deleteSupplier = async () => {
        if (!supplierIdToDelete) return;

        confirmeDeleteBtn.disabled = true;
        confirmeDeleteBtn.textContent = 'Excluindo...';

        const apiUrl = `http://127.0.0.1:8000/api/fornecedores/${supplierIdToDelete}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir fornecedor.');
            }

            /*alert('Fornecedor excluído com sucesso!');
            closeConfirmationModal();
            loadSuppliers();*/
            showSuccessModal('Fornecedor excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            confirmeDeleteBtn.disabled = false;
            confirmeDeleteBtn.textContent = 'Excluir';
        }
    }

    //Busca o endereço a partir de um CEP usando a API ViaCEP.
    const fetchAddressByCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return; 

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!response.ok) throw new Error('Não foi possivel consultar o CEP.');
            
            const addressData = await response.json();
            if (addressData.erro) {
                alert('CEP não localizado. Por favor, preencha o endereço manualmente.');
                return;
            }

            //Preenche os campos de endereço
            document.getElementById('endereco-logradouro').value = addressData.logradouro;
            document.getElementById('endereco-bairro').value = addressData.bairro;
            document.getElementById('endereco-cidade').value = addressData.localidade;
            document.getElementById('endereco-estado').value = addressData.uf;
            document.getElementById('endereco-numero').focus();

        } catch (error) {
            console.error('Erro ao buscar CEP: ', error);
            alert(error.message);
        }
    };

    // --- CORREÇÃO DE BUG 2: Função 'fetchCnpjData' que estava faltando ---
    const fetchCnpjData = async (cnpj) => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        try {
            // Usa a BrasilAPI que discutimos
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('Falha ao buscar CNPJ.');
            
            const data = await response.json();
            
            // Preenche os campos do formulário com os dados do CNPJ
            document.getElementById('fornecedor-nome').value = data.razao_social;
            document.getElementById('fornecedor-fantasia').value = data.nome_fantasia;
            document.getElementById('endereco-cep').value = data.cep;
            document.getElementById('endereco-logradouro').value = data.logradouro;
            document.getElementById('endereco-numero').value = data.numero;
            document.getElementById('endereco-bairro').value = data.bairro;
            document.getElementById('endereco-cidade').value = data.municipio;
            document.getElementById('endereco-estado').value = data.uf;
            document.getElementById('contato-email').value = data.email;
            document.getElementById('contato-telefone').value = data.ddd_telefone_1;
            document.getElementById('contato-celular').focus();

        } catch (error) {
            console.error('Erro BrasilAPI:', error);
            alert('CNPJ não localizado ou API falhou.');
        }
    };

    // ---
    // --- NOVA FUNÇÃO: Carregar e exibir fornecedores na tabela ---
    // ---
    const loadSuppliers = async () => {
        // 1. Mostra o feedback de "Carregando..."
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando...</td></tr>';

        // 2. Monta a URL com os parâmetros de página
        const apiUrl = `http://127.0.0.1:8000/api/fornecedores?page=${currentPage}&perPage=${itemsPerPage}`;

        try {
            // 3. Faz a chamada GET
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Falha ao carregar fornecedores: ${response.statusText}`);
            }

            // --- CORREÇÃO IMPORTANTE AQUI ---
            // 4. Lê a resposta como um objeto (não um array)
            const result = await response.json();
            const suppliers = result.data;      // O array de fornecedores está em 'result.data'
            const totalItems = result.total;    // O número total está em 'result.total'
            // --- FIM DA CORREÇÃO ---

            // 5. Limpa a tabela
            tableBody.innerHTML = '';

            // 6. Verifica se a lista (suppliers) está vazia
            if (suppliers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum fornecedor cadastrado.</td></tr>';
                // Renderiza a paginação mesmo se vazio (ex: "Página 1 de 0")
                renderPagination(totalItems); 
                return;
            }

            // 7. Itera sobre os fornecedores e cria as linhas
            suppliers.forEach(supplier => {
                const tr = document.createElement('tr');
                const dtFormatada = new Date(supplier.dtcadastro + 'T00:00:00').toLocaleDateString('pt-BR');

                tr.innerHTML = `
                    <td class="checkbox-column">
                        <input type="checkbox" data-id="${supplier.codfornecedor}" />
                    </td>
                    <td>${supplier.codfornecedor}</td>
                    <td>${supplier.fornecedor}</td>
                    <td>${supplier.email}</td>
                    <td>${dtFormatada}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${supplier.codfornecedor}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </td>
                    <td>
                        <button class="btn-icon btn-delete" data-id="${supplier.codfornecedor}" title="Excluir">
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

            // --- CORREÇÃO IMPORTANTE AQUI ---
            // 8. Chama a função para desenhar os botões
            renderPagination(totalItems);
            // --- FIM DA CORREÇÃO ---

        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
        }
    };

    const renderPagination = (totalItems) => {
        const paginationContainer = document.getElementById('pagination-controls');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';

        //botão anterior
        const prevButton = document.createElement('button');
        prevButton.textContent = '« Anterior';
        prevButton.className = 'btn btn-secondary';
        prevButton.disabled = (currentPage === 1);
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadSuppliers();
            }
        });
        paginationContainer.appendChild(prevButton);

        //Mostra a página atual
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        pageInfo.style.margin = '0 10px';
        paginationContainer.appendChild(pageInfo);

        //Botão de próximo
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próximo »';
        nextButton.className = 'btn btn-secondary';
        nextButton.disabled = (currentPage === totalPages);
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadSuppliers();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    //Envia os dados do formulário para a API.
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        
        // 1. Define o 'loading text' correto
        const originalButtonText = editingSupplierId ? 'Atualizar' : 'Salvar';
        saveButton.textContent = editingSupplierId ? 'Atualizando...' : 'Salvando...';

        const formData = new FormData(supplierForm);
        const supplierData = Object.fromEntries(formData.entries());

        let apiUrl = 'http://127.0.0.1:8000/api/fornecedores';
        let httpMethod = 'POST';

        if (editingSupplierId) {
            apiUrl = `http://127.0.0.1:8000/api/fornecedores/${editingSupplierId}`;
            httpMethod = 'PUT';
        }

        try {
            const response = await fetch(apiUrl, {
                method: httpMethod, // <-- Usa o método dinâmico
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(supplierData),
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

            const successMessage = editingSupplierId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!';
            //alert(successMessage);
            showSuccessModal(successMessage);
            
            closeModal();
            loadSuppliers(); 

        } catch (error) {
            console.error('Falha ao salvar fornecedor: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText; 
            if (httpMethod === 'PUT') {
                editingSupplierId = null;
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

    // --- Adicionando Event Listeners ---

    //Abrir o modal
    newSupplierBtn.addEventListener('click', openNewSupplierModal);

    //Fechar o modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Salvar o formulário
    supplierForm.addEventListener('submit', handleFormSubmit);

    // Buscar CEP
    cepInput.addEventListener('blur', (event) => {
        fetchAddressByCep(event.target.value);
    });

    // Buscar CNPJ
    cnpjInput.addEventListener('blur', (event) => {
        fetchCnpjData(event.target.value);
    });

    // Fechar modal ao clicar fora
    supplierModal.addEventListener('click', (event) => {
        if (event.target === supplierModal) {
            closeModal();
        }
    });

    // Confirmação de exclusão
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmeDeleteBtn.addEventListener('click', deleteSupplier);

    confirmationModal.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);

    // --- NOVO: Carrega a lista inicial assim que a página abre ---
    loadSuppliers();

});