import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useToastContext } from "@/components/ToastContext";
import { useClientManager } from "@/hooks/useClientManager";
import StepModal from "@/components/StepModal";
import { Client, SortColumn } from "@/types/Client";
import "@/styles/cadastroCliente.css";

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

const CadastroCliente: React.FC = () => {
    const {
        selectedClients,
        sortConfig,
        addClient,
        updateClient,
        deleteClient,
    getClientById,
        handleSort,
        exportToCSV,
        getProcessedClients,
        loading,
        error,
    } = useClientManager();

    const { success, error: showError } = useToastContext();

    const getErrorMessage = (err: any) => {
        const detail = err?.response?.data?.detail;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) {
            return detail
                .map((item) => {
                    if (typeof item === 'string') return item;
                    if (item?.msg) return item.msg;
                    if (typeof item === 'object') return Object.values(item).flat().join(', ');
                    return JSON.stringify(item);
                })
                .filter(Boolean)
                .join(' | ');
        }
        if (detail && typeof detail === 'object') {
            return detail.message || JSON.stringify(detail);
        }
        return err?.message || 'Verifique os dados e tente novamente.';
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);

    // Estado do Formulário
    const initialFormState: Partial<Client> = {
        nome: "",
        email: "",
        email2: "",
        telefone: "",
        celular: "",
        tipo_pessoa: "fisica",
        cpf_cnpj: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        pais: "BR",
        cep: "",
    };

    const [formData, setFormData] = useState<Partial<Client>>(initialFormState);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { label: "Dados do Cliente" },
        { label: "Endereço" },
    ];

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const canAdvanceStep = () => {
        if (currentStep === 0) {
            return Boolean(formData.nome && formData.email && formData.cpf_cnpj);
        }
        return true;
    };

    const canSubmitForm = () => {
        return Boolean(
            formData.nome &&
            formData.email &&
            formData.cpf_cnpj &&
            formData.cep &&
            formData.logradouro &&
            formData.bairro &&
            formData.cidade
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Nome Completo *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Email Secundário</label>
                                <input
                                    type="email"
                                    name="email2"
                                    value={formData.email2 || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    name="telefone"
                                    value={formData.telefone || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Celular</label>
                                <input
                                    type="tel"
                                    name="celular"
                                    value={formData.celular || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Pessoa</label>
                                <select
                                    name="tipo_pessoa"
                                    value={formData.tipo_pessoa || 'fisica'}
                                    onChange={handleFormChange}
                                >
                                    <option value="fisica">Pessoa Física</option>
                                    <option value="juridica">Pessoa Jurídica</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>{formData.tipo_pessoa === 'juridica' ? 'CNPJ *' : 'CPF *'}</label>
                                <input
                                    type="text"
                                    name="cpf_cnpj"
                                    value={formData.cpf_cnpj || ''}
                                    onChange={handleFormChange}
                                    onBlur={handleCnpjBlur}
                                    required
                                />
                                {/* 💡 Exibe o texto enquanto a API está a carregar */}
                                    {isFetchingCnpj && (
                                        <span style={{ fontSize: '12px', color: '#007955', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                            Buscando...
                                        </span>
                                    )}
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Nome Fantasia</label>
                                <input
                                    type="text"
                                    name="fantasia"
                                    value={formData.fantasia || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Inscrição Estadual</label>
                                <input
                                    type="text"
                                    name="inscricaoestadual"
                                    value={formData.inscricaoestadual || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>{formData.tipo_pessoa === 'juridica' ? 'Data de Abertura' : 'Data de Nascimento'}</label>
                                <input
                                    type="date"
                                    name={formData.tipo_pessoa === 'juridica' ? 'dtabertura' : 'dt_nascimento'}
                                    value={formData.tipo_pessoa === 'juridica' ? formData.dtabertura || '' : formData.dt_nascimento || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                            {formData.tipo_pessoa === 'fisica' && (
                                <div className="form-group">
                                    <label>RG</label>
                                    <input
                                        type="text"
                                        name="rg"
                                        value={formData.rg || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Bloqueado</label>
                                <select
                                    name="bloqueio"
                                    value={formData.bloqueio || 'N'}
                                    onChange={handleFormChange}
                                >
                                    <option value="N">Não</option>
                                    <option value="S">Sim</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Motivo Bloqueio</label>
                                <input
                                    type="text"
                                    name="motivo_bloq"
                                    value={formData.motivo_bloq || ''}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Observações</label>
                            <textarea
                                name="obs"
                                value={formData.obs || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                    </>
                );

            case 1:
                return (
                    <>
                        <div className="form-group-row">
                            <div className="form-group cep-group">
                                <label>CEP *</label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep || ''}
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
                                    value={formData.logradouro || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group numero-group">
                                <label>Número</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={formData.numero || ''}
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
                                    value={formData.bairro || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Cidade *</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    value={formData.cidade || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group estado-group">
                                <label>Estado</label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={formData.estado || ''}
                                    onChange={handleFormChange}
                                    maxLength={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>País</label>
                                <input
                                    type="text"
                                    name="pais"
                                    value={formData.pais || 'BR'}
                                    onChange={handleFormChange}
                                    placeholder="BR"
                                />
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const filteredClients = getProcessedClients(searchTerm);

    // Handlers do Modal
    const openNewClientModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setCurrentStep(0);
        setIsModalOpen(true);
    };

    const openEditModal = async (client: Partial<Client>) => {
        if (client.id === undefined) return;

        setIsEditLoading(true);
        try {
            const fullClient = await getClientById(client.id);
            setFormData(fullClient);
            setEditingId(client.id);
            setCurrentStep(0);
            setIsModalOpen(true);
        } catch (err: any) {
            showError(
                'Erro ao carregar cliente',
                getErrorMessage(err)
            );
        } finally {
            setIsEditLoading(false);
        }
    };

    const handleCnpjBlur = async () => {
        if (formData.tipo_pessoa !== 'juridica' || !formData.cpf_cnpj) return;

        const cnpj = formData.cpf_cnpj.replace(/\D/g, "");

        if (cnpj.length !== 14) return;

        setIsFetchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) throw new Error("CNPJ não encontrado na Receita Federal");
            const data = await response.json();

            setFormData(prev => ({
                ...prev,
                nome: data.razao_social || prev.nome,
                fantasia: data.nome_fantasia || prev.fantasia,
                cep: data.cep ? data.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2") : prev.cep,
                logradouro: data.logradouro || prev.logradouro,
                numero: data.numero || prev.numero,
                bairro: data.bairro || prev.bairro,
                cidade: data.municipio || prev.cidade,
                estado: data.uf || prev.estado, 
                telefone: data.ddd_telefone_1 || prev.telefone,
                email: data.email || prev.email,
            }));
            
            success("CNPJ Encontrado", "Os dados da empresa foram preenchidos automaticamente.");
        } catch (err) {
            showError("Busca de CNPJ", "Não foi possível recuperar os dados. Preencha manualmente.");
        } finally {
            setIsFetchingCnpj(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();

        if (!formData.nome || !formData.email) {
            alert("Preencha os campos obrigatórios (Nome e Email)");
            return;
        }

        try {
            if (editingId) {
                await updateClient(editingId, formData);
                success("Cliente atualizado", "As alterações foram salvas com sucesso.");
            } else {
                await addClient(formData as any);
                success("Cliente cadastrado", "O cliente foi adicionado com sucesso.");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            showError(
                "Erro ao salvar cliente",
                getErrorMessage(err)
            );
        }
    };

    // Handlers de Delete
    const confirmDelete = (id: number) => {
        setClientToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (clientToDelete) {
            try {
                await deleteClient(clientToDelete);
                success("Cliente excluído", "O cliente foi removido com sucesso.");
                setIsDeleteModalOpen(false);
                setClientToDelete(null);
            } catch (err: any) {
                showError(
                    "Erro ao excluir cliente",
                    getErrorMessage(err)
                );
            }
        }
    };

    return (
        <div className="app-container">
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

                    <div className="actions" style={{ display: "flex", gap: "10px" }}>
                        <button className="btn btn-outline" onClick={exportToCSV}>
                            Export
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={openNewClientModal}
                        >
                            Novo Cliente
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-message" style={{ padding: '16px', color: '#333' }}>
                        Carregando clientes...
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ padding: '16px', color: '#b00020' }}>
                        {error}
                    </div>
                )}

                <section className="suppliers-section">
                    <div className="table-container">
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredClients.length > 0 &&
                                                selectedClients.size ===
                                                    filteredClients.length
                                            }
                                            onChange={() =>
                                                toggleSelectAll(filteredClients)
                                            }
                                        />
                                    </th>

                                    <SortableHeader
                                        label="Cod."
                                        column="id"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <SortableHeader
                                        label="Nome"
                                        column="nome"
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
                                        label="Telefone"
                                        column="telefone"
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                    />

                                    <th>Edit</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.has(
                                                    client.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelection(client.id)
                                                }
                                            />
                                        </td>

                                        <td>{client.id}</td>

                                        <td>{client.nome}</td>

                                        <td>{client.email}</td>

                                        <td>{client.telefone || "-"}</td>

                                        <td>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() =>
                                                    openEditModal(client)
                                                }
                                                disabled={isEditLoading}
                                            >
                                                <EditIcon />
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    confirmDelete(client.id)
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: "20px",
                                            }}
                                        >
                                            Nenhum cliente encontrado
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
                <StepModal
                    isOpen={isModalOpen}
                    title={editingId ? "Editar Cliente" : "Novo Cliente"}
                    steps={steps}
                    activeStep={currentStep}
                    onClose={() => setIsModalOpen(false)}
                    onBack={goToPreviousStep}
                    onNext={goToNextStep}
                    onSubmit={handleSubmit}
                    disableNext={!canAdvanceStep()}
                    disableSubmit={!canSubmitForm()}
                    isSubmitting={false}
                    submitLabel={editingId ? "Atualizar" : "Salvar"}
                >
                    <form>
                        {renderStepContent()}
                    </form>
                </StepModal>
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
                            <p>Tem certeza que deseja excluir este cliente?</p>

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

export default CadastroCliente;
