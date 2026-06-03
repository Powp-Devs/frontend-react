import React, { useState, FormEvent } from 'react';
import Header from '@/shared/components/layout/Header';
import { useEstoqueManager } from '@/hooks/useEstoqueManager';
import { EstoqueItem, EstoqueUpdatePayload } from '@/types/Estoque';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ToastContainer';
import '@/styles/controleEstoque.css';

// ── Icones ─────────────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtNum(val: number) {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(val: string | null) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Componente principal ───────────────────────────────────────────────────
const ControleEstoque: React.FC = () => {
    const {
        itens, loading, error,
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        currentPage, setCurrentPage,
        totalPages, total,
        totalCritico, totalBaixo,
        getStatus, atualizar, excluir, carregar,
    } = useEstoqueManager();

    const { toasts, removeToast, success, error: toastError } = useToast();

    // ── Estado dos modais ────────────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem]           = useState<EstoqueItem | null>(null);
    const [isSubmitting, setIsSubmitting]           = useState(false);

    const [editForm, setEditForm] = useState<EstoqueUpdatePayload & { novoEstoque?: number }>({
        estoque: 0,
        estoque_minimo: 0,
        obs: '',
    });

    // ── Abrir modais ─────────────────────────────────────────────────────────
    const openEdit = (item: EstoqueItem) => {
        setSelectedItem(item);
        setEditForm({
            estoque:        item.estoque,
            estoque_minimo: item.estoque_minimo,
            obs:            '',
        });
        setIsEditModalOpen(true);
    };

    const openDetail = (item: EstoqueItem) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const openDelete = (item: EstoqueItem) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    // ── Submit editar ────────────────────────────────────────────────────────
    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        if (editForm.estoque === undefined || editForm.estoque < 0) {
            toastError('Valor invalido', 'O estoque nao pode ser negativo.');
            return;
        }

        setIsSubmitting(true);
        try {
            await atualizar(selectedItem.codproduto, editForm);
            success('Estoque atualizado', `${selectedItem.produto || `Produto #${selectedItem.codproduto}`} atualizado com sucesso.`);
            setIsEditModalOpen(false);
        } catch (err) {
            toastError('Erro ao atualizar', err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Confirmar excluir ────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await excluir(selectedItem.codproduto);
            success('Estoque removido', `Estoque do produto #${selectedItem.codproduto} removido.`);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toastError('Erro ao excluir', err instanceof Error ? err.message : 'Erro desconhecido');
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNum = ['estoque', 'estoque_minimo'].includes(name);
        setEditForm(prev => ({ ...prev, [name]: isNum ? (value === '' ? 0 : Number(value)) : value }));
    };

    // ── Estoque disponivel ───────────────────────────────────────────────────
    const calcDisponivel = (item: EstoqueItem) =>
        Math.max(0, item.estoque - item.estoque_reservado - item.estoque_bloqueado);

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header />

                {/* ── Toolbar ─────────────────────────────────────────────── */}
                <div className="page-toolbar">
                    <div className="toolbar-left">
                        <div className="search-container">
                            <SearchIcon />
                            <input type="text" placeholder="Buscar por produto, SKU ou codigo..."
                                className="search-input" value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="filter-tabs">
                            {(['todos', 'baixo', 'critico'] as const).map(f => (
                                <button key={f} type="button"
                                    className={`filter-tab ${filterStatus === f ? 'active' : ''} ${f !== 'todos' ? f : ''}`}
                                    onClick={() => setFilterStatus(f)}>
                                    {f === 'todos' ? 'Todos' : f === 'baixo' ? `Abaixo do minimo (${totalBaixo})` : `Critico (${totalCritico})`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-outline btn-icon" onClick={carregar} title="Atualizar">
                        <RefreshIcon /> Atualizar
                    </button>
                </div>

                {/* ── Cards de resumo ──────────────────────────────────────── */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="summary-icon neutral"><BoxIcon /></div>
                        <div className="summary-info">
                            <span className="summary-value">{total}</span>
                            <span className="summary-label">Itens cadastrados</span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon normal"><BoxIcon /></div>
                        <div className="summary-info">
                            <span className="summary-value">{itens.filter(i => getStatus(i) === 'normal').length}</span>
                            <span className="summary-label">Em estoque normal</span>
                        </div>
                    </div>
                    <div className="summary-card warning">
                        <div className="summary-icon warn"><WarningIcon /></div>
                        <div className="summary-info">
                            <span className="summary-value">{totalBaixo}</span>
                            <span className="summary-label">Abaixo do minimo</span>
                        </div>
                    </div>
                    <div className="summary-card danger">
                        <div className="summary-icon crit"><WarningIcon /></div>
                        <div className="summary-info">
                            <span className="summary-value">{totalCritico}</span>
                            <span className="summary-label">Critico / Zerado</span>
                        </div>
                    </div>
                </div>

                {/* ── Tabela ───────────────────────────────────────────────── */}
                <section className="estoque-section">
                    {error && <div className="error-banner">{error}</div>}

                    <div className="table-container">
                        <table className="estoque-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>SKU</th>
                                    <th className="col-num">Estoque</th>
                                    <th className="col-num">Minimo</th>
                                    <th className="col-num">Reservado</th>
                                    <th className="col-num">Bloqueado</th>
                                    <th className="col-num">Disponivel</th>
                                    <th>Status</th>
                                    <th>Ult. Entrada</th>
                                    <th>Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={10} className="loading-row">Carregando...</td></tr>
                                )}
                                {!loading && itens.length === 0 && (
                                    <tr><td colSpan={10} className="empty-row">Nenhum item encontrado.</td></tr>
                                )}
                                {!loading && itens.map(item => {
                                    const status = getStatus(item);
                                    const disponivel = calcDisponivel(item);
                                    return (
                                        <tr key={item.codestoque} className={`row-${status}`}
                                            onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <div className="cell-product">
                                                    <span className="product-name">{item.produto || `Produto #${item.codproduto}`}</span>
                                                    <span className="product-code">#{item.codproduto}</span>
                                                </div>
                                            </td>
                                            <td className="cell-muted">{item.sku || '—'}</td>
                                            <td className="col-num"><strong>{fmtNum(item.estoque)}</strong></td>
                                            <td className="col-num cell-muted">{fmtNum(item.estoque_minimo)}</td>
                                            <td className="col-num cell-reserved">{fmtNum(item.estoque_reservado)}</td>
                                            <td className="col-num cell-blocked">{fmtNum(item.estoque_bloqueado)}</td>
                                            <td className="col-num">
                                                <span className={`disponivel-badge ${status}`}>{fmtNum(disponivel)}</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${status}`}>
                                                    {status === 'normal' ? 'Normal' : status === 'baixo' ? 'Baixo' : 'Critico'}
                                                </span>
                                            </td>
                                            <td className="cell-muted">{fmtDate(item.data_ultent)}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="row-actions">
                                                    <button className="action-btn edit-btn" title="Editar estoque"
                                                        onClick={() => openEdit(item)}><EditIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginacao */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="btn btn-outline btn-sm" disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                            <span className="page-info">Pagina {currentPage} de {totalPages}</span>
                            <button className="btn btn-outline btn-sm" disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}>Proxima</button>
                        </div>
                    )}
                </section>
            </main>

            {/* ── Modal: Editar estoque ────────────────────────────────────── */}
            {isEditModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content estoque-modal">
                        <div className="modal-header-top">
                            <div>
                                <h2>Ajustar Estoque</h2>
                                <p className="modal-subtitle">
                                    {selectedItem.produto || `Produto #${selectedItem.codproduto}`}
                                    {selectedItem.sku && <span className="modal-sku"> — {selectedItem.sku}</span>}
                                </p>
                            </div>
                            <button className="close-modal" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                        </div>

                        {/* Painel de situacao atual */}
                        <div className="current-stock-panel">
                            <div className="stock-stat">
                                <span className="stock-stat-label">Estoque atual</span>
                                <span className="stock-stat-value">{fmtNum(selectedItem.estoque)}</span>
                            </div>
                            <div className="stock-stat">
                                <span className="stock-stat-label">Reservado</span>
                                <span className="stock-stat-value warn">{fmtNum(selectedItem.estoque_reservado)}</span>
                            </div>
                            <div className="stock-stat">
                                <span className="stock-stat-label">Bloqueado</span>
                                <span className="stock-stat-value danger">{fmtNum(selectedItem.estoque_bloqueado)}</span>
                            </div>
                            <div className="stock-stat">
                                <span className="stock-stat-label">Disponivel</span>
                                <span className="stock-stat-value success">{fmtNum(calcDisponivel(selectedItem))}</span>
                            </div>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleEditSubmit} noValidate>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label htmlFor="estoque">Novo Estoque <span className="required">*</span></label>
                                        <input type="number" id="estoque" name="estoque" min="0" step="0.01"
                                            value={editForm.estoque ?? 0}
                                            onChange={handleEditChange} />
                                        {(editForm.estoque ?? 0) !== selectedItem.estoque && (
                                            <small className={`field-hint ${(editForm.estoque ?? 0) > selectedItem.estoque ? 'hint-entrada' : 'hint-saida'}`}>
                                                {(editForm.estoque ?? 0) > selectedItem.estoque
                                                    ? `Entrada de ${fmtNum((editForm.estoque ?? 0) - selectedItem.estoque)} unidades`
                                                    : `Saida de ${fmtNum(selectedItem.estoque - (editForm.estoque ?? 0))} unidades`}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="estoque_minimo">Estoque Minimo</label>
                                        <input type="number" id="estoque_minimo" name="estoque_minimo" min="0" step="0.01"
                                            value={editForm.estoque_minimo ?? 0}
                                            onChange={handleEditChange} />
                                        <small className="field-hint">Alerta quando o disponivel ficar abaixo deste valor.</small>
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="obs">Motivo / Observacao <span className="required">*</span></label>
                                        <textarea id="obs" name="obs" rows={3}
                                            value={editForm.obs ?? ''}
                                            onChange={handleEditChange}
                                            placeholder="Ex: Recontagem de inventario, recebimento NF 1234..." />
                                        <small className="field-hint">O sistema ira gerar um log automatico da movimentacao.</small>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                        onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Salvando...' : 'Salvar Ajuste'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Detalhe ───────────────────────────────────────────── */}
            {isDetailModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content detail-modal">
                        <div className="modal-header-top">
                            <div>
                                <h2>Detalhe do Estoque</h2>
                                <p className="modal-subtitle">
                                    {selectedItem.produto || `Produto #${selectedItem.codproduto}`}
                                </p>
                            </div>
                            <button className="close-modal" onClick={() => setIsDetailModalOpen(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Cod. Produto</span>
                                    <span className="detail-value">#{selectedItem.codproduto}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Cod. Estoque</span>
                                    <span className="detail-value">#{selectedItem.codestoque}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">SKU</span>
                                    <span className="detail-value">{selectedItem.sku || '—'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className={`status-pill ${getStatus(selectedItem)}`}>
                                        {getStatus(selectedItem) === 'normal' ? 'Normal' : getStatus(selectedItem) === 'baixo' ? 'Baixo' : 'Critico'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Estoque total</span>
                                    <span className="detail-value highlight">{fmtNum(selectedItem.estoque)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Estoque minimo</span>
                                    <span className="detail-value">{fmtNum(selectedItem.estoque_minimo)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Reservado</span>
                                    <span className="detail-value warn">{fmtNum(selectedItem.estoque_reservado)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Bloqueado</span>
                                    <span className="detail-value danger">{fmtNum(selectedItem.estoque_bloqueado)}</span>
                                </div>
                                <div className="detail-item full">
                                    <span className="detail-label">Disponivel para venda</span>
                                    <span className="detail-value highlight success">{fmtNum(calcDisponivel(selectedItem))}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Data de cadastro</span>
                                    <span className="detail-value">{fmtDate(selectedItem.data_cadastro)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Ultima entrada</span>
                                    <span className="detail-value">{fmtDate(selectedItem.data_ultent)}</span>
                                </div>
                                {selectedItem.obs && (
                                    <div className="detail-item full">
                                        <span className="detail-label">Observacao</span>
                                        <span className="detail-value">{selectedItem.obs}</span>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"
                                    onClick={() => setIsDetailModalOpen(false)}>Fechar</button>
                                <button type="button" className="btn btn-primary"
                                    onClick={() => { setIsDetailModalOpen(false); openEdit(selectedItem); }}>
                                    <EditIcon /> Ajustar Estoque
                                </button>
                                <button type="button" className="btn btn-danger"
                                    onClick={() => { setIsDetailModalOpen(false); openDelete(selectedItem); }}>
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Confirmar exclusao ────────────────────────────────── */}
            {isDeleteModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <div className="modal-header-top">
                            <h2>Remover Estoque</h2>
                            <button className="close-modal" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-warning">
                                <span className="delete-icon">⚠️</span>
                                <p>Deseja remover o controle de estoque de <strong>{selectedItem.produto || `Produto #${selectedItem.codproduto}`}</strong>? Esta acao nao pode ser desfeita.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Remover</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControleEstoque;
