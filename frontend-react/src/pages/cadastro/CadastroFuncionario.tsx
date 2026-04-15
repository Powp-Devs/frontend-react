import React, {useState, FormEvent} from "react";
import Header from "@/shared/components/layout/Header";
import { useEmployeeManager } from "@/hooks/ueseEmployeeManager";
import { Employee, SortColumn } from "@/types/Employee";
import "@/styles/cadastroFuncionario.css";

// Incones

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
        filterDepartment,
        setSearchTerm,
        setFilterDepartment,
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

    const initialFormState: Partial<Employee> = {
        name: "",
        email: "",
        position: "",
        department: "",
    };

    const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

    const filteredEmployees = getProcessedEmployees(searchTerm);

    // Funções para abrir handlers do modal
    const openNewEmployeeModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditEmployeeModal = (employee: Employee) => {
        setFormData(employee);
        setEditingId(employee.id);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            alert("Nome e email são obrigatórios.");
            return;

        }
        if (editingId) {
            updateEmployee(editingId, formData);
        } else {
            addEmployee(formData as any);
        }
        setIsModalOpen(false);
    };
    // Funções para abrir handlers de delete
    const comfirmDelete = (id: number) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };
    const executeDelete = () => {
        if (employeeToDelete) {
            deleteEmployee(employeeToDelete);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
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
                    placeholder="Pesquisar"
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
                    >
                        Exportar
                    </button>
                    <button className="btn btn-primary"
                        onClick={openNewEmployeeModal}
                    >
                        Novo Funcionário
                    </button>
                    </div>
            </div>

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
                                    column="id"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Nome"
                                    column="name"
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
                                    column="position"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Departamento"
                                    column="department"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Salário"
                                    column="salary"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <th>Edit</th>

                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.has(
                                                employee.id
                                            )}
                                            onChange={() =>
                                                toggleSelection(employee.id)
                                            }
                                        />
                                    </td>
                                    <td>{employee.id}</td>

                                    <td>{employee.name}</td>

                                    <td>{employee.email}</td>

                                    <td>{employee.position}</td>

                                    <td>{employee.department}</td>

                                    <td>{employee.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>

                                    <td>
                                        <button className="action-btn edit-btn"
                                        onClick={() => openEditEmployeeModal(employee)}
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="action-btn delete-btn"
                                        onClick={() => deleteEmployee(employee.id)}
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={7}
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
        {/* Modals */}

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
                            <form onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label>Nome *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="position">Cargo *</label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="department">Departamento *</label>
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        value={formData.department || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salary">Salário *</label>
                                    <input
                                        type="number"
                                        id="salary"
                                        name="salary"
                                        value={formData.salary || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group actions">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsModalOpen(false)}>
                                            Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary">
                                        Salvar
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