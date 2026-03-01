document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de elementos ---
    const newClientBtn = document.getElementById('new-supplier-btn');
    const clientModal = document.getElementById('supplier-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const clientForm = document.getElementById('supplier-form');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');

    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmeDeleteBtn = document.getElementById('confirm-delete-btn');

    const successModal = document.getElementById('success-modal');
    const successMessageText = document.getElementById('success-message-text');

    let clientIdToDelete = null;
    let currentPage = 1;
    const itemsPerPage = 10;
    let editingClientId = null;
    
    const tableBody = document.getElementById('suppliers-table-body');
    const cpfCnpjInput = document.getElementById('cliente-cpf-cnpj');
    const cepInput = document.getElementById('endereco-cep');
    const tipoClienteSelect = document.getElementById('cliente-tipo');
    const camposPessoaFisica = document.getElementById('campos-pessoa-fisica');
    const camposPessoaJuridica = document.getElementById('campos-pessoa-juridica');
    const labelCpfCnpj = document.getElementById('label-cpf-cnpj');
    const labelNome = document.getElementById('label-nome');
    const fieldFantasia = document.getElementById('field-fantasia');

    // --- Funções ---
    
    const toggleCamposPorTipo = () => {
        const tipo = tipoClienteSelect.value;
        
        if (tipo === 'fisica') {
            // Mostrar campos de pessoa física
            camposPessoaFisica.style.display = 'block';
            camposPessoaJuridica.style.display = 'none';
            fieldFantasia.style.display = 'none';
            
            // Atualizar labels
            labelCpfCnpj.textContent = 'CPF';
            labelNome.textContent = 'Nome Completo';
            
            // Limpar campos de pessoa jurídica
            document.getElementById('cliente-inscricao').value = '';
            document.getElementById('cliente-dt-abertura').value = '';
            document.getElementById('cliente-fantasia').value = '';
        } else {
            // Mostrar campos de pessoa jurídica
            camposPessoaFisica.style.display = 'none';
            camposPessoaJuridica.style.display = 'block';
            fieldFantasia.style.display = 'block';
            
            // Atualizar labels
            labelCpfCnpj.textContent = 'CNPJ';
            labelNome.textContent = 'Razão Social';
            
            // Limpar campos de pessoa física
            document.getElementById('cliente-rg').value = '';
            document.getElementById('cliente-dt-nascimento').value = '';
        }
    };

    const openNewClientModal = () => {
        clientForm.reset();
        modalTitle.textContent = 'Novo Cliente';
        saveButton.disabled = false; 
        editingClientId = null;
        saveButton.textContent = 'Salvar';
        toggleCamposPorTipo(); // Aplicar visibilidade inicial
        clientModal.classList.add('show');
    };

    const showSuccessModal = (message) => {
        clientModal.classList.remove('show');
        confirmationModal.classList.remove('show');
        successMessageText.textContent = message;
        successModal.classList.add('show');
        setTimeout(() => {
            successModal.classList.remove('show');
            loadClients();
        }, 2000);
    };

    const closeModal = () => {
        clientModal.classList.remove('show');
    };

    const openConfirmationModal = (id) => {
        clientIdToDelete = id;
        confirmationModal.classList.add('show');
    };

    const closeConfirmationModal = () => {
        clientIdToDelete = null;
        confirmationModal.classList.remove('show');
    };

    const openEditModal = async (id) => {
        clientForm.reset();
        modalTitle.textContent = 'Carregando dados...';
        saveButton.disabled = true;

        const apiUrl = `http://127.0.0.1:8000/api/clientes/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do cliente.');

            const client = await response.json();

            // Preencher campos básicos
            document.getElementById('cliente-nome').value = client.cliente || '';
            document.getElementById('cliente-fantasia').value = client.fantasia || '';
            document.getElementById('cliente-tipo').value = client.tipopessoa === 'F' ? 'fisica' : 'juridica';
            document.getElementById('contato-email').value = client.email || '';
            
            // Preencher CPF ou CNPJ e campos específicos
            if (client.pwclientefisico) {
                document.getElementById('cliente-cpf-cnpj').value = client.pwclientefisico.cpf || '';
                document.getElementById('cliente-rg').value = client.pwclientefisico.rg || '';
                document.getElementById('cliente-dt-nascimento').value = client.pwclientefisico.dt_nascimento || '';
            } else if (client.pwclientejuridico) {
                document.getElementById('cliente-cpf-cnpj').value = client.pwclientejuridico.cnpj || '';
                document.getElementById('cliente-inscricao').value = client.pwclientejuridico.inscricaoestadual || '';
                document.getElementById('cliente-dt-abertura').value = client.pwclientejuridico.dtabertura || '';
            }
            
            // Preencher observações
            document.getElementById('cliente-obs').value = client.obs || '';
            
            // Preencher endereço
            let addr = null;
            if (client.pwendereco) {
                if (Array.isArray(client.pwendereco)) {
                    if (client.pwendereco.length > 0) {
                        addr = client.pwendereco[0];
                    }
                } else {
                    addr = client.pwendereco;
                }
            }

            if (addr) {
                document.getElementById('endereco-cep').value = addr.cep || '';
                document.getElementById('endereco-logradouro').value = addr.logradouro || '';
                document.getElementById('endereco-numero').value = addr.numero || '';
                document.getElementById('endereco-bairro').value = addr.bairro || '';
                document.getElementById('endereco-cidade').value = addr.cidade || '';
                document.getElementById('endereco-estado').value = addr.estado || '';
            }
            
            // Preencher telefone
            // Preencher telefone
            let tel = null;
            if (client.pwtelefone) {
                if (Array.isArray(client.pwtelefone)) {
                    // Formato Array: [ {...} ]
                    if (client.pwtelefone.length > 0) {
                        tel = client.pwtelefone[0];
                    }
                } else {
                    // Formato Objeto: {...}
                    tel = client.pwtelefone;
                }
            }

            if (tel) {
                document.getElementById('contato-telefone').value = tel.telefone || '';
                document.getElementById('contato-celular').value = tel.celular || '';
            }

            editingClientId = id;
            modalTitle.textContent = 'Editar Cliente';
            saveButton.disabled = false;
            toggleCamposPorTipo(); // Aplicar visibilidade baseada no tipo
            clientModal.classList.add('show');

        } catch (error) {
            console.error('Erro ao abrir o modal de edição: ', error);
            alert(error.message);
        }
    };

    const deleteClient = async () => {
        if (!clientIdToDelete) return;

        confirmeDeleteBtn.disabled = true;
        confirmeDeleteBtn.textContent = 'Excluindo...';

        const apiUrl = `http://127.0.0.1:8000/api/clientes/${clientIdToDelete}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir cliente.');
            }

            showSuccessModal('Cliente excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            confirmeDeleteBtn.disabled = false;
            confirmeDeleteBtn.textContent = 'Excluir';
        }
    };

    const fetchAddressByCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return; 

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!response.ok) throw new Error('Não foi possível consultar o CEP.');
            
            const addressData = await response.json();
            if (addressData.erro) {
                alert('CEP não localizado. Por favor, preencha o endereço manualmente.');
                return;
            }

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

    const fetchCpfCnpjData = async (cpfCnpj) => {
        const cleanValue = cpfCnpj.replace(/\D/g, '');
        
        // Se for CNPJ (14 dígitos), busca na BrasilAPI
        if (cleanValue.length === 14) {
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanValue}`);
                if (!response.ok) throw new Error('Falha ao buscar CNPJ.');
                
                const data = await response.json();
                
                document.getElementById('cliente-nome').value = data.razao_social || '';
                document.getElementById('cliente-fantasia').value = data.nome_fantasia || '';
                document.getElementById('cliente-tipo').value = 'juridica';
                document.getElementById('cliente-dt-abertura').value = data.data_inicio_atividade || '';
                document.getElementById('cliente-cnae').value = data.cnae_fiscal || '';
                document.getElementById('endereco-cep').value = data.cep || '';
                document.getElementById('endereco-logradouro').value = data.logradouro || '';
                document.getElementById('endereco-numero').value = data.numero || '';
                document.getElementById('endereco-bairro').value = data.bairro || '';
                document.getElementById('endereco-cidade').value = data.municipio || '';
                document.getElementById('endereco-estado').value = data.uf || '';
                document.getElementById('contato-email').value = data.email || '';
                document.getElementById('contato-telefone').value = data.ddd_telefone_1 || '';
                document.getElementById('contato-celular').focus();

            } catch (error) {
                console.error('Erro BrasilAPI:', error);
                alert('CNPJ não localizado ou API falhou.');
            }
        } 
        // Se for CPF (11 dígitos), apenas define como pessoa física
        else if (cleanValue.length === 11) {
            document.getElementById('cliente-tipo').value = 'fisica';
        }
    };

    const loadClients = async () => {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando...</td></tr>';

        const apiUrl = `http://127.0.0.1:8000/api/clientes?page=${currentPage}&perPage=${itemsPerPage}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`Falha ao carregar clientes: ${response.statusText}`);
            }

            const result = await response.json();
            const clients = result.data;
            const totalItems = result.total;

            tableBody.innerHTML = '';

            if (clients.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum cliente cadastrado.</td></tr>';
                renderPagination(totalItems); 
                return;
            }

            clients.forEach(client => {
                const tr = document.createElement('tr');
                const dtFormatada = new Date(client.dtcadastro + 'T00:00:00').toLocaleDateString('pt-BR');

                tr.innerHTML = `
                    <td class="checkbox-column">
                        <input type="checkbox" data-id="${client.codcliente}" />
                    </td>
                    <td>${client.codcliente}</td>
                    <td>${client.cliente}</td>
                    <td>${client.email}</td>
                    <td>${dtFormatada}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${client.codcliente}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </td>
                    <td>
                        <button class="btn-icon btn-delete" data-id="${client.codcliente}" title="Excluir">
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
            console.error('Erro ao carregar clientes:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
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
                loadClients();
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
                loadClients();
            }
        });
        paginationContainer.appendChild(nextButton);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        
        const originalButtonText = editingClientId ? 'Atualizar' : 'Salvar';
        saveButton.textContent = editingClientId ? 'Atualizando...' : 'Salvando...';

        const formData = new FormData(clientForm);
        const rawData = Object.fromEntries(formData.entries());
        
        // Preparar dados conforme esperado pela API
        const tipoValue = rawData.tipo_pessoa || 'fisica';
        const cpfCnpjValue = rawData.cpf_cnpj || '';
        
        const clientData = {
            cliente: rawData.name,
            fantasia: rawData.fantasia,
            tipopessoa: tipoValue === 'fisica' ? 'F' : 'J',
            email: rawData.email,
            logradouro: rawData.logradouro,
            numero: rawData.numero,
            cep: rawData.cep,
            bairro: rawData.bairro,
            cidade: rawData.cidade,
            estado: rawData.estado,
            telefone: rawData.telefone,
            celular: rawData.celular,
            obs: rawData.obs || '',
            bloqueio: rawData.bloqueio ? 'S' : 'N'        
        };
        
        // Adicionar CPF ou CNPJ conforme o tipo
        if (tipoValue === 'fisica') {
            clientData.cpf = cpfCnpjValue;
            clientData.rg = rawData.rg || '';
            clientData.dt_nascimento = rawData.dt_nascimento || null;
        } else {
            clientData.cnpj = cpfCnpjValue;
            clientData.inscricaoestadual = rawData.inscricaoestadual || '';
            clientData.dtabertura = rawData.dtabertura || null;
        }

        let apiUrl = 'http://127.0.0.1:8000/api/clientes';
        let httpMethod = 'POST';

        if (editingClientId) {
            apiUrl = `http://127.0.0.1:8000/api/clientes/${editingClientId}`;
            httpMethod = 'PUT';
        }

        try {
            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(clientData),
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

            const successMessage = editingClientId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
            showSuccessModal(successMessage);
            closeModal();

        } catch (error) {
            console.error('Falha ao salvar cliente: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText; 
            if (httpMethod === 'PUT') {
                editingClientId = null;
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
    newClientBtn.addEventListener('click', openNewClientModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    clientForm.addEventListener('submit', handleFormSubmit);
    
    // Listener para mudança de tipo de pessoa
    tipoClienteSelect.addEventListener('change', toggleCamposPorTipo);
    
    // Buscar CEP
    if (cepInput) {
        cepInput.addEventListener('blur', (event) => {
            fetchAddressByCep(event.target.value);
        });
    }
    
    // Buscar CPF/CNPJ
    if (cpfCnpjInput) {
        cpfCnpjInput.addEventListener('blur', (event) => {
            fetchCpfCnpjData(event.target.value);
        });
    }
    
    clientModal.addEventListener('click', (event) => {
        if (event.target === clientModal) closeModal();
    });
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmeDeleteBtn.addEventListener('click', deleteClient);
    confirmationModal.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);

    loadClients();
});
