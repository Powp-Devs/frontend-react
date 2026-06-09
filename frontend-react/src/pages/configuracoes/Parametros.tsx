import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useParametroManager } from "@/hooks/useParametroManager";
import { Parametro } from "@/types/Parametro";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

import "@/styles/parametros.css";

// Ícone de Edição padrão do sistema
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const Parametros: React.FC = () => {
    const { parametros, loading, error, updateParametro } = useParametroManager();
    const { toasts, removeToast, success, error: toastError } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estado para o parâmetro que está sendo editado
    const [editingParam, setEditingParam] = useState<Parametro | null>(null);
    const [editValor, setEditValor] = useState("");
    const [editStatus, setEditStatus] = useState("A");

    const openEditModal = (param: Parametro) => {
        setEditingParam(param);
        setEditValor(param.valor);
        setEditStatus(param.status);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingParam) return;

        setIsSubmitting(true);
        try {
            await updateParametro(editingParam.codparametro, editValor, editStatus);
            success("Sucesso", "Parâmetro atualizado com sucesso.");
            setIsModalOpen(false);
        } catch (err) {
            toastError("Erro", "Não foi possível atualizar o parâmetro.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="app-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="main-content">
                <Header title="Gestão de Parâmetros" userName="Admin" />

                <div className="content-header">
                    <div>
                        <h2>Parâmetros de Presidência</h2>
                        <p>Parâmetros gerais de Configurações do sistema.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
                ) : (
                    <section className="parametros-section">
                        <div className="table-container">
                            <table className="parametros-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>Cód.</th>
                                        <th>Descrição do Parâmetro</th>
                                        <th>Chave Interna</th>
                                        <th>Valor Atual</th>
                                        <th style={{ width: "120px" }}>Status</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parametros.map((param) => (
                                        <tr key={param.codparametro}>
                                            <td>{param.codparametro}</td>
                                            <td>{param.descricao}</td> 
                                            <td><code>{param.nome_parametro}</code></td>
                                            <td>{param.valor}</td>
                                            <td>
                                                <span style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    backgroundColor: param.status === 'A' ? '#d4edda' : '#f8d7da',
                                                    color: param.status === 'A' ? '#155724' : '#721c24',
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500",
                                                }}>
                                                    {param.status === 'A' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <button 
                                                    className="action-btn edit-btn" 
                                                    onClick={() => openEditModal(param)}
                                                    title="Editar Parâmetro"
                                                >
                                                    <EditIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {parametros.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                                                Nenhum parâmetro encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* MODAL DE EDIÇÃO */}
                {isModalOpen && editingParam && (
                    <div className="modal-show">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Alterar Parâmetro</h2>
                                <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ marginBottom: "20px", color: "#4b5563" }}>
                                    <strong>Regra:</strong> {editingParam.descricao}
                                </p>

                                <form onSubmit={handleFormSubmit}>
                                    <div className="form-group">
                                        <label>Novo Valor *</label>
                                        <input
                                            type="text"
                                            value={editValor}
                                            onChange={(e) => setEditValor(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>
                                        <select 
                                            value={editStatus} 
                                            onChange={(e) => setEditStatus(e.target.value)}
                                        >
                                            <option value="A">Ativo</option>
                                            <option value="I">Inativo</option>
                                        </select>
                                    </div>

                                    <div className="form-group actions" style={{ marginTop: "24px" }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Parametros;