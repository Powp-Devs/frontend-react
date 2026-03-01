import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/cadastroCliente.css';

interface Cliente {
  id: number;
  cliente: string;
  fantasia?: string;
  email?: string;
  // ... add other fields as needed
}

const CadastroCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiBase}/clientes`);
      setClientes(response.data);
    } catch (err) {
      setError('Falha ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clients-page">
      <h1>Cadastro de Clientes</h1>
      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table className="clients-table">
          <thead>
            <tr>
              <th>Cod.</th>
              <th>Nome</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.cliente}</td>
                <td>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CadastroCliente;
