import React, {useState, FormEvent} from "react";
import Header from "@/shared/components/layout/Header";
import {useProductManager} from "@/hooks/useProductManager";
import {Product, SortColumn } from "@/types/Product";
import "@/styles/cadastroProduto.css";

// Icones
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

const CadastroProduto: React.FC = () => {
    const {
        selectedProducts,
        searchTerm,
        sortConfig,
        setSearchTerm,
        exportToCSV,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedProducts,
    } = useProductManager();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialFormState: Partial<Product> = {
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
    };

    const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

    const filteredProducts = getProcessedProducts(searchTerm);

    // Funções para abrir handlers do modal
    const openNewProductModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setFormData(product);
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            alert("Nome e preço são obrigatórios.");
            return;
        }

        if (editingId) {
            updateProduct(editingId, formData);
        } else {
            addProduct(formData as Omit<Product, "id">);
        }
        setIsModalOpen(false);
    };

    // Funções para abrir handlers de delete
    const confirmDelete = (id: number) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    return (
        <div className="app-container">
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
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openNewProductModal}
                        >
                            Novo Produto
                        </button>
                    </div>
                </div>

                <section className="products-section">
                    <div className="table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredProducts.length > 0 &&
                                                selectedProducts.size ===
                                                    filteredProducts.length
                                            }
                                            onChange={() =>
                                                toggleSelectAll(filteredProducts)
                                            }
                                        />
                                    </th>
                                    <SortableHeader
                                        label="Cod. Produto"
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
                                        label="Descrição"
                                        column="description"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <SortableHeader
                                        label="Preço"
                                        column="price"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <SortableHeader
                                        label="URL da Imagem"
                                        column="imageUrl"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <th>Editar</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.has(
                                                    product.id
                                                )}
                                                onChange={() =>
                                                    toggleSelection(product.id)
                                                }
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>
                                            {product.price.toLocaleString(
                                                "pt-BR",
                                                {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }
                                            )}
                                        </td>
                                        <td>
                                            <a href={product.imageUrl} target="_blank" rel="noopener noreferrer">
                                                Ver Imagem
                                            </a>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() =>
                                                    openEditProductModal(product)
                                                }
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    confirmDelete(product.id)
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                            }}
                                        >
                                            Nenhum produto encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Modal de Formulário */}
            {isModalOpen && (
                <div className="modal-show" style={{ display: "flex" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                {editingId
                                    ? "Editar Produto"
                                    : "Novo Produto"}
                            </h2>
                            <button
                                className="close-modal"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nome *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Descrição</label>
                                    <input
                                        type="text"
                                        id="description"
                                        name="description"
                                        value={formData.description || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price">Preço *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="price"
                                        name="price"
                                        value={formData.price || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="imageUrl">URL da Imagem</label>
                                    <input
                                        type="text"
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl || ""}
                                        onChange={handleFormChange}
                                    />
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
                            <p>Tem certeza que deseja excluir este produto?</p>
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

export default CadastroProduto;