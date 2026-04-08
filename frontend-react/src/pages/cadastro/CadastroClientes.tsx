import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useClientManager } from "@/hooks/useClientManager";
import { Client, SortColumn } from "@/types/Client";
import "@/styles/cadastroCliente.css";

// Ícones

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

const CadastroCliente: React.FC = () => {
    const {
        selectedClients,
        sortConfig,
        addClient,
        updateClient,
        deleteClient,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        exportToCSV,
        getProcessedClients,
    } = useClientManager();

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);

    // Estado do Formulário
    const initialFormState: Partial<Client> = {
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
    };

    const [formData, setFormData] = useState<Partial<Client>>(initialFormState);

    const filteredClients = getProcessedClients(searchTerm);

    // Handlers do Modal
    const openNewClientModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (client: Partial<Client>) => {
        setFormData(client);
        if (client.id !== undefined) {
            setEditingId(client.id);
        }
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.email) {
            alert("Preencha os campos obrigatórios (Nome e Email)");
            return;
        }

        if (editingId) {
            updateClient(editingId, formData);
        } else {
            addClient(formData as any);
        }

        setIsModalOpen(false);
    };

    // Handlers de Delete
    const confirmDelete = (id: number) => {
        setClientToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (clientToDelete) {
            deleteClient(clientToDelete);
            setIsDeleteModalOpen(false);
            setClientToDelete(null);
        }
    };

    return (
        <div className="app-container">
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
                            placeholder="Pesquisar"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button className="btn btn-outline" onClick={exportToCSV}>
                            Export
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={openNewClientModal}
                        >
                            Novo Cliente
                        </button>
                    </div>
                </div>

                <section className="suppliers-section">
                    <div className="table-container">
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredClients.length > 0 &&
                                                selectedClients.size ===
                                                    filteredClients.length
                                            }
                                            onChange={() =>
                                                toggleSelectAll(filteredClients)
                                            }
                                        />
                                    </th>

                                    <SortableHeader
                                        label="Cod."
                                        column="id"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <SortableHeader
                                        label="Nome"
                                        column="nome"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <SortableHeader
                                        label="E-MAIL"
                                        column="email"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <SortableHeader
                                        label="Telefone"
                                        column="telefone"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <th>Edit</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.has(
                                                    client.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelection(client.id)
                                                }
                                            />
                                        </td>

                                        <td>{client.id}</td>

                                        <td>{client.nome}</td>

                                        <td>{client.email}</td>

                                        <td>{client.telefone || "-"}</td>

                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() =>
                                                    openEditModal(client)
                                                }
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    confirmDelete(client.id)
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                            }}
                                        >
                                            Nenhum cliente encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="modal show" style={{ display: "flex" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                {editingId ? "Editar Cliente" : "Novo Cliente"}
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
                                <h4>Dados do Cliente</h4>

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

                                    <button type="submit" className="btn btn-primary">
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
                            <p>Tem certeza que deseja excluir este cliente?</p>

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

// Componente Auxiliar para Cabeçalho Ordenável
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

export default CadastroCliente;
