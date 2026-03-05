// src/pages/CadastroCliente.tsx
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { clientStore } from '../../stores/ClientStore';
import '../../styles/cadastroCliente.css'; // Importe seu CSS original aqui

const CadastroCliente: React.FC = observer(() => {
    const [search, setSearch] = useState("");

    // Equivale ao DOMContentLoaded/init()
    useEffect(() => {
        clientStore.loadClients();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        clientStore.loadClients(e.target.value);
    };

    return (
        <div className="app-container">
            <main className="main-content">
                <header className="content-header">
                    <h1>Clientes</h1>
                    <div className="header-actions">
                        <input 
                            type="text" 
                            placeholder="Pesquisar clientes..." 
                            value={search}
                            onChange={handleSearch}
                        />
                        <button className="btn btn-primary">Novo Cliente</button>
                    </div>
                </header>

                <div className="table-container">
                    {clientStore.isLoading ? (
                        <p>Carregando...</p>
                    ) : (
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th>Cod.</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientStore.clients.map(client => (
                                    <tr key={client.codcli}>
                                        <td>{client.codcli}</td>
                                        <td>{client.name}</td>
                                        <td>{client.email}</td>
                                        <td>
                                            <button onClick={() => clientStore.deleteClient(client.codcli)}>
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
});

export default CadastroCliente;