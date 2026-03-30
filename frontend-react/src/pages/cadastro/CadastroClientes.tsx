// src/pages/CadastroCliente.tsx
import React, { useEffect, useState, FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Header from "../../shared/components/layout/Header";
import { clientStore } from "../../stores/ClientStore";
import "../../styles/cadastroCliente.css";

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

interface ClientFormState {
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
}

const CadastroCliente: React.FC = observer(() => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);

    const initialFormState: ClientFormState = {
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
    };

    const [formData, setFormData] = useState<ClientFormState>(initialFormState);

    // Equivale ao DOMContentLoaded/init()
    useEffect(() => {
        clientStore.loadClients();
    }, []);

    // Handlers do Modal
    const openNewClientModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (client: any) => {
        setFormData(client);
        setEditingId(client.id);
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
            // Update logic (caso tenha no store)
            // updateClient(editingId, formData);
        } else {
            // Add logic (caso tenha no store)
            // addClient(formData);
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
            clientStore.deleteClient(clientToDelete);
            setIsDeleteModalOpen(false);
            setClientToDelete(null);
        }
    };

    const filteredClients = clientStore.clients.filter((client) =>
        client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                        placeholder="Pesquisar clientes..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="actions" style={{ display: "flex", gap: "10px" }}>
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
                    {clientStore.isLoading ? (
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
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td>{client.id}</td>
                                        <td>{client.nome}</td>
                                        <td>{client.email}</td>
                                        <td>{client.telefone || "-"}</td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    openEditModal(client)
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
                                                    confirmDelete(client.id)
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

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Nenhum cliente encontrado
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
                                    ? "Editar Cliente"
                                    : "Novo Cliente"}
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
                                Tem certeza que deseja excluir este cliente?
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

export default CadastroCliente;
