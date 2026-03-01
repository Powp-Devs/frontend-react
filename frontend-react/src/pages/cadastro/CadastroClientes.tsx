import React, { useState, useEffect } from 'react';
import { Cliente } from '../../types';

const ClientesGerenciador: React.FC = () => {
  // --- Estados ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  
  // Estado para o formulário (centralizado)
  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipopessoa: 'F'
  });

  // --- Efeitos ---
  useEffect(() => {
    fetchClientes();
  }, []);

  // --- Funções de API ---
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/clientes');
      const data = await response.json();
      setClientes(data.data);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Manipuladores de Evento ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (!data.erro) {
      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingClient ? 'PUT' : 'POST';
    const url = editingClient 
      ? `http://127.0.0.1:8000/api/clientes/${editingClient.id}`
      : 'http://127.0.0.1:8000/api/clientes';

    try {
      // build payload from formData (it may contain extra undefined props)
      const payload = { ...formData } as Partial<Cliente>;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro ao salvar cliente: ${err}`);
      }

      // opcionalmente podemos ler a resposta se necessário
      // const result = await response.json();

      fetchClientes();
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({ tipopessoa: 'F' });
    } catch (err) {
      console.error('Falha ao enviar formulário', err);
    }
  };

  return (
    <div className="container">
      <h1>Gerenciamento de Clientes</h1>
      <button onClick={() => { setEditingClient(null); setFormData({tipopessoa: 'F'}); setIsModalOpen(true); }}>
        Novo Cliente
      </button>

      {/* Tabela de Clientes */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cli => (
            <tr key={cli.id}>
              <td>{cli.id}</td>
              <td>{cli.cliente}</td>
              <td>{cli.email}</td>
              <td>
                <button onClick={() => { setEditingClient(cli); setFormData(cli); setIsModalOpen(true); }}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal - Renderização Condicional */}
      {isModalOpen && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <h2>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            
            <label>Tipo:</label>
            <select name="tipopessoa" value={formData.tipopessoa} onChange={handleInputChange}>
              <option value="F">Física</option>
              <option value="J">Jurídica</option>
            </select>

            <label>{formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}:</label>
            <input 
              name={formData.tipopessoa === 'F' ? 'cpf' : 'cnpj'} 
              value={formData.tipopessoa === 'F' ? formData.cpf : formData.cnpj}
              onChange={handleInputChange}
            />

            <label>Nome/Razão Social:</label>
            <input name="cliente" value={formData.cliente || ''} onChange={handleInputChange} />

            <label>CEP:</label>
            <input 
              name="cep" 
              value={formData.cep || ''} 
              onChange={handleInputChange} 
              onBlur={(e) => handleCepBlur(e.target.value)} 
            />

            {/* Renderização Condicional de Campos Específicos */}
            {formData.tipopessoa === 'F' ? (
              <div>
                <label>RG:</label>
                <input name="rg" value={formData.rg || ''} onChange={handleInputChange} />
              </div>
            ) : (
              <div>
                <label>Inscrição Estadual:</label>
                <input name="inscricaoestadual" value={formData.inscricaoestadual || ''} onChange={handleInputChange} />
              </div>
            )}

            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientesGerenciador;