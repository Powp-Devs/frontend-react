import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useSectorManager } from "@/hooks/useSectorManager";
import { Sector, SortColumn } from "@/types/Sector";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroSetor.css";

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
const CadastroSetor: React.FC = () => {
    const {
        sectors,
        selectedSectors,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addSector,
        updateSector,
        deleteSector,
        getSector,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedSectors,
    } = useSectorManager();

    // ── Toast ──────────────────────────────────────────────
    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    // ── Estado local ───────────────────────────────────────
    const [searchTerm, setSearchTerm]                   = useState("");
    const [isModalOpen, setIsModalOpen]                 = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen]     = useState(false);
    const [editingId, setEditingId]                     = useState<number | null>(null);
    const [sectorToDelete, setSectorToDelete]           = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting]               = useState(false);
    const [submitError, setSubmitError]                 = useState<string | null>(null);

    // ── Estado inicial do formulário
    const initialFormState: Partial<Sector> = {
        setor:   "",
        status:  "A",
    };

    const [formData, setFormData] = useState<Partial<Sector>>(initialFormState);

    const filteredSectors = getProcessedSectors(searchTerm);

    // ── Handlers do modal ──────────────────────────────────
    const openNewSectorModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditSectorModal = (sector: Sector) => {
        setIsSubmitting(true);
        getSector(sector.codsetor)
            .then((fullData) => {
                setFormData(fullData);
                setEditingId(sector.codsetor);
                setSubmitError(null);
                setIsModalOpen(true);
            })
            .catch((err) => {
                const msg = err instanceof Error
                    ? err.message
                    : "Erro ao carregar dados do setor";
                toastError("Erro ao abrir edição", msg);
            })
            .finally(() => setIsSubmitting(false));
    };

    // Trata input e select com um único handler
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]: checked ? "A" : "I",
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // ── Submit ─────────────────────────────────────────────
    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validação — campos obrigatórios
        if (!formData.setor) {
            const msg = "Preencha o nome do setor.";
            setSubmitError(msg);
            warning("Campo obrigatório", msg);
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateSector(editingId, formData as any);
                success(
                    "Setor atualizado!",
                    `${formData.setor} foi atualizado com sucesso.`
                );
            } else {
                await addSector(formData as any);
                success(
                    "Setor cadastrado!",
                    `${formData.setor} foi adicionado com sucesso.`
                );
            }

            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar setor";
            setSubmitError(msg);
            toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const confirmDelete = (codsetor: number) => {
        setSectorToDelete(codsetor);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!sectorToDelete) return;

        try {
            await deleteSector(sectorToDelete);
            setIsDeleteModalOpen(false);
            setSectorToDelete(null);
            success("Setor excluído", "O registro foi removido com sucesso.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao excluir setor";
            toastError("Erro ao excluir", msg);
        }
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header />

                {/* Sub-header */}
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
                            placeholder="Pesquisar por nome do setor"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={exportToCSV}
                            disabled={loading || sectors.length === 0}
                        >
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openNewSectorModal}
                            disabled={loading}
                        >
                            Novo Setor
                        </button>
                    </div>
                </div>

                {/* Feedback de loading / erro da listagem */}
                {loading && (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        Carregando...
                    </div>
                )}
                {error && (
                    <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
                        Erro: {error}
                    </div>
                )}

                {/* Tabela */}
                <section className="sectors-section">
                    <div className="table-container">
                        <table className="sectors-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredSectors.length > 0 &&
                                                selectedSectors.size === filteredSectors.length
                                            }
                                            onChange={() => toggleSelectAll(filteredSectors)}
                                        />
                                    </th>
                                    <SortableHeader label="Cód." column="codsetor" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Setor" column="setor" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Status" column="status" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Data de Cadastro" column="dtcadastro" currentSort={sortConfig} onSort={handleSort} />
                                    <th>Editar</th>
                                    <th>Deletar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSectors.map((sector) => (
                                    <tr key={sector.codsetor}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedSectors.has(sector.codsetor)}
                                                onChange={() => toggleSelection(sector.codsetor)}
                                            />
                                        </td>
                                        <td>{sector.codsetor}</td>
                                        <td>{sector.setor}</td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    backgroundColor: sector.status === 'A' ? '#d4edda' : '#f8d7da',
                                                    color: sector.status === 'A' ? '#155724' : '#721c24',
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500"
                                                }}
                                            >
                                                {sector.status === 'A' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>{new Date(sector.dtcadastro).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => openEditSectorModal(sector)}
                                                title="Editar"
                                                disabled={isSubmitting}
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => confirmDelete(sector.codsetor)}
                                                title="Deletar"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSectors.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{ textAlign: "center", padding: "20px" }}
                                        >
                                            Nenhum setor encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Modal cadastro / edição ───────────────────────── */}
                {isModalOpen && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>
                                    {editingId ? "Editar Setor" : "Novo Setor"}
                                </h2>
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
                                    <div className="error-message" role="alert">
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleFormSubmit}>

                                    {/* ── Dados do Setor ───────────────────────── */}
                                    <div className="form-group">
                                        <label>Nome do Setor *</label>
                                        <input
                                            type="text"
                                            name="setor"
                                            value={formData.setor || ""}
                                            onChange={handleFormChange}
                                            required
                                            maxLength={255}
                                        />
                                    </div>

                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            checked={formData.status === 'A'}
                                            onChange={handleFormChange}
                                        />
                                        <label htmlFor="status" style={{ margin: 0, cursor: 'pointer' }}>
                                            Setor Ativo
                                        </label>
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
                                            disabled={isSubmitting}
                                        >
                                            Salvar
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
                                <p>Tem certeza que deseja excluir este setor?</p>
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
// SortableHeader — idêntico ao padrão de CadastroFornecedor
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

export default CadastroSetor;
