import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useCobrancaManager, usePlanoManager } from "@/hooks/useCobrancaManager";
import { Cobranca, Plano, CobrancaSortColumn, PlanoSortColumn } from "@/types/Cobranca";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroCobranca.css";

// -------------------------------------------------------
// Icons
// -------------------------------------------------------
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

type Tab = 'cobranca' | 'plano';

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
const CadastroCobranca: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('cobranca');
    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <main className="main-content">
                <Header />

                {/* ── Abas ── */}
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === 'cobranca' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cobranca')}
                    >
                        Cobranças
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'plano' ? 'active' : ''}`}
                        onClick={() => setActiveTab('plano')}
                    >
                        Planos de Pagamento
                    </button>
                </div>

                {activeTab === 'cobranca' ? (
                    <CobrancaTab success={success} toastError={toastError} warning={warning} />
                ) : (
                    <PlanoTab success={success} toastError={toastError} warning={warning} />
                )}
            </main>
        </div>
    );
};

// -------------------------------------------------------
// Toast helpers type
// -------------------------------------------------------
interface TabProps {
    success:    (title: string, msg: string) => void;
    toastError: (title: string, msg: string) => void;
    warning:    (title: string, msg: string) => void;
}

// -------------------------------------------------------
// Aba Cobranças
// -------------------------------------------------------
const CobrancaTab: React.FC<TabProps> = ({ success, toastError, warning }) => {
    const {
        cobrancas, selectedCobrancas, sortConfig, loading, error,
        addCobranca, updateCobranca, deleteCobranca,
        toggleSelection, toggleSelectAll, handleSort, getProcessedCobrancas,
        currentPage, setCurrentPage, totalPages, totalItems,
    } = useCobrancaManager();

    const [searchTerm, setSearchTerm]               = useState("");
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId]                 = useState<number | null>(null);
    const [toDelete, setToDelete]                   = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting]           = useState(false);
    const [submitError, setSubmitError]             = useState<string | null>(null);

    const initialForm = { cobranca: "", status: "A" as 'A' | 'I' };
    const [formData, setFormData] = useState(initialForm);

    const filtered = getProcessedCobrancas(searchTerm);

    const openNew = () => { setFormData(initialForm); setEditingId(null); setSubmitError(null); setIsModalOpen(true); };

    const openEdit = (item: Cobranca) => {
        setFormData({ cobranca: item.cobranca, status: item.status });
        setEditingId(item.codcobranca);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!formData.cobranca.trim()) {
            const msg = "Preencha o nome da cobrança.";
            setSubmitError(msg); warning("Campo obrigatório", msg); return;
        }
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateCobranca(editingId, formData);
                success("Cobrança atualizada!", `${formData.cobranca} foi atualizada com sucesso.`);
            } else {
                await addCobranca(formData);
                success("Cobrança cadastrada!", `${formData.cobranca} foi adicionada com sucesso.`);
            }
            setIsModalOpen(false);
            setFormData(initialForm);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar cobrança";
            setSubmitError(msg); toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => { setToDelete(id); setIsDeleteModalOpen(true); };

    const executeDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteCobranca(toDelete);
            setIsDeleteModalOpen(false); setToDelete(null);
            success("Cobrança excluída", "O registro foi removido com sucesso.");
        } catch (err) {
            toastError("Erro ao excluir", err instanceof Error ? err.message : "Erro ao excluir cobrança");
        }
    };

    return (
        <>
            <div className="content-header">
                <div className="search-container">
                    <input type="text" placeholder="Pesquisar cobrança" className="search-input"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="actions">
                    <button className="btn btn-primary" onClick={openNew} disabled={loading}>Nova Cobrança</button>
                </div>
            </div>

            {loading && <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>}
            {error   && <div style={{ padding: "20px", color: "red", textAlign: "center" }}>Erro: {error}</div>}

            <section className="cobranca-section">
                <div className="table-container">
                    <table className="cobranca-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input type="checkbox"
                                        checked={filtered.length > 0 && selectedCobrancas.size === filtered.length}
                                        onChange={() => toggleSelectAll(filtered)} />
                                </th>
                                <SortableHeaderC label="Cód."        column="codcobranca" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderC label="Cobrança"    column="cobranca"    currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderC label="Status"      column="status"      currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderC label="Cadastro"    column="dtcadastro"  currentSort={sortConfig} onSort={handleSort} />
                                <th>Editar</th>
                                <th>Deletar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.codcobranca}>
                                    <td className="checkbox-column">
                                        <input type="checkbox"
                                            checked={selectedCobrancas.has(item.codcobranca)}
                                            onChange={() => toggleSelection(item.codcobranca)} />
                                    </td>
                                    <td>{item.codcobranca}</td>
                                    <td>{item.cobranca}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                    <td>{item.dtcadastro ? new Date(item.dtcadastro).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => openEdit(item)} title="Editar" disabled={isSubmitting}>
                                            <EditIcon />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="action-btn delete-btn" onClick={() => confirmDelete(item.codcobranca)} title="Deletar">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>Nenhuma cobrança encontrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <PaginationFooter currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setCurrentPage={setCurrentPage} />
                </div>
            </section>

            {/* Modal cadastro/edição */}
            {isModalOpen && (
                <div className="modal-show" style={{ display: "flex" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingId ? "Editar Cobrança" : "Nova Cobrança"}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {submitError && <div className="error-message" role="alert">{submitError}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nome da Cobrança *</label>
                                    <input type="text" name="cobranca" value={formData.cobranca}
                                        onChange={handleChange} required maxLength={255} />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="A">Ativo</option>
                                        <option value="I">Inativo</option>
                                    </select>
                                </div>
                                <div className="form-group actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal delete */}
            {isDeleteModalOpen && (
                <ConfirmDeleteModal
                    onConfirm={executeDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    label="esta cobrança"
                />
            )}
        </>
    );
};

// -------------------------------------------------------
// Aba Planos de Pagamento
// -------------------------------------------------------
const PlanoTab: React.FC<TabProps> = ({ success, toastError, warning }) => {
    const {
        planos, selectedPlanos, sortConfig, loading, error,
        addPlano, updatePlano, deletePlano,
        toggleSelection, toggleSelectAll, handleSort, getProcessedPlanos,
        currentPage, setCurrentPage, totalPages, totalItems,
    } = usePlanoManager();

    const [searchTerm, setSearchTerm]               = useState("");
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId]                 = useState<number | null>(null);
    const [toDelete, setToDelete]                   = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting]           = useState(false);
    const [submitError, setSubmitError]             = useState<string | null>(null);

    const initialForm: Omit<Plano, 'codplano' | 'dtcadastro'> = {
        plano: "", status: "A", numdias: 0,
        prazo1: null, prazo2: null, prazo3: null,
        prazo4: null, prazo5: null, prazo6: null,
    };
    const [formData, setFormData] = useState<typeof initialForm>(initialForm);

    const filtered = getProcessedPlanos(searchTerm);

    const openNew = () => { setFormData(initialForm); setEditingId(null); setSubmitError(null); setIsModalOpen(true); };

    const openEdit = (item: Plano) => {
        setFormData({
            plano: item.plano, status: item.status, numdias: item.numdias,
            prazo1: item.prazo1 ?? null, prazo2: item.prazo2 ?? null,
            prazo3: item.prazo3 ?? null, prazo4: item.prazo4 ?? null,
            prazo5: item.prazo5 ?? null, prazo6: item.prazo6 ?? null,
        });
        setEditingId(item.codplano);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? null : Number(value)) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!formData.plano.trim()) {
            const msg = "Preencha o nome do plano.";
            setSubmitError(msg); warning("Campo obrigatório", msg); return;
        }
        if (formData.numdias <= 0) {
            const msg = "Informe um número de dias válido (maior que 0).";
            setSubmitError(msg); warning("Número de dias inválido", msg); return;
        }
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updatePlano(editingId, formData);
                success("Plano atualizado!", `${formData.plano} foi atualizado com sucesso.`);
            } else {
                await addPlano(formData);
                success("Plano cadastrado!", `${formData.plano} foi adicionado com sucesso.`);
            }
            setIsModalOpen(false);
            setFormData(initialForm);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar plano";
            setSubmitError(msg); toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => { setToDelete(id); setIsDeleteModalOpen(true); };

    const executeDelete = async () => {
        if (!toDelete) return;
        try {
            await deletePlano(toDelete);
            setIsDeleteModalOpen(false); setToDelete(null);
            success("Plano excluído", "O registro foi removido com sucesso.");
        } catch (err) {
            toastError("Erro ao excluir", err instanceof Error ? err.message : "Erro ao excluir plano");
        }
    };

    return (
        <>
            <div className="content-header">
                <div className="search-container">
                    <input type="text" placeholder="Pesquisar plano" className="search-input"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="actions">
                    <button className="btn btn-primary" onClick={openNew} disabled={loading}>Novo Plano</button>
                </div>
            </div>

            {loading && <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>}
            {error   && <div style={{ padding: "20px", color: "red", textAlign: "center" }}>Erro: {error}</div>}

            <section className="cobranca-section">
                <div className="table-container">
                    <table className="plano-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input type="checkbox"
                                        checked={filtered.length > 0 && selectedPlanos.size === filtered.length}
                                        onChange={() => toggleSelectAll(filtered)} />
                                </th>
                                <SortableHeaderP label="Cód."     column="codplano"  currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderP label="Plano"    column="plano"     currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderP label="Dias"     column="numdias"   currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderP label="Status"   column="status"    currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeaderP label="Cadastro" column="dtcadastro" currentSort={sortConfig} onSort={handleSort} />
                                <th>Prazos</th>
                                <th>Editar</th>
                                <th>Deletar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.codplano}>
                                    <td className="checkbox-column">
                                        <input type="checkbox"
                                            checked={selectedPlanos.has(item.codplano)}
                                            onChange={() => toggleSelection(item.codplano)} />
                                    </td>
                                    <td>{item.codplano}</td>
                                    <td>{item.plano}</td>
                                    <td>{item.numdias}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                    <td>{item.dtcadastro ? new Date(item.dtcadastro).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                        {[item.prazo1, item.prazo2, item.prazo3, item.prazo4, item.prazo5, item.prazo6]
                                            .filter((p) => p != null)
                                            .join(' / ') || '-'}
                                    </td>
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => openEdit(item)} title="Editar" disabled={isSubmitting}>
                                            <EditIcon />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="action-btn delete-btn" onClick={() => confirmDelete(item.codplano)} title="Deletar">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr><td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>Nenhum plano encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <PaginationFooter currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setCurrentPage={setCurrentPage} />
                </div>
            </section>

            {/* Modal cadastro/edição plano */}
            {isModalOpen && (
                <div className="modal-show" style={{ display: "flex" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingId ? "Editar Plano" : "Novo Plano de Pagamento"}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {submitError && <div className="error-message" role="alert">{submitError}</div>}
                            <form onSubmit={handleSubmit}>

                                <p className="form-section-title">Dados do Plano</p>

                                <div className="form-group-row">
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label>Nome do Plano *</label>
                                        <input type="text" name="plano" value={formData.plano}
                                            onChange={handleChange} required maxLength={255} />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            <option value="A">Ativo</option>
                                            <option value="I">Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Número de Dias *</label>
                                    <input type="number" name="numdias" value={formData.numdias ?? ''}
                                        onChange={handleChange} required min={1} />
                                </div>

                                <p className="form-section-title">Prazos (dias) — opcional</p>

                                <div className="prazos-grid">
                                    {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                                        <div className="form-group" key={n}>
                                            <label>Prazo {n}</label>
                                            <input
                                                type="number"
                                                name={`prazo${n}`}
                                                value={(formData as any)[`prazo${n}`] ?? ''}
                                                onChange={handleChange}
                                                min={0}
                                                placeholder="—"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <ConfirmDeleteModal onConfirm={executeDelete} onCancel={() => setIsDeleteModalOpen(false)} label="este plano de pagamento" />
            )}
        </>
    );
};

// -------------------------------------------------------
// Componentes auxiliares reutilizáveis
// -------------------------------------------------------
const StatusBadge: React.FC<{ status: 'A' | 'I' }> = ({ status }) => (
    <span style={{
        padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "500",
        backgroundColor: status === 'A' ? '#d4edda' : '#f8d7da',
        color:           status === 'A' ? '#155724' : '#721c24',
    }}>
        {status === 'A' ? 'Ativo' : 'Inativo'}
    </span>
);

const PaginationFooter: React.FC<{
    currentPage: number; totalPages: number; totalItems: number;
    setCurrentPage: (fn: (p: number) => number) => void;
}> = ({ currentPage, totalPages, totalItems, setCurrentPage }) => (
    <div className="pagination-footer">
        <span className="pagination-info">
            Exibindo página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} registros)
        </span>
        <div className="pagination-actions">
            <button className="btn btn-secondary" disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Anterior</button>
            <button className="btn btn-secondary" disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>Próxima</button>
        </div>
    </div>
);

const ConfirmDeleteModal: React.FC<{ onConfirm: () => void; onCancel: () => void; label: string }> = ({ onConfirm, onCancel, label }) => (
    <div className="modal-show" style={{ display: "flex" }}>
        <div className="modal-content">
            <div className="modal-header">
                <h2>Confirmar Exclusão</h2>
                <button className="close-modal" onClick={onCancel}>&times;</button>
            </div>
            <div className="modal-body">
                <p>Tem certeza que deseja excluir {label}?</p>
                <div className="form-group actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="button" className="btn btn-danger"    onClick={onConfirm}>Excluir</button>
                </div>
            </div>
        </div>
    </div>
);

const SortableHeaderC: React.FC<{
    label: string; column: CobrancaSortColumn;
    currentSort: { column: CobrancaSortColumn; direction: 'asc' | 'desc' };
    onSort: (c: CobrancaSortColumn) => void;
}> = ({ label, column, currentSort, onSort }) => {
    const isActive = currentSort.column === column;
    return (
        <th className={`sortable ${isActive ? currentSort.direction : ''}`} onClick={() => onSort(column)} style={{ cursor: "pointer" }}>
            {label} {isActive && (currentSort.direction === 'asc' ? '↑' : '↓')}
        </th>
    );
};

const SortableHeaderP: React.FC<{
    label: string; column: PlanoSortColumn;
    currentSort: { column: PlanoSortColumn; direction: 'asc' | 'desc' };
    onSort: (c: PlanoSortColumn) => void;
}> = ({ label, column, currentSort, onSort }) => {
    const isActive = currentSort.column === column;
    return (
        <th className={`sortable ${isActive ? currentSort.direction : ''}`} onClick={() => onSort(column)} style={{ cursor: "pointer" }}>
            {label} {isActive && (currentSort.direction === 'asc' ? '↑' : '↓')}
        </th>
    );
};

export default CadastroCobranca;
