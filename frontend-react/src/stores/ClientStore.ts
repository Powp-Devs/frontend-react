import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { Client } from "../types/Client";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: apiUrl,
});

class ClientStore {
  clients: Client[] = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      tipo_pessoa: "fisica",
      cpf_cnpj: "123.456.789-00",
      endereco_rua: "Rua A",
      endereco_numero: "100",
      endereco_cidade: "São Paulo",
      endereco_estado: "SP",
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria.santos@email.com",
      telefone: "(21) 99876-5432",
      tipo_pessoa: "fisica",
      cpf_cnpj: "987.654.321-00",
      endereco_rua: "Avenida B",
      endereco_numero: "200",
      endereco_cidade: "Rio de Janeiro",
      endereco_estado: "RJ",
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      telefone: "(31) 97654-3210",
      tipo_pessoa: "fisica",
      cpf_cnpj: "456.789.123-00",
      endereco_rua: "Rua C",
      endereco_numero: "300",
      endereco_cidade: "Belo Horizonte",
      endereco_estado: "MG",
    },
    {
      id: 4,
      nome: "Ana Costa",
      email: "ana.costa@email.com",
      telefone: "(85) 98543-2109",
      tipo_pessoa: "fisica",
      cpf_cnpj: "789.123.456-00",
      endereco_rua: "Rua D",
      endereco_numero: "400",
      endereco_cidade: "Fortaleza",
      endereco_estado: "CE",
    },
    {
      id: 5,
      nome: "Carlos Ferreira",
      email: "carlos.ferreira@email.com",
      telefone: "(41) 99432-1098",
      tipo_pessoa: "fisica",
      cpf_cnpj: "321.654.987-00",
      endereco_rua: "Avenida E",
      endereco_numero: "500",
      endereco_cidade: "Curitiba",
      endereco_estado: "PR",
    },
  ];
  loading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;

  constructor() {
    makeAutoObservable(this);
    // Atualiza totalItems com base nos dados mockados
    this.totalItems = this.clients.length;
  }

  // método de conveniência para compatibilidade com componentes existentes
  loadClients(page = 1) {
    return this.fetchClients(page);
  }

  // mobx getter para expor loading como isLoading
  get isLoading() {
    return this.loading;
  }

  // Action para carregar clientes (página ou busca futura)
  fetchClients = async (page = 1) => {
    this.loading = true;
    try {
      const response = await api.get(`/clientes?page=${page}`);
      runInAction(() => {
        this.clients = response.data.data;
        this.totalItems = response.data.total;
        this.currentPage = page;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        console.error("Erro ao buscar clientes:", error);
      });
    }
  };

  // Action para excluir cliente
  deleteClient = async (id: number) => {
    try {
      await api.delete(`/clientes/${id}`);
      await this.fetchClients(this.currentPage);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  // Action para adicionar/atualizar cliente
  saveClient = async (client: Partial<Client>) => {
    try {
      if (client.id) {
        await api.put(`/clientes/${client.id}`, client);
      } else {
        await api.post(`/clientes`, client);
      }
      await this.fetchClients(this.currentPage);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      throw error;
    }
  };
}

export const clientStore = new ClientStore();
