import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useCategoryManager } from "@/hooks/useCategoryManager";
import { Category, SortColumn } from "@/types/Category";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroCategoria.css";

// -------------------------------------------------------
// Icons
// -------------------------------------------------------
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
const CadastroCategoria: React.FC = () => {
    const {
        categories,
        selectedCategories,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedCategories,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
    } = useCategoryManager();

    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    const [searchTerm, setSearchTerm]               = useState("");
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId]                 = useState<number | null>(null);
    const [categoryToDelete, setCategoryToDelete]   = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting]           = useState(false);
    const [submitError, setSubmitError]             = useState<string | null>(null);

    const initialFormState: Partial<Category> = {
        categoria: "",
        status:    "A",
    };

    const [formData, setFormData] = useState<Partial<Category>>(initialFormState);

    const filteredCategories = getProcessedCategories(searchTerm);

    // ── Handlers do modal ──────────────────────────────────
    const openNewCategoryModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditCategoryModal = (category: Category) => {
        setIsSubmitting(true);
        getCategory(category.codcategoria)
            .then((fullData) => {
                setFormData(fullData);
                setEditingId(category.codcategoria);
                setSubmitError(null);
                setIsModalOpen(true);
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : "Erro ao carregar dados da categoria";
                toastError("Erro ao abrir edição", msg);
            })
            .finally(() => setIsSubmitting(false));
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked ? "A" : "I" }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // ── Submit ─────────────────────────────────────────────
    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!formData.categoria?.trim()) {
            const msg = "Preencha o nome da categoria.";
            setSubmitError(msg);
            warning("Campo obrigatório", msg);
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateCategory(editingId, formData as any);
                success("Categoria atualizada!", `${formData.categoria} foi atualizada com sucesso.`);
            } else {
                await addCategory({ categoria: formData.categoria! });
                success("Categoria cadastrada!", `${formData.categoria} foi adicionada com sucesso.`);
            }
            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar categoria";
            setSubmitError(msg);
            toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const confirmDelete = (codcategoria: number) => {
        setCategoryToDelete(codcategoria);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete);
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            success("Categoria excluída", "O registro foi removido com sucesso.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao excluir categoria";
            toastError("Erro ao excluir", msg);
        }
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header />

                <div className="content-header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Pesquisar por nome da categoria"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={exportToCSV}
                            disabled={loading || categories.length === 0}
                        >
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openNewCategoryModal}
                            disabled={loading}
                        >
                            Nova Categoria
                        </button>
                    </div>
                </div>

                {loading && (
                    <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
                )}
                {error && (
                    <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
                        Erro: {error}
                    </div>
                )}

                <section className="categories-section">
                    <div className="table-container">
                        <table className="categories-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredCategories.length > 0 &&
                                                selectedCategories.size === filteredCategories.length
                                            }
                                            onChange={() => toggleSelectAll(filteredCategories)}
                                        />
                                    </th>
                                    <SortableHeader label="Cód."             column="codcategoria" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Categoria"        column="categoria"    currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Status"           column="status"       currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Data de Cadastro" column="dtcadastro"   currentSort={sortConfig} onSort={handleSort} />
                                    <th>Editar</th>
                                    <th>Deletar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((category) => (
                                    <tr key={category.codcategoria}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.has(category.codcategoria)}
                                                onChange={() => toggleSelection(category.codcategoria)}
                                            />
                                        </td>
                                        <td>{category.codcategoria}</td>
                                        <td>{category.categoria}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                backgroundColor: category.status === 'A' ? '#d4edda' : '#f8d7da',
                                                color: category.status === 'A' ? '#155724' : '#721c24',
                                                fontSize: "0.85rem",
                                                fontWeight: "500",
                                            }}>
                                                {category.status === 'A' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>{new Date(category.dtcadastro).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => openEditCategoryModal(category)}
                                                title="Editar"
                                                disabled={isSubmitting}
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => confirmDelete(category.codcategoria)}
                                                title="Deletar"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                                            Nenhuma categoria encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="pagination-footer">
                            <span className="pagination-info">
                                Exibindo página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} registros)
                            </span>
                            <div className="pagination-actions">
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                >
                                    Anterior
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Modal cadastro / edição ───────────────────────── */}
                {isModalOpen && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{editingId ? "Editar Categoria" : "Nova Categoria"}</h2>
                                <button
                                    className="close-modal"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="modal-body">
                                {submitError && (
                                    <div className="error-message" role="alert">{submitError}</div>
                                )}

                                <form onSubmit={handleFormSubmit}>
                                    <div className="form-group">
                                        <label>Nome da Categoria *</label>
                                        <input
                                            type="text"
                                            name="categoria"
                                            value={formData.categoria || ""}
                                            onChange={handleFormChange}
                                            required
                                            maxLength={255}
                                        />
                                    </div>

                                    {editingId && (
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="checkbox"
                                                id="status"
                                                name="status"
                                                checked={formData.status === 'A'}
                                                onChange={handleFormChange}
                                            />
                                            <label htmlFor="status" style={{ margin: 0, cursor: 'pointer' }}>
                                                Categoria Ativa
                                            </label>
                                        </div>
                                    )}

                                    <div className="form-group actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsModalOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Salvando..." : "Salvar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Modal confirmação delete ──────────────────────── */}
                {isDeleteModalOpen && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Confirmar exclusão</h2>
                                <button
                                    className="close-modal"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Tem certeza que deseja excluir esta categoria?</p>
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
        </div>
    );
};

// -------------------------------------------------------
// SortableHeader
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

export default CadastroCategoria;
