import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useEmployeeManager } from "@/hooks/ueseEmployeeManager";
import { Employee, SortColumn } from "@/types/Employee";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroFuncionario.css";

// -------------------------------------------------------
// Icons
// -------------------------------------------------------
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
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
        getProcessedEmployees,
        getEmployee,
    } = useEmployeeManager();

    // ── Toast ──────────────────────────────────────────────
    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    // ── Estado local do formulário ─────────────────────────
    const [isDeleteModalOpen, setIsDeleteModalOpen]   = useState(false);
    const [editingId, setEditingId]                   = useState<number | null>(null);
    const [employeeToDelete, setEmployeeToDelete]     = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen]               = useState(false);
    const [isSubmitting, setIsSubmitting]             = useState(false);
    const [submitError, setSubmitError]               = useState<string | null>(null);

    const initialFormState: Partial<Employee> = {
        empregado:      "",
        cpf:            "",
        email:          "",
        email_corporativo: "",
        telefone:       "",
        celular:        "",
        cargo:          "",
        salario:        0,
        codsetor:       1,
        data_nascimento:"",
        data_admissao:  new Date().toISOString().split("T")[0],
        cep:            "",
        logradouro:     "",
        numero:         "",
        bairro:         "",
        cidade:         "",
        uf:             "",
    };

    const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

    const filteredEmployees = getProcessedEmployees(searchTerm);

    // ── Handlers do modal ──────────────────────────────────
    const openNewEmployeeModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditEmployeeModal = (employee: Employee) => {
        setIsSubmitting(true);
        getEmployee(employee.codempregado)
            .then((fullEmployeeData) => {
                setFormData(fullEmployeeData);
                setEditingId(employee.codempregado);
                setSubmitError(null);
                setIsModalOpen(true);
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : "Erro ao carregar dados do funcionário";
                setSubmitError(msg);
                toastError("Erro ao abrir edição", msg);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value ? Number(value) : 0) : value,
        }));
    };

    // ── Submit ─────────────────────────────────────────────
    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validação — campos obrigatórios
        if (
            !formData.empregado || !formData.cpf   || !formData.email  ||
            !formData.cargo     || !formData.data_nascimento            ||
            !formData.data_admissao
        ) {
            const msg = "Preencha todos os campos obrigatórios (Nome, CPF, Email, Cargo, Data Nascimento, Data Admissão).";
            setSubmitError(msg);
            warning("Campos obrigatórios", msg);
            return;
        }

        if (!formData.cep || !formData.logradouro || !formData.bairro || !formData.cidade) {
            const msg = "Preencha todos os dados de endereço.";
            setSubmitError(msg);
            warning("Endereço incompleto", msg);
            return;
        }

        if (formData.salario && formData.salario <= 0) {
            const msg = "O salário deve ser maior que zero.";
            setSubmitError(msg);
            warning("Salário inválido", msg);
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSend = {
                ...formData,
                // Manter email_corporativo como está, se preenchido
                email_corporativo: formData.email_corporativo || formData.email,
            };

            if (editingId) {
                // Atualizar funcionário existente
                await updateEmployee(editingId, dataToSend as any);

                success(
                    "Funcionário atualizado!",
                    `${formData.empregado} foi atualizado com sucesso.`
                );
            } else {
                // Criar novo funcionário
                await addEmployee(dataToSend as any);

                success(
                    "Funcionário cadastrado!",
                    `${formData.empregado} foi adicionado com sucesso.`
                );
            }

            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar funcionário";
            setSubmitError(msg);

            // ❌ Toast de erro — dispara quando a API rejeita
            toastError("Erro ao cadastrar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const confirmDelete = (codempregado: number) => {
        setEmployeeToDelete(codempregado);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!employeeToDelete) return;

        try {
            await deleteEmployee(employeeToDelete);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);

            // ✅ Toast de sucesso na exclusão
            success("Funcionário excluído", "O registro foi removido com sucesso.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao deletar funcionário";

            // ❌ Toast de erro na exclusão
            toastError("Erro ao excluir", msg);
        }
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="app-container">
            {/*
              ToastContainer fica fora do fluxo normal (fixed positioning interno).
              Renderize-o uma vez na raiz — aqui ou no AppShell.
              Se mover para o AppShell, passe { toasts, onRemove: removeToast } via Context.
            */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header />

                <div
                    className="container-header"
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
                <div className= "actions"
                    style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-secondary"
                        onClick={exportToCSV}
                        disabled={loading || employees.length === 0}
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

                {/* Tabela de funcionários — mantida conforme original */}
                {loading && <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>}
                {error && <div style={{ padding: "20px", color: "red", textAlign: "center" }}>Erro: {error}</div>}

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
                                            onChange={()=> toggleSelectAll(filteredEmployees)}
                                        />
                                    </th>
                                    <SortableHeader
                                        label="Cod.Func."
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
                                        label="Email"
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
                                            <input type="checkbox"
                                                checked={selectedEmployees.has(employee.codempregado)}
                                                onChange={() => toggleSelection(employee.codempregado)}
                                            />
                                        </td>
                                        <td>{employee.codempregado}</td>
                                        <td>{employee.empregado}</td>
                                        <td>{employee.cpf}</td>
                                        <td>{employee.email || employee.email_corporativo }</td>
                                        <td>{employee.cargo}</td>
                                        <td>{employee.salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
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
                                            padding: "20px"}}
                                        >
                                            Nenhum funcionário encontrado.

                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>



                {/* Modal de cadastro / edição */}
                {isModalOpen && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{editingId ? "Editar Funcionário" : "Novo Funcionário"}</h2>
                                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                                    &times;
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Erro inline no formulário — mantido para acessibilidade */}
                                {submitError && (
                                    <div className="error-message" role="alert">
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleFormSubmit}>
                                    <div className="form-group">
                                        <label>Nome *</label>
                                        <input type="text" name="empregado"
                                            value={formData.empregado || ""}
                                            onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>CPF *</label>
                                        <input type="text" name="cpf"
                                            value={formData.cpf || ""}
                                            onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input type="email" name="email"
                                            value={formData.email || ""}
                                            onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Corporativo</label>
                                        <input type="email" name="email_corporativo"
                                            value={formData.email_corporativo || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Telefone</label>
                                        <input type="text" name="telefone"
                                            value={formData.telefone || ""}
                                            onChange={handleFormChange}
                                            placeholder="(11) 3333-4444" />
                                    </div>
                                    <div className="form-group">
                                        <label>Celular</label>
                                        <input type="text" name="celular"
                                            value={formData.celular || ""}
                                            onChange={handleFormChange}
                                            placeholder="(11) 99999-9999" />
                                    </div>
                                    <div className="form-group">
                                        <label>Cargo *</label>
                                        <input type="text" name="cargo"
                                            value={formData.cargo || ""}
                                            onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Salário *</label>
                                        <input type="number" name="salario"
                                            value={formData.salario || ""}
                                            onChange={handleFormChange}
                                            step="0.01" min="0" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Data de Nascimento</label>
                                        <input type="date" name="data_nascimento"
                                            value={formData.data_nascimento || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Data de Admissão</label>
                                        <input type="date" name="data_admissao"
                                            value={formData.data_admissao || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>CEP</label>
                                        <input type="text" name="cep"
                                            value={formData.cep || ""}
                                            onChange={handleFormChange}
                                            placeholder="00000-000" />
                                    </div>
                                    <div className="form-group">
                                        <label>Logradouro</label>
                                        <input type="text" name="logradouro"
                                            value={formData.logradouro || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Número</label>
                                        <input type="text" name="numero"
                                            value={formData.numero || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bairro</label>
                                        <input type="text" name="bairro"
                                            value={formData.bairro || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Cidade</label>
                                        <input type="text" name="cidade"
                                            value={formData.cidade || ""}
                                            onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>UF</label>
                                        <input type="text" name="uf"
                                            value={formData.uf || ""}
                                            onChange={handleFormChange}
                                            placeholder="SP" maxLength={2} />
                                    </div>

                                    <div className="form-group actions">
                                        <button type="button" className="btn btn-secondary"
                                            onClick={() => setIsModalOpen(false)}
                                            disabled={isSubmitting}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary"
                                            disabled={isSubmitting}>
                                            {isSubmitting ? "Salvando..." : "Salvar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmação de exclusão */}
                {isDeleteModalOpen && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Confirmar Exclusão</h2>
                                <button className="close-modal"
                                    onClick={() => setIsDeleteModalOpen(false)}>
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Tem certeza que deseja excluir este funcionário?</p>
                                <div className="form-group actions">
                                    <button type="button" className="btn btn-secondary"
                                        onClick={() => setIsDeleteModalOpen(false)}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-danger"
                                        onClick={executeDelete}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// -------------------------------------------------------
// SortableHeader — mantido sem alterações
// -------------------------------------------------------
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
