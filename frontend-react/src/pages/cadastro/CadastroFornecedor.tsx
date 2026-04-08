import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useSupplierManager } from "@/hooks/useSupplierManager";
import { Supplier, SortColumn } from "@/types/Supplier";
import "@/styles/cadastroFornecedor.css";

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

const CadastroFornecedor: React.FC = () => {
    const {
        selectedSuppliers,

        sortConfig,

        addSupplier,

        updateSupplier,

        deleteSupplier,

        toggleSelection,

        toggleSelectAll,

        handleSort,

        exportToCSV,

        getProcessedSuppliers,
    } = useSupplierManager();

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);

    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(
        null,
    );

    // Estado do Formulário

    const initialFormState: Partial<Supplier> = {
        name: "",

        email: "",

        cnpj: "",

        fantasyName: "",

        cep: "",

        address: "",

        number: "",

        neighborhood: "",

        city: "",

        state: "",

        phone: "",

        mobile: "",
    };

    const [formData, setFormData] =
        useState<Partial<Supplier>>(initialFormState);

    const filteredSuppliers = getProcessedSuppliers(searchTerm);

    // Handlers do Modal

    const openNewSupplierModal = () => {
        setFormData(initialFormState);

        setEditingId(null);

        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setFormData(supplier);

        setEditingId(supplier.id);

        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            alert("Preencha os campos obrigatórios (Nome e Email)");

            return;
        }

        if (editingId) {
            updateSupplier(editingId, formData);
        } else {
            // Cast para remover id/date que são gerados no hook

            addSupplier(formData as any);
        }

        setIsModalOpen(false);
    };

    // Handlers de Delete

    const confirmDelete = (id: number) => {
        setSupplierToDelete(id);

        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (supplierToDelete) {
            deleteSupplier(supplierToDelete);

            setIsDeleteModalOpen(false);

            setSupplierToDelete(null);
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar importada em vez de hardcoded */}

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

                    <div
                        className="actions"
                        style={{ display: "flex", gap: "10px" }}
                    >
                        <button
                            className="btn btn-outline"
                            onClick={exportToCSV}
                        >
                            Export
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={openNewSupplierModal}
                        >
                            Novo Fornecedor
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
                                                filteredSuppliers.length > 0 &&
                                                selectedSuppliers.size ===
                                                    filteredSuppliers.length
                                            }
                                            onChange={() =>
                                                toggleSelectAll(
                                                    filteredSuppliers,
                                                )
                                            }
                                        />
                                    </th>

                                    <SortableHeader
                                        label="Cod. Fornec"
                                        column="id"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <SortableHeader
                                        label="Fornecedor"
                                        column="name"
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
                                        label="Data de cadastro"
                                        column="date"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <th>Edit</th>

                                    <th>Delete</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedSuppliers.has(
                                                    supplier.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelection(supplier.id)
                                                }
                                            />
                                        </td>

                                        <td>{supplier.id}</td>

                                        <td>{supplier.name}</td>

                                        <td>{supplier.email}</td>

                                        <td>{supplier.date}</td>

                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() =>
                                                    openEditModal(supplier)
                                                }
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    confirmDelete(supplier.id)
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredSuppliers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                            }}
                                        >
                                            Nenhum fornecedor encontrado
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
                                {editingId
                                    ? "Editar Fornecedor"
                                    : "Novo Fornecedor"}
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
                                <h4>Dados da Empresa</h4>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>CNPJ</label>

                                        <input
                                            type="text"
                                            name="cnpj"
                                            value={formData.cnpj}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Razão Social *</label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nome Fantasia</label>

                                        <input
                                            type="text"
                                            name="fantasyName"
                                            value={formData.fantasyName}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </div>

                                <h4>Endereço</h4>

                                <div className="form-group-row">
                                    <div className="form-group cep-group">
                                        <label>CEP</label>

                                        <input
                                            type="text"
                                            name="cep"
                                            value={formData.cep}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Logradouro</label>

                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group numero-group">
                                        <label>Número</label>

                                        <input
                                            type="text"
                                            name="number"
                                            value={formData.number}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Bairro</label>

                                        <input
                                            type="text"
                                            name="neighborhood"
                                            value={formData.neighborhood}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Cidade</label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group estado-group">
                                        <label>UF</label>

                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleFormChange}
                                            maxLength={2}
                                        />
                                    </div>
                                </div>

                                <h4>Contato</h4>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>E-mail *</label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Telefone</label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Celular</label>

                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleFormChange}
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
                                Tem certeza que deseja excluir este fornecedor?
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

export default CadastroFornecedor;
