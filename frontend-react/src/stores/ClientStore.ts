import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { Client } from "../types/Client";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: apiUrl,
});

class ClientStore {
  clients: Client[] = [];
  loading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;

  constructor() {
    makeAutoObservable(this);
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
