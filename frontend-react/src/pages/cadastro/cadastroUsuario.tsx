import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useUserManager } from "@/hooks/useUserManager";
import { User, SortColumn } from "@/types/Users";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";
import "@/styles/cadastroUsuario.css";

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
const CadastroUsuario: React.FC = () => {
    const {
        users,
        selectedUsers,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addUser,
        updateUser,
        deleteUser,
        getUser,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedUsers,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
    } = useUserManager();

    const { toasts, removeToast, success, error: toastError, warning } = useToast();

    // ── Estado local ───────────────────────────────────────
    const [searchTerm, setSearchTerm]               = useState("");
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId]                 = useState<number | null>(null);
    const [userToDelete, setUserToDelete]           = useState<number | null>(null);
    const [deleteMotivo, setDeleteMotivo]           = useState("");
    const [isSubmitting, setIsSubmitting]           = useState(false);
    const [submitError, setSubmitError]             = useState<string | null>(null);

    const initialFormState: Partial<User> & { motivo: string; confirmarSenha: string } = {
        nome:         "",
        email:        "",
        usuario:      "",
        senha:        "",
        confirmarSenha: "",
        ativo:        "S",
        obs:          "",
        codempregado: 0,
        motivo:       "",
    };

    const [formData, setFormData] = useState<typeof initialFormState>(initialFormState);

    const filteredUsers = getProcessedUsers(searchTerm);

    // ── Handlers do modal ──────────────────────────────────
    const openNewUserModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditUserModal = (user: User) => {
        setIsSubmitting(true);
        getUser(user.codusuario)
            .then((fullData) => {
                setFormData({ ...fullData, senha: "", confirmarSenha: "", motivo: "" });
                setEditingId(user.codusuario);
                setSubmitError(null);
                setIsModalOpen(true);
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : "Erro ao carregar dados do usuário";
                toastError("Erro ao abrir edição", msg);
            })
            .finally(() => setIsSubmitting(false));
    };

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

        if (!formData.nome || !formData.email || !formData.usuario) {
            const msg = "Preencha os campos obrigatórios: Nome, E-mail e Usuário.";
            setSubmitError(msg);
            warning("Campos obrigatórios", msg);
            return;
        }

        if (!editingId && !formData.senha) {
            const msg = "Informe uma senha para o novo usuário.";
            setSubmitError(msg);
            warning("Senha obrigatória", msg);
            return;
        }

        if (formData.senha && formData.senha !== formData.confirmarSenha) {
            const msg = "As senhas não coincidem.";
            setSubmitError(msg);
            warning("Senhas diferentes", msg);
            return;
        }

        if (!formData.codempregado || formData.codempregado <= 0) {
            const msg = "Informe o código do funcionário vinculado ao usuário.";
            setSubmitError(msg);
            warning("Funcionário obrigatório", msg);
            return;
        }

        if (editingId && !formData.motivo) {
            const msg = "Informe o motivo da alteração.";
            setSubmitError(msg);
            warning("Motivo obrigatório", msg);
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateUser(editingId, {
                    nome:         formData.nome,
                    email:        formData.email,
                    usuario:      formData.usuario,
                    senha:        formData.senha || "",
                    ativo:        formData.ativo,
                    obs:          formData.obs,
                    codempregado: formData.codempregado!,
                    motivo:       formData.motivo,
                });
                success("Usuário atualizado!", `${formData.nome} foi atualizado com sucesso.`);
            } else {
                await addUser({
                    nome:         formData.nome!,
                    email:        formData.email!,
                    usuario:      formData.usuario!,
                    senha:        formData.senha!,
                    ativo:        formData.ativo ?? "S",
                    obs:          formData.obs,
                    codempregado: formData.codempregado!,
                });
                success("Usuário cadastrado!", `${formData.nome} foi adicionado com sucesso.`);
            }

            setIsModalOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao salvar usuário";
            setSubmitError(msg);
            toastError("Erro ao salvar", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const confirmDelete = (codusuario: number) => {
        setUserToDelete(codusuario);
        setDeleteMotivo("");
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;

        if (!deleteMotivo.trim()) {
            toastError("Motivo obrigatório", "Informe o motivo da exclusão.");
            return;
        }

        try {
            await deleteUser(userToDelete, deleteMotivo);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            success("Usuário excluído", "O registro foi removido com sucesso.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao excluir usuário";
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
                            placeholder="Pesquisar por nome, usuário ou e-mail"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={exportToCSV}
                            disabled={loading || users.length === 0}
                        >
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={openNewUserModal}
                            disabled={loading}
                        >
                            Novo Usuário
                        </button>
                    </div>
                </div>

                {loading && <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>}
                {error   && <div style={{ padding: "20px", color: "red", textAlign: "center" }}>Erro: {error}</div>}

                <section className="users-section">
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                                            onChange={() => toggleSelectAll(filteredUsers)}
                                        />
                                    </th>
                                    <SortableHeader label="Cód."      column="codusuario"   currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Nome"      column="nome"         currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Usuário"   column="usuario"      currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="E-mail"    column="email"        currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Status"    column="ativo"        currentSort={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Criado em" column="data_criacao" currentSort={sortConfig} onSort={handleSort} />
                                    <th>Editar</th>
                                    <th>Deletar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.codusuario}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.codusuario)}
                                                onChange={() => toggleSelection(user.codusuario)}
                                            />
                                        </td>
                                        <td>{user.codusuario}</td>
                                        <td>{user.nome}</td>
                                        <td>{user.usuario}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                backgroundColor: user.ativo === 'S' ? '#d4edda' : '#f8d7da',
                                                color: user.ativo === 'S' ? '#155724' : '#721c24',
                                                fontSize: "0.85rem",
                                                fontWeight: "500",
                                            }}>
                                                {user.ativo === 'S' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>{user.data_criacao ? new Date(user.data_criacao).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => openEditUserModal(user)}
                                                title="Editar"
                                                disabled={isSubmitting}
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => confirmDelete(user.codusuario)}
                                                title="Deletar"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                            Nenhum usuário encontrado.
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
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                >
                                    Anterior
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
                                <h2>{editingId ? "Editar Usuário" : "Novo Usuário"}</h2>
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

                                    <p className="form-section-title">Dados do Usuário</p>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Nome *</label>
                                            <input
                                                type="text"
                                                name="nome"
                                                value={formData.nome || ""}
                                                onChange={handleFormChange}
                                                required
                                                maxLength={255}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Login (usuário) *</label>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={formData.usuario || ""}
                                                onChange={handleFormChange}
                                                required
                                                maxLength={255}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>E-mail *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ""}
                                            onChange={handleFormChange}
                                            required
                                            maxLength={255}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Cód. Funcionário *</label>
                                        <input
                                            type="number"
                                            name="codempregado"
                                            value={formData.codempregado || ""}
                                            onChange={handleFormChange}
                                            required
                                            min={1}
                                            placeholder="Código do funcionário vinculado"
                                        />
                                    </div>

                                    <p className="form-section-title">
                                        {editingId ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                                    </p>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>{editingId ? "Nova Senha" : "Senha *"}</label>
                                            <input
                                                type="password"
                                                name="senha"
                                                value={formData.senha || ""}
                                                onChange={handleFormChange}
                                                maxLength={72}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirmar Senha</label>
                                            <input
                                                type="password"
                                                name="confirmarSenha"
                                                value={formData.confirmarSenha || ""}
                                                onChange={handleFormChange}
                                                maxLength={72}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    <p className="form-section-title">Configurações</p>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                name="ativo"
                                                value={formData.ativo || "S"}
                                                onChange={handleFormChange}
                                            >
                                                <option value="S">Ativo</option>
                                                <option value="N">Inativo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Observações</label>
                                        <textarea
                                            name="obs"
                                            value={formData.obs || ""}
                                            onChange={handleFormChange}
                                            rows={2}
                                            placeholder="Observações sobre o usuário..."
                                        />
                                    </div>

                                    {editingId && (
                                        <div className="form-group">
                                            <label>Motivo da Alteração *</label>
                                            <input
                                                type="text"
                                                name="motivo"
                                                value={formData.motivo || ""}
                                                onChange={handleFormChange}
                                                placeholder="Descreva o motivo da alteração"
                                                required
                                            />
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

                {/* ── Modal confirmação de exclusão ─────────────────── */}
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
                                <p>Tem certeza que deseja excluir este usuário?</p>
                                <div className="form-group">
                                    <label>Motivo da Exclusão *</label>
                                    <input
                                        type="text"
                                        value={deleteMotivo}
                                        onChange={(e) => setDeleteMotivo(e.target.value)}
                                        placeholder="Informe o motivo"
                                    />
                                </div>
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

export default CadastroUsuario;
