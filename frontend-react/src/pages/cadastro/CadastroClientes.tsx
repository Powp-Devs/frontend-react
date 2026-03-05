import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { clientStore } from '../../stores/ClientStore';
import { Client } from '../../types/Client';

const CadastroClientes = observer(() => {
  const { clients, loading, fetchClients, deleteClient } = clientStore;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteClient = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(id);
    }
  };

  return (
    <section className="clients-section">
      <header className="section-header">
        <h2>Cadastro de Clientes</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          Novo Cliente
        </button>
      </header>

      <div className="table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Carregando clientes...
                </td>
              </tr>
            ) : (
              clients.map((client: Client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.nome}</td>
                  <td>{client.email}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
});

export default CadastroClientes;