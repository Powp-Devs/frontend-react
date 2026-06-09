import React, { useState, FormEvent } from "react";
import Header from "@/shared/components/layout/Header";
import { useParametroManager } from "@/hooks/useParametroManager";
import { Parametro } from "@/types/Parametro";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

import "@/styles/parametros.css";

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

                <div className="content-header" style={{ padding: "20px" }}>
                    <h2>Parâmetros do ERP</h2>
                    <p style={{ color: "#6b7280" }}>Gerencie as regras de negócio e limites do sistema.</p>
                </div>

                {loading ? (
                    <div style={{ padding: "20px" }}>Carregando...</div>
                ) : (
                    <section className="table-section">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Cód.</th>
                                        <th>Descrição do Parâmetro</th>
                                        <th>Chave Interna</th>
                                        <th>Valor Atual</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parametros.map((param) => (
                                        <tr key={param.codparametro}>
                                            <td>{param.codparametro}</td>
                                            {/* Exibimos a descrição que é amigável para o usuário final */}
                                            <td>{param.descricao}</td> 
                                            <td><code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>{param.nome_parametro}</code></td>
                                            <td><strong>{param.valor}</strong></td>
                                            <td>{param.status === 'A' ? 'Ativo' : 'Inativo'}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    onClick={() => openEditModal(param)}
                                                >
                                                    Alterar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* MODAL DE EDIÇÃO */}
                {isModalOpen && editingParam && (
                    <div className="modal-show" style={{ display: "flex" }}>
                        <div className="modal-content" style={{ maxWidth: "500px" }}>
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