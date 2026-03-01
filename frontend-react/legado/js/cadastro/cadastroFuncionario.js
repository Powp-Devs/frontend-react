document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de elementos ---
    const newEmployeeBtn = document.getElementById('new-employee-btn');
    const employeeModal = document.getElementById('employee-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const employeeForm = document.getElementById('employee-form');
    const cepInput = document.getElementById('employee-cep');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');

    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmeDeleteBtn = document.getElementById('confirm-delete-btn');

    const successModal = document.getElementById('success-modal');
    const successMessageText = document.getElementById('success-message-text');

    let employeeIdToDelete = null;
    let currentPage = 1;
    const itemsPerPage = 10;
    let editingEmployeeId = null;
    
    const tableBody = document.getElementById('employees-table-body');

    // --- Funções ---

    const openNewEmployeeModal = () => {
        employeeForm.reset();
        modalTitle.textContent = 'Novo Funcionário';
        saveButton.disabled = false; 
        editingEmployeeId = null;
        saveButton.textContent = 'Salvar';
        employeeModal.classList.add('show');
    };

    const showSuccessModal = (message) => {
        employeeModal.classList.remove('show');
        confirmationModal.classList.remove('show');
        successMessageText.textContent = message;
        successModal.classList.add('show');
        setTimeout(() => {
            successModal.classList.remove('show');
            loadEmployees();
        }, 2000);
    };

    const closeModal = () => {
        employeeModal.classList.remove('show');
    };

    const openConfirmationModal = (id) => {
        employeeIdToDelete = id;
        confirmationModal.classList.add('show');
    };

    const closeConfirmationModal = () => {
        employeeIdToDelete = null;
        confirmationModal.classList.remove('show');
    };

    const openEditModal = async (id) => {
        employeeForm.reset();
        modalTitle.textContent = 'Carregando dados...';
        saveButton.disabled = true;

        const apiUrl = `http://127.0.0.1:8000/api/funcionarios/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do funcionário.');

            const employee = await response.json();

            document.getElementById('employee-registration').value = employee.matricula || '';
            document.getElementById('employee-name').value = employee.nome || '';
            document.getElementById('employee-cpf').value = employee.cpf || '';
            document.getElementById('employee-rg').value = employee.rg || '';
            document.getElementById('employee-birth-date').value = employee.data_nascimento || '';
            document.getElementById('employee-phone').value = employee.telefone || '';
            document.getElementById('employee-email').value = employee.email || '';
            
            if (employee.endereco) {
                document.getElementById('employee-cep').value = employee.endereco.cep || '';
                document.getElementById('employee-address').value = employee.endereco.logradouro || '';
                document.getElementById('employee-number').value = employee.endereco.numero || '';
                document.getElementById('employee-neighborhood').value = employee.endereco.bairro || '';
                document.getElementById('employee-city').value = employee.endereco.cidade || '';
            }

            document.getElementById('employee-position').value = employee.cargo || '';
            document.getElementById('employee-department').value = employee.departamento || '';
            document.getElementById('employee-hire-date').value = employee.data_admissao || '';
            document.getElementById('employee-salary').value = employee.salario || '';
            document.getElementById('employee-workload').value = employee.carga_horaria || '40h';
            document.getElementById('employee-status').value = employee.status || 'ativo';
            document.getElementById('employee-observations').value = employee.observacoes || '';

            editingEmployeeId = id;
            modalTitle.textContent = 'Editar Funcionário';
            saveButton.disabled = false;
            employeeModal.classList.add('show');

        } catch (error) {
            console.error('Erro ao abrir o modal de edição: ', error);
            alert(error.message);
        }
    };

    const deleteEmployee = async () => {
        if (!employeeIdToDelete) return;

        confirmeDeleteBtn.disabled = true;
        confirmeDeleteBtn.textContent = 'Excluindo...';

        const apiUrl = `http://127.0.0.1:8000/api/funcionarios/${employeeIdToDelete}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir funcionário.');
            }

            showSuccessModal('Funcionário excluído com sucesso!');

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

            document.getElementById('employee-address').value = addressData.logradouro;
            document.getElementById('employee-neighborhood').value = addressData.bairro;
            document.getElementById('employee-city').value = addressData.localidade;
            document.getElementById('employee-number').focus();

        } catch (error) {
            console.error('Erro ao buscar CEP: ', error);
            alert(error.message);
        }
    };

    const loadEmployees = async () => {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Carregando...</td></tr>';

        const apiUrl = `http://127.0.0.1:8000/api/funcionarios?page=${currentPage}&perPage=${itemsPerPage}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`Falha ao carregar funcionários: ${response.statusText}`);
            }

            const result = await response.json();
            const employees = result.data;
            const totalItems = result.total;

            tableBody.innerHTML = '';

            if (employees.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>';
                renderPagination(totalItems); 
                return;
            }

            employees.forEach(employee => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td class="checkbox-column">
                        <input type="checkbox" data-id="${employee.matricula}" />
                    </td>
                    <td>${employee.matricula}</td>
                    <td>${employee.nome}</td>
                    <td>${employee.cargo || '-'}</td>
                    <td>${employee.departamento || '-'}</td>
                    <td>${employee.telefone || '-'}</td>
                    <td>${employee.email}</td>
                    <td>R$ ${parseFloat(employee.salario || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${employee.status}">${employee.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${employee.matricula}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${employee.matricula}" title="Excluir">
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
            console.error('Erro ao carregar funcionários:', error);
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
                loadEmployees();
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
                loadEmployees();
            }
        });
        paginationContainer.appendChild(nextButton);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        
        const originalButtonText = editingEmployeeId ? 'Atualizar' : 'Salvar';
        saveButton.textContent = editingEmployeeId ? 'Atualizando...' : 'Salvando...';

        const formData = new FormData(employeeForm);
        const employeeData = Object.fromEntries(formData.entries());

        let apiUrl = 'http://127.0.0.1:8000/api/funcionarios';
        let httpMethod = 'POST';

        if (editingEmployeeId) {
            apiUrl = `http://127.0.0.1:8000/api/funcionarios/${editingEmployeeId}`;
            httpMethod = 'PUT';
        }

        try {
            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(employeeData),
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

            const successMessage = editingEmployeeId ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!';
            showSuccessModal(successMessage);
            closeModal();

        } catch (error) {
            console.error('Falha ao salvar funcionário: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText; 
            if (httpMethod === 'PUT') {
                editingEmployeeId = null;
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
    newEmployeeBtn.addEventListener('click', openNewEmployeeModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    employeeForm.addEventListener('submit', handleFormSubmit);
    cepInput.addEventListener('blur', (event) => {
        fetchAddressByCep(event.target.value);
    });
    employeeModal.addEventListener('click', (event) => {
        if (event.target === employeeModal) closeModal();
    });
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmeDeleteBtn.addEventListener('click', deleteEmployee);
    confirmationModal.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);

    loadEmployees();
});
