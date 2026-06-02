import apiClient from './api';
import { Client } from '@/types';

export const clienteService = {
  async listar(page = 1, pageSize = 100): Promise<any> {
    return apiClient.get(`/clientes/listar?page=${page}&per_page=${pageSize}`);
  },

  async obter(id: number): Promise<any> {
    return apiClient.get(`/clientes/buscar/${id}`);
  },

  async criar(cliente: any): Promise<any> {
    return apiClient.post('/clientes/cadastrar', cliente);
  },

  async atualizar(id: number, cliente: any): Promise<any> {
    return apiClient.put(`/clientes/atualizar/${id}`, cliente);
  },

  async deletar(id: number): Promise<any> {
    return apiClient.delete(`/clientes/deletar/${id}`);
  }
};
