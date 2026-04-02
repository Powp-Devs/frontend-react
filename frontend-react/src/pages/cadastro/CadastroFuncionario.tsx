import React, { useEffect, useState, FormEvent } from "react";
import { observer } from "mobx-react-lite";
import { Funcionario } from "../../types/Employer";
import Header from "../../shared/components/layout/Header";
import "../../styles/cadastroFuncionario.css";
import { employeeStore } from "@/stores/EmployStore";

type EmployFormState = Partial<Funcionario>;

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

const CadastroFuncionario: React.FC = observer(() => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

    const initialFormState: EmployFormState = {
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
    };

    const [formData, setFormData] = useState<EmployFormState>(initialFormState);

    useEffect(() => {
        employeeStore.loadClients();
    }, []);

    // Handlers do Modal
    const openNewEmployeeModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee: any) => {
        setFormData(employee);
        setEditingId(employee.id);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.email) {
            alert("Preencha os campos obrigatórios (Nome e Email)");
            return;
        }

        try {
            await employeeStore.saveEmployee(formData);
            setIsModalOpen(false);
        } catch (error) {
            alert("Erro ao salvar funcionário");
        }
    };

     // Handlers de Delete
    const confirmDelete = (id: number) => {
         setEmployeeToDelete(id);
         setIsDeleteModalOpen(true);
     };

    const executeDelete = () => {
         if (employeeToDelete) {
             employeeStore.deleteEmployee(employeeToDelete);
             setIsDeleteModalOpen(false);
             setEmployeeToDelete(null);
         }
     };

    const filteredEmployees = employeeStore.employees.filter((employee) =>
         employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()))
     );

    return (
        <main className="main-content">
            <Header />

            {/* Sub-header da página */}
            <div
                className="content-header"
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
                        placeholder="Pesquisar Funcionários..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="actions" style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="btn btn-primary"
                        onClick={openNewEmployeeModal}
                    >
                        Novo Funcionário
                    </button>
                </div>
            </div>

            <section className="suppliers-section">
                <div className="table-container">
                    {employeeStore.isLoading ? (
                        <p>Carregando...</p>
                    ) : (
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th>Cod.</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Telefone</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.id}</td>
                                        <td>{employee.nome}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.telefone || "-"}</td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    openEditModal(employee)
                                                }
                                                title="Editar"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    marginRight: "10px",
                                                    color: "var(--color-primary)",
                                                }}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(employee.id)
                                                }
                                                title="Excluir"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "var(--color-danger)",
                                                }}
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Nenhum funcionário encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="modal show" style={{ display: "flex" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                {editingId
                                    ? "Editar Funcionário"
                                    : "Novo Funcionário"}
                            </h2>

                            <button
                                className="close-modal"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <h4>Dados do Funcionário</h4>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Nome Completo *</label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Telefone</label>
                                        <input
                                            type="tel"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Endereço</label>
                                        <input
                                            type="text"
                                            name="endereco"
                                            value={formData.endereco}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Cidade</label>
                                        <input
                                            type="text"
                                            name="cidade"
                                            value={formData.cidade}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group estado-group">
                                        <label>Estado</label>
                                        <input
                                            type="text"
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleFormChange}
                                            maxLength={2}
                                        />
                                    </div>
                                </div>

                                <div className="form-group actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && (
                <div className="modal show" style={{ display: "flex" }}>
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
                            <p>
                                Tem certeza que deseja excluir este funcionário?
                            </p>

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
        </main>
    );
});

export default CadastroFuncionario;
