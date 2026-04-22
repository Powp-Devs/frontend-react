import React, {useState, FormEvent, useEffect} from "react";
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
        fornecedores
    } = useProductManager();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const initialFormState: Partial<Product> = {
        produto: "",
        obs: "",
        embalagem: "",
        sku: "",
        ean: "",
        status: "A",
        custo: 0,
        preco_venda: 0,
        margem: 0,
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
        setEditingId(product.codproduto);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let valorTratado: string | number = value;

        if (type === 'number' || name === 'custo' || name === 'preco_venda') {
            valorTratado = value === '' ? 0 : Number(value.replace(',', '.'));
  }

        setFormData((prev) => ({
            ...prev,
            [name]: valorTratado
        }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!formData.produto || !formData.preco_venda) {
            alert("Nome e preço são obrigatórios.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const dataToSend = {
                ...formData,
                obs: formData.obs || " ",
            };

        if (editingId) {
            alert("Produto atualizado com sucesso!");
            updateProduct(editingId, dataToSend);
        } else {
            await addProduct(dataToSend as any);
        }
        setIsModalOpen(false);
        setFormData(initialFormState);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar produto');
        } finally {
            setIsSubmitting(false);
        }
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
    useEffect(() => {
        const custo = formData.custo || 0;
        const preco = formData.preco_venda || 0;

        if (custo > 0 && preco > 0) {
            const lucro = preco - custo;
            const porcentagemMargem = (lucro / preco) * 100;

        setFormData(prevData => ({
            ...prevData,
            margem: parseFloat(porcentagemMargem.toFixed(2))
        }));
    }
}, [formData.custo, formData.preco_venda]);

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
                                        label="Cod. Fornecedor"
                                        column="codfornecedor"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <SortableHeader
                                        label="Produto"
                                        column="produto"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <SortableHeader
                                        label="Observação"
                                        column="obs"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <SortableHeader
                                        label="Preço de Venda"
                                        column="preco_venda"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />
                                    <th>Editar</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.codproduto}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.has(
                                                    product.codproduto
                                                )}
                                                onChange={() =>
                                                    toggleSelection(product.codproduto)
                                                }
                                            />
                                        </td>
                                        <td>{product.codproduto}</td>
                                        <td>{product.produto}</td>
                                        <td>{product.obs}</td>
                                        <td>
                                            {product.preco_venda?.toLocaleString(
                                                "pt-BR",
                                                {
                                                    style: "currency", 
                                                    currency: "BRL",
                                                }
                                            ) || "R$ 0,00"}
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
                                                    confirmDelete(product.codproduto)
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
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
                                    <label htmlFor="produto">Produto *</label>
                                    <input
                                        type="text"
                                        id="produto"
                                        name="produto"
                                        value={formData.produto || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="observacao">Observação</label>
                                    <input
                                        type="text"
                                        id="observacao"
                                        name="obs"
                                        value={formData.obs || " "}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="embalagem">Embalagem *</label>
                                    <input
                                        type="text"
                                        id="embalagem"
                                        name="embalagem"
                                        value={formData.embalagem || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>   
                                <div className="form-group">
                                    <label htmlFor="sku">SKU *</label>
                                    <input
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        value={formData.sku || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="unidade">Unidade *</label>
                                    <input
                                        type="text"
                                        id="unidade"
                                        name="unidade"
                                        value={formData.unidade || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>      

                                <div className="form-group">
                                    <label htmlFor="gtin">GTIN *</label>
                                    <input
                                        type="text"
                                        id="gtin"
                                        name="gtin"
                                        value={formData.gtin || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ean">EAN *</label>
                                    <input
                                        type="text"
                                        id="ean"
                                        name="ean"
                                        value={formData.ean || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="status"
                                        name="status"
                                        checked={formData.status === 'A'} 
                                        
                                        onChange={(event) => {
                                            setFormData(prevData => ({
                                                ...prevData,
                                                status: event.target.checked ? 'A' : 'I'
                                            }));
                                        }}
                                    />
                                    <label htmlFor="status" style={{ margin: 0, cursor: 'pointer' }}>
                                        Produto Ativo
                                    </label>
                                <div className="form-group">
                                    <label htmlFor="fornecedor">Fornecedor *</label>
                                    <select
                                        id="fornecedor"
                                        name="fornecedor"
                                        value={formData.codfornecedor || ""}
                                        onChange={(e) => setFormData({ ...formData, codfornecedor: Number(e.target.value) })}
                                        required
                                    >
                                        <option value="" disabled>Selecione um fornecedor...</option>
                                        {fornecedores.map((fornecedor) => (
                                            <option key={fornecedor.codfornecedor} value={fornecedor.codfornecedor}>
                                                {fornecedor.fornecedor}
                                            </option>
                                            ))}
                                    </select>
                                </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="custo">Custo *</label>
                                    <input
                                        type="text"
                                        id="custo"
                                        name="custo"
                                        value={formData.custo || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preco_venda">Preço *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="preco_venda"
                                        name="preco_venda"
                                        value={formData.preco_venda || ""}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="margem">Margem de Lucro (%)</label>
                                    <input
                                        type="number"
                                        id="margem"
                                        name="margem"
                                        value={formData.margem || 0}
                                        readOnly 
                                        className="input-bloqueado" 
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