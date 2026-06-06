import { useState, useEffect } from 'react';
import { Client, SortColumn } from '../types/Client';
import { clienteService } from '../services/clienteService';

type SortDirection = 'asc' | 'desc';

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const mapBackendClient = (cliente: any): Client => {
  const contato = cliente.contato || {};
  const endereco = cliente.endereco || {};

  return {
    id: cliente.codcliente,
    nome: cliente.cliente,
    email: contato.email || '',
    telefone: contato.telefone || contato.celular || '',
    endereco: endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero || ''}`.trim() : '',
    cidade: endereco.cidade || '',
    estado: endereco.uf || '',
    cep: endereco.cep || '',
    tipo_pessoa: cliente.tipopessoa === 'J' ? 'juridica' : 'fisica',
    data_criacao: cliente.dtcadastro ? new Date(cliente.dtcadastro).toLocaleDateString('pt-BR') : undefined
  };
};

const mapBackendClients = (response: any): Client[] => {
  const clientes = response?.data || [];
  return clientes.map((cliente: any) => mapBackendClient(cliente));
};

const createClientePayload = (clientData: Partial<Client>) => ({
  cliente: clientData.nome || '',
  fantasia: clientData.nome || '',
  dtcadastro: formatISODate(new Date()),
  tipopessoa: 'F',
  obs: '',
  bloqueio: 'N',
  motivo_bloq: '',
  cep: clientData.cep || '',
  logradouro: clientData.endereco || '',
  numero: 'S/N',
  bairro: '',
  cidade: clientData.cidade || '',
  uf: clientData.estado || 'SP',
  pais: 'BR',
  telefone: clientData.telefone || '',
  celular: clientData.telefone || '',
  email: clientData.email || '',
  email2: clientData.email || '',
  cpf: '00000000000',
  rg: '000000000',
  dt_nascimento: formatISODate(new Date())
});

export function useClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>(
    {
      column: 'id',
      direction: 'asc'
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clienteService.listar(1, 100);
      const mapped = mapBackendClients(response);
      setClients(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Partial<Client>) => {
    try {
      const payload = createClientePayload(clientData);
      await clienteService.criar(payload);
      await loadClients();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao adicionar cliente.');
      throw err;
    }
  };

  const updateClient = async (id: number, updatedData: Partial<Client>) => {
    try {
      const payload = createClientePayload(updatedData);
      await clienteService.atualizar(id, payload);
      await loadClients();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao atualizar cliente.');
      throw err;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await clienteService.deletar(id);
      setClients(prev => prev.filter((c) => c.id !== id));
      setSelectedClients((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao excluir cliente.');
      throw err;
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedClients((prev) => {
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
      setSelectedClients(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const handleSort = (column: SortColumn) => {
    setSortConfig((current) => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const columns = ['Cod.', 'Nome', 'E-MAIL', 'Telefone'];
    let csvContent = columns.join(',') + '\n';

    clients.forEach((client) => {
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

  const getProcessedClients = (searchTerm: string) => {
    let result = [...clients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toString().includes(term) ||
          c.nome.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

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
    getProcessedClients,
    loading,
    error,
    loadClients
  };
}
