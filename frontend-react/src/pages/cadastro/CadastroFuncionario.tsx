import React, {useState, FormEvent} from "react";
import Header from "@/shared/components/layout/Header";
import { useEmployeeManager } from "@/hooks/ueseEmployeeManager";
import { Employee, SortColumn } from "@/types/Employee";
import "@/styles/cadastroFuncionario.css";

// Icons

const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


const CadastroFuncionario: React.FC = () => {
    const {
        employees,
        selectedEmployees,
        searchTerm,
        sortConfig,
        loading,
        error,
        setSearchTerm,
        exportToCSV,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedEmployees
    } = useEmployeeManager();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const initialFormState: Partial<Employee> = {
        empregado: "",
        cpf: "",
        email: "",
        cargo: "",
        salario: 0,
        codsetor: 1,
        data_nascimento: "",
        data_admissao: new Date().toISOString().split('T')[0],
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        uf: "",
        celular: "",
    };

    const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

    const filteredEmployees = getProcessedEmployees(searchTerm);

    // Functions para abrir handlers do modal
    const openNewEmployeeModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditEmployeeModal = (employee: Employee) => {
        setFormData(employee);
        setEditingId(employee.codempregado);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value ? Number(value) : 0) : value
        }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validar campos obrigatórios conforme backend schema
        if (!formData.empregado || !formData.cpf || !formData.email || !formData.cargo || !formData.data_nascimento || !formData.data_admissao) {
            setSubmitError("Preencha todos os campos obrigatórios (Nome, CPF, Email, Cargo, Data Nascimento, Data Admissão).");
            return;
        }

        if (!formData.cep || !formData.logradouro || !formData.bairro || !formData.cidade) {
            setSubmitError("Preencha todos os dados de endereço.");
            return;
        }

        if (formData.salario && formData.salario <= 0) {
            setSubmitError("O salário deve ser maior que zero.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Preparar dados para envio (incluir email_corporativo igual email)
            const dataToSend = {
                ...formData,
                email_corporativo: formData.email,
                // Garantir que os campos opcionais que não foram preenchidos sejam enviados
            };
            
            if (editingId) {
                // Para update, precisamos implementar no backend primeiro
                alert("Atualização ainda não implementada no backend. Apenas criar e deletar funcionam.");
                // await updateEmployee(editingId, dataToSend);
            } else {
                await addEmployee(dataToSend as any);
            }
            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar funcionário');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Functions para abrir handlers de delete
    const confirmDelete = (codempregado: number) => {
        setEmployeeToDelete(codempregado);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (employeeToDelete) {
            try {
                await deleteEmployee(employeeToDelete);
                setIsDeleteModalOpen(false);
                setEmployeeToDelete(null);
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Erro ao deletar funcionário');
            }
        }
    };

    return (
    <div className="app-container">
        <main className="main-content">
            <Header />
            <div className="container-header"
                    style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
            >
                <div className="search-container">
                    <input
                    type="text"
                    placeholder="Pesquisar por nome, CPF ou email"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="actions"
                    style={{ display: "flex", gap:"10px" }}
                >
                    <button className="btn btn-outline"
                        onClick={exportToCSV}
                        disabled={loading}
                    >
                        Exportar
                    </button>
                    <button className="btn btn-primary"
                        onClick={openNewEmployeeModal}
                        disabled={loading}
                    >
                        Novo Funcionário
                    </button>
                    </div>
            </div>

            {loading && <div style={{padding: "20px", textAlign: "center"}}>Carregando...</div>}
            {error && <div style={{padding: "20px", color: "red", textAlign: "center"}}>Erro: {error}</div>}

            <section className="employee-section">
                <div className="table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input type="checkbox"
                                            checked={
                                                filteredEmployees.length > 0 &&
                                                selectedEmployees.size ===
                                                filteredEmployees.length
                                            }
                                            onChange={() => toggleSelectAll(filteredEmployees)}
                                        />
                                </th>
                                <SortableHeader
                                    label="cod. Func."
                                    column="codempregado"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Nome"
                                    column="empregado"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="CPF"
                                    column="cpf"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="E-mail"
                                    column="email"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Cargo"
                                    column="cargo"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Salário"
                                    column="salario"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <th>Editar</th>
                                <th>Deletar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.codempregado}>
                                    <td className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.has(
                                                employee.codempregado
                                            )}
                                            onChange={() =>
                                                toggleSelection(employee.codempregado)
                                            }
                                        />
                                    </td>
                                    <td>{employee.codempregado}</td>
                                    <td>{employee.empregado}</td>
                                    <td>{employee.cpf}</td>
                                    <td>{employee.email || employee.email_corporativo}</td>
                                    <td>{employee.cargo}</td>
                                    <td>{employee.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td>
                                        <button className="action-btn edit-btn"
                                        onClick={() => openEditEmployeeModal(employee)}
                                        title="Editar"
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="action-btn delete-btn"
                                        onClick={() => confirmDelete(employee.codempregado)}
                                        title="Deletar"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={9}
                                    style={{
                                        textAlign: "center",
                                        padding: "20px" }}
                                    >
                                        Nenhum funcionário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        {/* Modal para criar/editar funcionário */}
        {isModalOpen && (
            <div className="modal-show" style={{ display: "flex" }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>
                            {editingId
                            ? "Editar Funcionário" :
                            "Novo Funcionário"}
                        </h2>
                        <button
                            className="close-modal"
                            onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        {submitError && <div style={{color: "red", marginBottom: "10px"}}>{submitError}</div>}
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Nome *</label>
                                <input
                                    type="text"
                                    id="empregado"
                                    name="empregado"
                                    value={formData.empregado || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>CPF *</label>
                                <input
                                    type="text"
                                    id="cpf"
                                    name="cpf"
                                    value={formData.cpf || ''}
                                    onChange={handleFormChange}
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Celular</label>
                                <input
                                    type="text"
                                    id="celular"
                                    name="celular"
                                    value={formData.celular || ''}
                                    onChange={handleFormChange}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cargo *</label>
                                <input
                                    type="text"
                                    id="cargo"
                                    name="cargo"
                                    value={formData.cargo || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Salário *</label>
                                <input
                                    type="number"
                                    id="salario"
                                    name="salario"
                                    value={formData.salario || ''}
                                    onChange={handleFormChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Data de Nascimento</label>
                                <input
                                    type="date"
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    value={formData.data_nascimento || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Data de Admissão</label>
                                <input
                                    type="date"
                                    id="data_admissao"
                                    name="data_admissao"
                                    value={formData.data_admissao || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>CEP</label>
                                <input
                                    type="text"
                                    id="cep"
                                    name="cep"
                                    value={formData.cep || ''}
                                    onChange={handleFormChange}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Logradouro</label>
                                <input
                                    type="text"
                                    id="logradouro"
                                    name="logradouro"
                                    value={formData.logradouro || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bairro</label>
                                <input
                                    type="text"
                                    id="bairro"
                                    name="bairro"
                                    value={formData.bairro || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cidade</label>
                                <input
                                    type="text"
                                    id="cidade"
                                    name="cidade"
                                    value={formData.cidade || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>UF</label>
                                <input
                                    type="text"
                                    id="uf"
                                    name="uf"
                                    value={formData.uf || ''}
                                    onChange={handleFormChange}
                                    placeholder="SP"
                                    maxLength={2}
                                />
                            </div>
                            <div className="form-group actions">
                                <button type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}>
                                        Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </button>
                         </div>
                     </form>
                    </div>
                </div>
            </div>
        )}

        {/* Modal para confirmação de exclusão */}
        {isDeleteModalOpen && (
            <div className="modal-show" style={{ display: "flex" }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Confirmar Exclusão</h2>
                        <button
                            className="close-modal"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>Tem certeza que deseja excluir este funcionário?</p>
                        <div className="form-group actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={executeDelete}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const SortableHeader: React.FC<{
    label: string;
    column: SortColumn;
    currentSort: { column: SortColumn; direction: "asc" | "desc" };
    onSort: (column: SortColumn) => void;
}> = ({ label, column, currentSort, onSort }) => {
    const isActive = currentSort.column === column;

    return (
        <th
            className={`sortable ${isActive ? currentSort.direction : ""}`}
            onClick={() => onSort(column)}
            style={{ cursor: "pointer" }}
        >
            {label} {isActive && (currentSort.direction === "asc" ? "↑" : "↓")}
        </th>
    );
};

export default CadastroFuncionario;
