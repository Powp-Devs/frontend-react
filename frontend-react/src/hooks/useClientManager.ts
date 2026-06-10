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

const normalizeBackendPessoa = (cliente: any) => {
  let tipopessoa = cliente.tipopessoa;
  let pessoaFisica = cliente.pessoa_fisica || cliente.pessoaFisica || {};
  let pessoaJuridica = cliente.pessoa_juridica || cliente.pessoaJuridica || {};

  if (tipopessoa && typeof tipopessoa === 'object') {
    const nested = tipopessoa;
    tipopessoa = nested.cnpj || nested.ie || nested.dtabertura ? 'J' : 'F';

    if (tipopessoa === 'F') {
      pessoaFisica = nested;
    } else {
      pessoaJuridica = nested;
    }
  }

  return { tipopessoa, pessoaFisica, pessoaJuridica };
};

const mapBackendClient = (cliente: any): Client => {
  const contato = cliente.contato || {};
  const endereco = cliente.endereco || {};
  const { tipopessoa, pessoaFisica, pessoaJuridica } = normalizeBackendPessoa(cliente);

  const isJuridica = tipopessoa === 'J';
  const isFisica = tipopessoa === 'F';

  return {
    id: cliente.codcliente,
    nome: cliente.cliente,
    fantasia: cliente.fantasia || '',
    email: contato.email || '',
    email2: contato.email2 || '',
    telefone: contato.telefone || '',
    celular: contato.celular || contato.telefone || '',
    tipo_pessoa: isJuridica ? 'juridica' : 'fisica',
    cpf_cnpj: isFisica ? (pessoaFisica.cpf || cliente.cpf || '') : (pessoaJuridica.cnpj || cliente.cnpj || ''),
    obs: cliente.obs || '',
    bloqueio: cliente.bloqueio || 'N',
    motivo_bloq: cliente.motivo_bloq || '',
    rg: pessoaFisica.rg || cliente.rg || '',
    dt_nascimento: pessoaFisica.dt_nascimento ? new Date(pessoaFisica.dt_nascimento).toISOString().split('T')[0] : (cliente.dt_nascimento ? new Date(cliente.dt_nascimento).toISOString().split('T')[0] : ''),
    inscricaoestadual: pessoaJuridica.ie || cliente.inscricaoestadual || '',
    dtabertura: pessoaJuridica.dtabertura ? new Date(pessoaJuridica.dtabertura).toISOString().split('T')[0] : (cliente.dtabertura ? new Date(cliente.dtabertura).toISOString().split('T')[0] : ''),
    endereco: endereco.logradouro ? `${endereco.logradouro}${endereco.numero ? `, ${endereco.numero}` : ''}`.trim() : '',
    logradouro: endereco.logradouro || '',
    numero: endereco.numero?.toString() || '',
    bairro: endereco.bairro || '',
    cidade: endereco.cidade || '',
    estado: endereco.uf || '',
    pais: endereco.pais || 'BR',
    cep: endereco.cep || '',
    data_criacao: cliente.dtcadastro ? new Date(cliente.dtcadastro).toLocaleDateString('pt-BR') : undefined
  };
};

const extractApiData = (response: any) => {
  if (!response) return null;
  return response?.data ?? response;
};

const mapBackendClients = (response: any): Client[] => {
  const clientes = extractApiData(response) || [];
  return clientes.map((cliente: any) => mapBackendClient(cliente));
};

const mapBackendClientResponse = (response: any): Client => {
  const cliente = extractApiData(response) || {};
  return mapBackendClient(cliente);
};

const extractErrorMessage = (err: any, fallback = 'Erro inesperado.') => {
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

  return err?.message || fallback;
};

const createClientePayload = (clientData: Partial<Client>) => {
  const tipopessoa = clientData.tipo_pessoa === 'juridica' ? 'J' : 'F';
  const cpfCnpjValue = clientData.cpf_cnpj?.replace(/\D/g, '') || '';

  return {
    cliente: clientData.nome || '',
    fantasia: clientData.fantasia || clientData.nome || '',
    dtcadastro: formatISODate(new Date()),
    tipopessoa,
    obs: clientData.obs || '',
    bloqueio: clientData.bloqueio || 'N',
    motivo_bloq: clientData.motivo_bloq || '',
    cpf: tipopessoa === 'F' ? cpfCnpjValue || undefined : undefined,
    rg: clientData.rg || undefined,
    dt_nascimento: clientData.dt_nascimento || undefined,
    cnpj: tipopessoa === 'J' ? cpfCnpjValue || undefined : undefined,
    inscricaoestadual: clientData.inscricaoestadual || undefined,
    dtabertura: clientData.dtabertura || undefined,
    cep: clientData.cep || '',
    logradouro: clientData.logradouro || '',
    numero: clientData.numero || '',
    bairro: clientData.bairro || '',
    cidade: clientData.cidade || '',
    uf: clientData.estado?.trim() ? clientData.estado : undefined,
    pais: clientData.pais || 'BR',
    telefone: clientData.telefone || '',
    celular: clientData.celular || clientData.telefone || '',
    email: clientData.email || '',
    email2: clientData.email2 || undefined,
  };
};

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
      setError(extractErrorMessage(err, 'Erro ao carregar clientes.'));
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
      setError(extractErrorMessage(err, 'Erro ao adicionar cliente.'));
      throw err;
    }
  };

  const updateClient = async (id: number, updatedData: Partial<Client>) => {
    try {
      const payload = createClientePayload(updatedData);
      await clienteService.atualizar(id, payload);
      await loadClients();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro ao atualizar cliente.'));
      throw err;
    }
  };

  const getClientById = async (id: number): Promise<Client> => {
    const response = await clienteService.obter(id);
    return mapBackendClientResponse(response);
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
      setError(extractErrorMessage(err, 'Erro ao excluir cliente.'));
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
    const columns = ['Cod.', 'Nome', 'E-MAIL', 'Telefone', 'Celular', 'CPF/CNPJ', 'CEP', 'Cidade', 'UF'];
    let csvContent = columns.join(',') + '\n';

    clients.forEach((client) => {
      const row = [
        client.id,
        `"${client.nome.replace(/"/g, '""')}"`,
        client.email,
        client.telefone || '',
        client.celular || '',
        client.cpf_cnpj || '',
        client.cep || '',
        client.cidade || '',
        client.estado || ''
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
          c.email.toLowerCase().includes(term) ||
          (c.cpf_cnpj || '').toLowerCase().includes(term) ||
          (c.cidade || '').toLowerCase().includes(term) ||
          (c.estado || '').toLowerCase().includes(term) ||
          (c.cep || '').toLowerCase().includes(term)
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
    getClientById,
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
