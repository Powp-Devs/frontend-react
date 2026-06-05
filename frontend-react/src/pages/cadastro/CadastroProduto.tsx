import React, { useState, FormEvent, useEffect } from "react";
import Header from "@/shared/components/layout/Header";
import { useProductManager } from "@/hooks/useProductManager";
import { Product, SortColumn } from "@/types/Product";
import "@/styles/cadastroProduto.css";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import api from "@/services/api";

// ── Icones ─────────────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// ── Tipos ──────────────────────────────────────────────────────────────────
type ActiveTab = 'dados' | 'precificacao' | 'estoque';

interface Categoria {
    codcategoria: number;
    categoria: string;
    status: string;
}

type FormState = Partial<Product> & {
    estoque?: number;
    estoque_minimo?: number;
};

const INITIAL_FORM: FormState = {
    produto: "",
    sku: "",
    embalagem: "",
    unidade: "",
    gtin: "",
    ean: "",
    status: "A",
    obs: "",
    codfornecedor: 0,
    codcategoria: 0,
    custo: 0,
    preco_venda: 0,
    margem: 0,
    estoque: 0,
    estoque_minimo: 0,
};

// ── Componente principal ───────────────────────────────────────────────────
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
        fornecedores,
        currentPage,
        setCurrentPage,
        totalPages, 
        totalItems
    } = useProductManager();

    const { toasts, removeToast, success, error: toastError } = useToast();

    // ── Estado local ────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('dados');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM);

    const filteredProducts = getProcessedProducts(searchTerm);
    const selectedFornecedor = fornecedores.find(f => f.codfornecedor === formData.codfornecedor);
    const selectedCategoria = categorias.find(c => c.codcategoria === formData.codcategoria);

    // ── Carregar categorias ──────────────────────────────────────────────────
    useEffect(() => {
        async function carregarCategorias() {
            try {
                const response = await api.get<any>('/categoria/listar');
                const lista = response?.plano || response?.data?.plano || [];
                setCategorias(lista);
            } catch (err) {
                console.error("Erro ao carregar categorias:", err);
            }
        }
        carregarCategorias();
    }, []);

    // ── Calculo de margem ────────────────────────────────────────────────────
    useEffect(() => {
        const custo = formData.custo ?? 0;
        const preco = formData.preco_venda ?? 0;
        if (custo > 0 && preco > 0) {
            const margem = parseFloat((((preco - custo) / preco) * 100).toFixed(2));
            setFormData(prev => ({ ...prev, margem }));
        }
    }, [formData.custo, formData.preco_venda]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const openNewModal = () => {
        setFormData(INITIAL_FORM);
        setEditingId(null);
        setActiveTab('dados');
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setFormData({ ...product, estoque: 0, estoque_minimo: 0 });
        setEditingId(product.codproduto);
        setActiveTab('dados');
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsed = (type === 'number' || ['custo', 'preco_venda', 'codfornecedor', 'codcategoria'].includes(name))
            ? (value === '' ? 0 : Number(value.replace(',', '.')))
            : value;
        setFormData(prev => ({ ...prev, [name]: parsed }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.produto?.trim()) { toastError("Campo obrigatorio", "Informe a descricao do produto."); return; }
        if (!formData.codfornecedor || formData.codfornecedor === 0) { toastError("Campo obrigatorio", "Selecione um fornecedor."); return; }
        if (!formData.preco_venda || formData.preco_venda === 0) { toastError("Campo obrigatorio", "Informe o preco de venda."); return; }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateProduct(editingId, formData);
                success("Produto atualizado!", `${formData.produto} atualizado com sucesso.`);
            } else {
                await addProduct(formData as any);
                success("Produto cadastrado!", `${formData.produto} adicionado com sucesso.`);
            }
            setIsModalOpen(false);
            setFormData(INITIAL_FORM);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao salvar produto';
            toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => { setProductToDelete(id); setIsDeleteModalOpen(true); };

    const executeDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            success("Produto excluido", "Registro removido com sucesso.");
        } catch (err) {
            toastError("Erro ao excluir", err instanceof Error ? err.message : 'Erro');
        }
    };

    const filteredSuppliers = fornecedores.filter(f =>
        f.fornecedor.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        f.codfornecedor.toString().includes(supplierSearch)
    );

    const filteredCategorias = categorias.filter(c =>
        c.categoria.toLowerCase().includes(categorySearch.toLowerCase()) ||
        c.codcategoria.toString().includes(categorySearch)
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header />

                <div className="page-toolbar">
                    <div className="search-container">
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar produto..."
                            className="search-input" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="toolbar-actions">
                        <button className="btn btn-outline" onClick={exportToCSV}>Exportar CSV</button>
                        <button className="btn btn-primary" onClick={openNewModal}>+ Novo Produto</button>
                    </div>
                </div>

                <section className="products-section">
                    <div className="table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input type="checkbox"
                                            checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                                            onChange={() => toggleSelectAll(filteredProducts)} />
                                    </th>
                                    <SortableHeader label="Codigo" column="codproduto" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Produto" column="produto" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="SKU" column="sku" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Fornecedor" column="codfornecedor" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Preco de Venda" column="preco_venda" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Status" column="status" currentSort={sortConfig} onSort={handleSort} />
                                    <th>Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.codproduto}>
                                        <td className="checkbox-column">
                                            <input type="checkbox"
                                                checked={selectedProducts.has(product.codproduto)}
                                                onChange={() => toggleSelection(product.codproduto)} />
                                        </td>
                                        <td className="td-code">#{product.codproduto}</td>
                                        <td className="td-name">{product.produto}</td>
                                        <td>{product.sku || '—'}</td>
                                        <td>{product.codfornecedor || '—'}</td>
                                        <td>{product.preco_venda?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "R$ 0,00"}</td>
                                        <td>
                                            <span className={`status-badge ${product.status === 'A' ? 'active' : 'inactive'}`}>
                                                {product.status === 'A' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="action-btn edit-btn" title="Editar" onClick={() => openEditModal(product)}><EditIcon /></button>
                                                <button className="action-btn delete-btn" title="Excluir" onClick={() => confirmDelete(product.codproduto)}><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr><td colSpan={8} className="empty-row">Nenhum produto encontrado.</td></tr>
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
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Anterior
                                </button>
                                <button 
                                    className="btn btn-secondary" 
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            {/* ── Modal principal de produto ──────────────────────────────────── */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content product-modal">
                        <div className="modal-header-top">
                            <div>
                                <h2>{editingId ? "Editar Produto" : "Novo Produto"}</h2>
                                <p className="modal-subtitle">{editingId ? "Altere os dados do produto" : "Preencha os dados para cadastrar"}</p>
                            </div>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)} aria-label="Fechar">&times;</button>
                        </div>

                        <div className="tabs-header">
                            {(['dados', 'precificacao', 'estoque'] as ActiveTab[]).map(tab => (
                                <button key={tab} type="button"
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}>
                                    {tab === 'dados' ? 'Dados Gerais' : tab === 'precificacao' ? 'Precificacao' : 'Estoque'}
                                </button>
                            ))}
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleSubmit} noValidate>

                                {/* ABA DADOS GERAIS */}
                                {activeTab === 'dados' && (
                                    <div className="form-grid">

                                        <div className="form-group full-width">
                                            <label htmlFor="produto">Descricao do Produto <span className="required">*</span></label>
                                            <input type="text" id="produto" name="produto"
                                                value={formData.produto || ""} onChange={handleChange}
                                                placeholder="Ex: Teclado Mecanico RGB" />
                                        </div>

                                        {/* Fornecedor */}
                                        <div className="form-group col-6">
                                            <label>Fornecedor <span className="required">*</span></label>
                                            <div className="lookup-field">
                                                <div className="lookup-display">
                                                    {selectedFornecedor
                                                        ? <><span className="lookup-code">#{selectedFornecedor.codfornecedor}</span><span className="lookup-name">{selectedFornecedor.fornecedor}</span></>
                                                        : <span className="lookup-placeholder">Nenhum fornecedor selecionado</span>
                                                    }
                                                </div>
                                                <button type="button" className="lookup-btn"
                                                    onClick={() => { setSupplierSearch(""); setIsSupplierModalOpen(true); }}>
                                                    <SearchIcon /> Buscar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Categoria */}
                                        <div className="form-group col-6">
                                            <label>Categoria</label>
                                            <div className="lookup-field">
                                                <div className="lookup-display">
                                                    {selectedCategoria
                                                        ? <><span className="lookup-code">#{selectedCategoria.codcategoria}</span><span className="lookup-name">{selectedCategoria.categoria}</span></>
                                                        : <span className="lookup-placeholder">Nenhuma categoria selecionada</span>
                                                    }
                                                </div>
                                                <button type="button" className="lookup-btn"
                                                    onClick={() => { setCategorySearch(""); setIsCategoryModalOpen(true); }}>
                                                    <SearchIcon /> Buscar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-group col-3">
                                            <label htmlFor="sku">SKU / Cod. Interno</label>
                                            <input type="text" id="sku" name="sku"
                                                value={formData.sku || ""} onChange={handleChange}
                                                placeholder="Ex: PROD-001" />
                                        </div>

                                        <div className="form-group col-3">
                                            <label htmlFor="unidade">Unidade</label>
                                            <input type="text" id="unidade" name="unidade"
                                                value={formData.unidade || ""} onChange={handleChange}
                                                placeholder="UN, CX, KG..." />
                                        </div>

                                        <div className="form-group col-3">
                                            <label htmlFor="ean">EAN / Cod. de Barras</label>
                                            <input type="text" id="ean" name="ean"
                                                value={formData.ean || ""} onChange={handleChange} />
                                        </div>

                                        <div className="form-group col-3">
                                            <label htmlFor="gtin">GTIN</label>
                                            <input type="text" id="gtin" name="gtin"
                                                value={formData.gtin || ""} onChange={handleChange} />
                                        </div>

                                        <div className="form-group col-3">
                                            <label htmlFor="embalagem">Embalagem</label>
                                            <input type="text" id="embalagem" name="embalagem"
                                                value={formData.embalagem || ""} onChange={handleChange} />
                                        </div>

                                        {/* Toggle status */}
                                        <div className="form-group col-3 status-group">
                                            <label>Status do Produto</label>
                                            <div className="toggle-wrapper">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={formData.status === 'A'}
                                                    className={`toggle-switch ${formData.status === 'A' ? 'on' : 'off'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'A' ? 'I' : 'A' }))}
                                                >
                                                    <span className="toggle-knob" />
                                                </button>
                                                <span className={`toggle-label-text ${formData.status === 'A' ? 'on' : 'off'}`}>
                                                    {formData.status === 'A' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label htmlFor="obs">Observacoes</label>
                                            <textarea id="obs" name="obs" rows={3}
                                                value={formData.obs || ""} onChange={handleChange}
                                                placeholder="Informacoes adicionais sobre o produto..." />
                                        </div>
                                    </div>
                                )}

                                {/* ABA PRECIFICACAO */}
                                {activeTab === 'precificacao' && (
                                    <div className="form-grid">
                                        <div className="form-group col-6">
                                            <label htmlFor="custo">Custo de Aquisicao (R$) <span className="required">*</span></label>
                                            <input type="number" step="0.01" min="0" id="custo" name="custo"
                                                value={formData.custo || ""} onChange={handleChange} placeholder="0,00" />
                                        </div>

                                        <div className="form-group col-6">
                                            <label htmlFor="preco_venda">Preco de Venda (R$) <span className="required">*</span></label>
                                            <input type="number" step="0.01" min="0" id="preco_venda" name="preco_venda"
                                                value={formData.preco_venda || ""} onChange={handleChange} placeholder="0,00" />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Margem de Lucro</label>
                                            <div className="margin-row">
                                                <div className="margin-bar-track">
                                                    <div className="margin-bar-fill"
                                                        style={{ width: `${Math.min(formData.margem ?? 0, 100)}%`,
                                                                 backgroundColor: (formData.margem ?? 0) >= 20 ? 'var(--color-success)' : (formData.margem ?? 0) > 0 ? 'var(--color-warning)' : 'var(--color-gray-200)' }} />
                                                </div>
                                                <span className={`margin-value ${(formData.margem ?? 0) >= 20 ? 'good' : (formData.margem ?? 0) > 0 ? 'warn' : 'neutral'}`}>
                                                    {(formData.margem ?? 0).toFixed(2)}%
                                                </span>
                                            </div>
                                            <small className="field-hint">Calculado automaticamente a partir do custo e preco de venda.</small>
                                        </div>
                                    </div>
                                )}

                                {/* ABA ESTOQUE */}
                                {activeTab === 'estoque' && (
                                    <div className="form-grid">
                                        <div className="form-group col-6">
                                            <label htmlFor="estoque">Estoque Inicial <span className="required">*</span></label>
                                            <input type="number" min="0" id="estoque" name="estoque"
                                                value={formData.estoque ?? 0} onChange={handleChange}
                                                disabled={!!editingId} placeholder="0" />
                                            {editingId && <small className="field-hint warn-hint">Altere o estoque via Movimentacao.</small>}
                                        </div>

                                        <div className="form-group col-6">
                                            <label htmlFor="estoque_minimo">Estoque Minimo (Alerta)</label>
                                            <input type="number" min="0" id="estoque_minimo" name="estoque_minimo"
                                                value={formData.estoque_minimo ?? 0} onChange={handleChange} placeholder="0" />
                                        </div>

                                        <div className="form-group full-width">
                                            <div className="info-box">
                                                <span>i</span>
                                                <p>Os campos <strong>estoque_reservado</strong> e <strong>estoque_bloqueado</strong> sao gerenciados automaticamente pelo sistema.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                        onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? "Salvando..." : editingId ? "Salvar Alteracoes" : "Cadastrar Produto"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal busca fornecedor ──────────────────────────────────────── */}
            {isSupplierModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 600 }}>
                    <div className="modal-content lookup-modal">
                        <div className="modal-header-top">
                            <h2>Buscar Fornecedor</h2>
                            <button className="close-modal" onClick={() => setIsSupplierModalOpen(false)} aria-label="Fechar">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="lookup-search-bar">
                                <SearchIcon />
                                <input type="text" autoFocus
                                    placeholder="Digite o nome ou codigo..."
                                    value={supplierSearch}
                                    onChange={(e) => setSupplierSearch(e.target.value)} />
                            </div>
                            <div className="lookup-list">
                                {filteredSuppliers.length === 0
                                    ? <p className="lookup-empty">Nenhum fornecedor encontrado.</p>
                                    : filteredSuppliers.map(f => (
                                        <div key={f.codfornecedor} className="lookup-item"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, codfornecedor: f.codfornecedor }));
                                                setIsSupplierModalOpen(false);
                                            }}>
                                            <span className="lookup-item-code">#{f.codfornecedor}</span>
                                            <span className="lookup-item-name">{f.fornecedor}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal busca categoria ───────────────────────────────────────── */}
            {isCategoryModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 600 }}>
                    <div className="modal-content lookup-modal">
                        <div className="modal-header-top">
                            <h2>Buscar Categoria</h2>
                            <button className="close-modal" onClick={() => setIsCategoryModalOpen(false)} aria-label="Fechar">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="lookup-search-bar">
                                <SearchIcon />
                                <input type="text" autoFocus
                                    placeholder="Digite o nome ou codigo..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)} />
                            </div>
                            <div className="lookup-list">
                                {filteredCategorias.length === 0
                                    ? <p className="lookup-empty">Nenhuma categoria encontrada.</p>
                                    : filteredCategorias.map(c => (
                                        <div key={c.codcategoria} className="lookup-item"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, codcategoria: c.codcategoria }));
                                                setIsCategoryModalOpen(false);
                                            }}>
                                            <span className="lookup-item-code">#{c.codcategoria}</span>
                                            <span className="lookup-item-name">{c.categoria}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal exclusao ──────────────────────────────────────────────── */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <div className="modal-header-top">
                            <h2>Confirmar Exclusao</h2>
                            <button className="close-modal" onClick={() => setIsDeleteModalOpen(false)} aria-label="Fechar">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-warning">
                                <span className="delete-icon">⚠️</span>
                                <p>Tem certeza que deseja excluir este produto? Esta acao nao pode ser desfeita.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={executeDelete}>Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── SortableHeader ──────────────────────────────────────────────────────────
const SortableHeader: React.FC<{
    label: string;
    column: SortColumn;
    currentSort: { column: SortColumn; direction: 'asc' | 'desc' };
    onSort: (column: SortColumn) => void;
}> = ({ label, column, currentSort, onSort }) => {
    const isActive = currentSort.column === column;
    return (
        <th className={`sortable ${isActive ? currentSort.direction : ''}`} onClick={() => onSort(column)}>
            {label} {isActive && (currentSort.direction === 'asc' ? '↑' : '↓')}
        </th>
    );
};

export default CadastroProduto;
