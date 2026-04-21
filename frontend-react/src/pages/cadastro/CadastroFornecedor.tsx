import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useSupplierManager } from "@/hooks/useSupplierManager";
import { Supplier, SortColumn } from "@/types/Supplier";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroFornecedor.css";

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
const CadastroFornecedor: React.FC = () => {
    const {
        suppliers,
        selectedSuppliers,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getSupplier,
        getProcessedSuppliers,
    } = useSupplierManager();

    // ── Toast ──────────────────────────────────────────────
    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    // ── Estado local ───────────────────────────────────────
    const [searchTerm, setSearchTerm]                   = useState("");
    const [isModalOpen, setIsModalOpen]                 = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen]     = useState(false);
    const [editingId, setEditingId]                     = useState<number | null>(null);
    const [supplierToDelete, setSupplierToDelete]       = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting]               = useState(false);
    const [submitError, setSubmitError]                 = useState<string | null>(null);

    // ── Estado inicial do formulário — espelha Supplier.ts ─
    const initialFormState: Partial<Supplier> = {
        // Dados do fornecedor
        fornecedor:          "",
        fantasia:            "",
        cnpj:                "",
        inscricaoestadual:   "",
        tipopessoa:          "J",       // padrão: Pessoa Jurídica
        dtcadastro:          new Date().toISOString().split("T")[0],
        obs:                 "",
        bloqueio:            "N",
        motivo_bloq:         "",
        dtbloqueio:          "",
        nome_representante:  "",
        cpf_representante:   "",
        // Endereço
        cep:                 "",
        logradouro:          "",
        numero:              "",
        bairro:              "",
        cidade:              "",
        uf:                  "",
        pais:                "BR",
        // Contato
        telefone:            "",
        celular:             "",
        email:               "",
        email2:              "",
    };

    const [formData, setFormData] = useState<Partial<Supplier>>(initialFormState);

    const filteredSuppliers = getProcessedSuppliers(searchTerm);

    // ── Handlers do modal ──────────────────────────────────
    const openNewSupplierModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditSupplierModal = (supplier: Supplier) => {
        setIsSubmitting(true);
        getSupplier(supplier.codfornecedor)
            .then((fullData) => {
                setFormData(fullData);
                setEditingId(supplier.codfornecedor);
                setSubmitError(null);
                setIsModalOpen(true);
            })
            .catch((err) => {
                const msg = err instanceof Error
                    ? err.message
                    : "Erro ao carregar dados do fornecedor";
                toastError("Erro ao abrir edição", msg);
            })
            .finally(() => setIsSubmitting(false));
    };

    // Trata input, select e textarea com um único handler
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── Submit ─────────────────────────────────────────────
    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validação — campos obrigatórios
        if (!formData.fornecedor || !formData.cnpj || !formData.email) {
            const msg = "Preencha todos os campos obrigatórios: Razão Social, CNPJ e E-mail.";
            setSubmitError(msg);
            warning("Campos obrigatórios", msg);
            return;
        }

        if (!formData.cep || !formData.logradouro || !formData.bairro || !formData.cidade) {
            const msg = "Preencha todos os dados de endereço.";
            setSubmitError(msg);
            warning("Endereço incompleto", msg);
            return;
        }

        // CNPJ mínimo (sem máscara): 14 dígitos numéricos
        const cnpjDigits = formData.cnpj?.replace(/\D/g, "") ?? "";
        if (formData.tipopessoa === "J" && cnpjDigits.length !== 14) {
            const msg = "CNPJ inválido. Informe os 14 dígitos.";
            setSubmitError(msg);
            warning("CNPJ inválido", msg);
            return;
        }

        // CPF do representante: se preenchido, validar tamanho
        const cpfDigits = formData.cpf_representante?.replace(/\D/g, "") ?? "";
        if (cpfDigits.length > 0 && cpfDigits.length !== 11) {
            const msg = "CPF do representante inválido. Informe os 11 dígitos.";
            setSubmitError(msg);
            warning("CPF inválido", msg);
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateSupplier(editingId, formData as any);
                success(
                    "Fornecedor atualizado!",
                    `${formData.fornecedor} foi atualizado com sucesso.`
                );
            } else {
                await addSupplier(formData as any);
                success(
                    "Fornecedor cadastrado!",
                    `${formData.fornecedor} foi adicionado com sucesso.`
                );
            }

            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar fornecedor";
            setSubmitError(msg);
            toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const confirmDelete = (codfornecedor: number) => {
        setSupplierToDelete(codfornecedor);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!supplierToDelete) return;

        try {
            await deleteSupplier(supplierToDelete);
            setIsDeleteModalOpen(false);
            setSupplierToDelete(null);
            success("Fornecedor excluído", "O registro foi removido com sucesso.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao excluir fornecedor";
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
                            placeholder="Pesquisar por razão social, CNPJ ou e-mail"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={exportToCSV}
                            disabled={loading || suppliers.length === 0}
                        >
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openNewSupplierModal}
                            disabled={loading}
                        >
                            Novo Fornecedor
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
                                                selectedSuppliers.size === filteredSuppliers.length
                                            }
                                            onChange={() => toggleSelectAll(filteredSuppliers)}
                                        />
                                    </th>
                                    <SortableHeader label="Cód." column="codfornecedor" currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Razão Social" column="fornecedor"    currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Fantasia"     column="fantasia"       currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="CNPJ"         column="cnpj"           currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Cidade"       column="cidade"         currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="UF"           column="uf"             currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="E-mail"       column="email"          currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Telefone"     column="telefone"       currentSort={sortConfig} onSort={handleSort} />
                                    <th>Editar</th>
                                    <th>Deletar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.codfornecedor}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedSuppliers.has(supplier.codfornecedor)}
                                                onChange={() => toggleSelection(supplier.codfornecedor)}
                                            />
                                        </td>
                                        <td>{supplier.codfornecedor}</td>
                                        <td>{supplier.fornecedor}</td>
                                        <td>{supplier.fantasia}</td>
                                        <td>{supplier.cnpj}</td>
                                        <td>{supplier.cidade}</td>
                                        <td>{supplier.uf}</td>
                                        <td>{supplier.email}</td>
                                        <td>{supplier.telefone}</td>
                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => openEditSupplierModal(supplier)}
                                                title="Editar"
                                                disabled={isSubmitting}
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => confirmDelete(supplier.codfornecedor)}
                                                title="Deletar"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSuppliers.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            style={{ textAlign: "center", padding: "20px" }}
                                        >
                                            Nenhum fornecedor encontrado.
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
                                    {editingId ? "Editar Fornecedor" : "Novo Fornecedor"}
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

                                    {/* ── Dados do Fornecedor ───────────────────── */}
                                    <h4>Dados do Fornecedor</h4>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Tipo de Pessoa *</label>
                                            <select
                                                name="tipopessoa"
                                                value={formData.tipopessoa || "J"}
                                                onChange={handleFormChange}
                                            >
                                                <option value="J">Pessoa Jurídica</option>
                                                <option value="F">Pessoa Física</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                {formData.tipopessoa === "F" ? "CPF *" : "CNPJ *"}
                                            </label>
                                            <input
                                                type="text"
                                                name="cnpj"
                                                value={formData.cnpj || ""}
                                                onChange={handleFormChange}
                                                placeholder={
                                                    formData.tipopessoa === "F"
                                                        ? "000.000.000-00"
                                                        : "00.000.000/0000-00"
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Razão Social *</label>
                                            <input
                                                type="text"
                                                name="fornecedor"
                                                value={formData.fornecedor || ""}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Nome Fantasia</label>
                                            <input
                                                type="text"
                                                name="fantasia"
                                                value={formData.fantasia || ""}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Inscrição Estadual</label>
                                            <input
                                                type="text"
                                                name="inscricaoestadual"
                                                value={formData.inscricaoestadual || ""}
                                                onChange={handleFormChange}
                                                placeholder="Isento ou número"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Data de Cadastro</label>
                                            <input
                                                type="date"
                                                name="dtcadastro"
                                                value={formData.dtcadastro || ""}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Representante ─────────────────────────── */}
                                    <h4>Representante</h4>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Nome do Representante</label>
                                            <input
                                                type="text"
                                                name="nome_representante"
                                                value={formData.nome_representante || ""}
                                                onChange={handleFormChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>CPF do Representante</label>
                                            <input
                                                type="text"
                                                name="cpf_representante"
                                                value={formData.cpf_representante || ""}
                                                onChange={handleFormChange}
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                    </div>

                                    {/* ── Endereço ──────────────────────────────── */}
                                    <h4>Endereço</h4>

                                    <div className="form-group-row">
                                        <div className="form-group cep-group">
                                            <label>CEP *</label>
                                            <input
                                                type="text"
                                                name="cep"
                                                value={formData.cep || ""}
                                                onChange={handleFormChange}
                                                placeholder="00000-000"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Logradouro *</label>
                                            <input
                                                type="text"
                                                name="logradouro"
                                                value={formData.logradouro || ""}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group numero-group">
                                            <label>Número</label>
                                            <input
                                                type="text"
                                                name="numero"
                                                value={formData.numero || ""}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Bairro *</label>
                                            <input
                                                type="text"
                                                name="bairro"
                                                value={formData.bairro || ""}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Cidade *</label>
                                            <input
                                                type="text"
                                                name="cidade"
                                                value={formData.cidade || ""}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group estado-group">
                                            <label>UF</label>
                                            <input
                                                type="text"
                                                name="uf"
                                                value={formData.uf || ""}
                                                onChange={handleFormChange}
                                                placeholder="SP"
                                                maxLength={2}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>País</label>
                                            <input
                                                type="text"
                                                name="pais"
                                                value={formData.pais || ""}
                                                onChange={handleFormChange}
                                                placeholder="Brasil"
                                            />
                                        </div>
                                    </div>

                                    {/* ── Contato ───────────────────────────────── */}
                                    <h4>Contato</h4>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>E-mail *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ""}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>E-mail Secundário</label>
                                            <input
                                                type="email"
                                                name="email2"
                                                value={formData.email2 || ""}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Telefone</label>
                                            <input
                                                type="tel"
                                                name="telefone"
                                                value={formData.telefone || ""}
                                                onChange={handleFormChange}
                                                placeholder="(11) 3333-4444"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Celular</label>
                                            <input
                                                type="tel"
                                                name="celular"
                                                value={formData.celular || ""}
                                                onChange={handleFormChange}
                                                placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                    </div>

                                    {/* ── Observações ───────────────────────────── */}
                                    <h4>Observações</h4>

                                    <div className="form-group">
                                        <label>Observação</label>
                                        <textarea
                                            name="obs"
                                            value={formData.obs || ""}
                                            onChange={handleFormChange}
                                            rows={3}
                                            placeholder="Observações sobre o fornecedor..."
                                        />
                                    </div>

                                    {/*
                                      Bloqueio — exibido apenas no modo edição.
                                      Não faz sentido bloquear um fornecedor no ato do cadastro.
                                    */}
                                    {editingId && (
                                        <>
                                            <h4>Bloqueio</h4>

                                            <div className="form-group-row">
                                                <div className="form-group">
                                                    <label>Bloqueado?</label>
                                                    <select
                                                        name="bloqueio"
                                                        value={formData.bloqueio || "N"}
                                                        onChange={handleFormChange}
                                                    >
                                                        <option value="N">Não</option>
                                                        <option value="S">Sim</option>
                                                    </select>
                                                </div>

                                                {formData.bloqueio === "S" && (
                                                    <>
                                                        <div className="form-group">
                                                            <label>Motivo do Bloqueio</label>
                                                            <input
                                                                type="text"
                                                                name="motivo_bloq"
                                                                value={formData.motivo_bloq || ""}
                                                                onChange={handleFormChange}
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Data do Bloqueio</label>
                                                            <input
                                                                type="date"
                                                                name="dtbloqueio"
                                                                value={formData.dtbloqueio || ""}
                                                                onChange={handleFormChange}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* ── Ações ─────────────────────────────────── */}
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

                {/* ── Modal de confirmação de exclusão ─────────────── */}
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
                                <p>Tem certeza que deseja excluir este fornecedor?</p>
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
// SortableHeader — idêntico ao padrão de CadastroFuncionario
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

export default CadastroFornecedor;
