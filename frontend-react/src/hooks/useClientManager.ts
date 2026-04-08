import { useState, useEffect } from 'react';
import { Client, SortColumn } from '../types/Client';

type SortDirection = 'asc' | 'desc';

// Dados iniciais de clientes
const initialClientsData: Client[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@dominio.com',
    telefone: '11987654321',
    endereco_rua: 'Rua A',
    endereco_numero: '123',
    endereco_bairro: 'Bairro Centro',
    endereco_cidade: 'São Paulo',
    endereco_estado: 'SP',
    endereco_cep: '01310-100',
    tipo_pessoa: 'fisica',
    cpf_cnpj: '12345678900'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@dominio.com',
    telefone: '11988776655',
    endereco_rua: 'Rua B',
    endereco_numero: '456',
    endereco_bairro: 'Bairro Vila',
    endereco_cidade: 'São Paulo',
    endereco_estado: 'SP',
    endereco_cep: '02140-000',
    tipo_pessoa: 'fisica',
    cpf_cnpj: '98765432100'
  }
];

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export function useClientManager() {
  // Estado inicial carrega do localStorage ou usa o mock
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : initialClientsData;
  });

  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'id',
    direction: 'asc'
  });

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  // Adicionar Cliente
  const addClient = (clientData: Partial<Client>) => {
    const maxId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;
    const newClient: Client = {
      id: maxId + 1,
      nome: clientData.nome || '',
      email: clientData.email || '',
      telefone: clientData.telefone,
      endereco_rua: clientData.endereco_rua,
      endereco_numero: clientData.endereco_numero,
      endereco_complemento: clientData.endereco_complemento,
      endereco_bairro: clientData.endereco_bairro,
      endereco_cidade: clientData.endereco_cidade,
      endereco_estado: clientData.endereco_estado,
      endereco_cep: clientData.endereco_cep,
      tipo_pessoa: clientData.tipo_pessoa || 'fisica',
      cpf_cnpj: clientData.cpf_cnpj || '',
      data_criacao: formatDate(new Date())
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  // Atualizar Cliente
  const updateClient = (id: number, updatedData: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updatedData, data_atualizacao: formatDate(new Date()) } : c)));
  };

  // Deletar Cliente
  const deleteClient = (id: number) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Seleção (Checkbox)
  const toggleSelection = (id: number) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = (filteredClients: Client[]) => {
    if (selectedClients.size === filteredClients.length && filteredClients.length > 0) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)));
    }
  };

  // Ordenação
  const handleSort = (column: SortColumn) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Exportar CSV
  const exportToCSV = () => {
    const columns = ['Cod.', 'Nome', 'E-MAIL', 'Telefone'];
    let csvContent = columns.join(',') + '\n';

    clients.forEach(client => {
      const row = [
        client.id,
        `"${client.nome.replace(/"/g, '""')}"`,
        client.email,
        client.telefone || ''
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clientes_${formatDate(new Date()).replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtro e Ordenação
  const getProcessedClients = (searchTerm: string) => {
    let result = [...clients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        c =>
          c.id.toString().includes(term) ||
          c.nome.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Mapeamento de valores para ordenação
      if (sortConfig.column === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else if (sortConfig.column === 'nome') {
        aValue = a.nome;
        bValue = b.nome;
      } else if (sortConfig.column === 'email') {
        aValue = a.email;
        bValue = b.email;
      } else if (sortConfig.column === 'telefone') {
        aValue = a.telefone || '';
        bValue = b.telefone || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return result;
  };

  return {
    clients,
    selectedClients,
    sortConfig,
    addClient,
    updateClient,
    deleteClient,
    toggleSelection,
    toggleSelectAll,
    handleSort,
    exportToCSV,
    getProcessedClients
  };
}
