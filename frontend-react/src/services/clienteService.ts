import apiClient from './api';
import { Client, Response, PaginatedResponse } from '@/types';

export const clienteService = {
  // Obter todos os clientes
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Client>> {
    return apiClient.get(`/clientes?page=${page}&pageSize=${pageSize}`);
  },

  // Obter cliente por ID
  async obter(id: number): Promise<Response<Client>> {
    return apiClient.get(`/clientes/${id}`);
  },

  // Criar novo cliente
  async criar(cliente: Omit<Client, 'id'>): Promise<Response<Client>> {
    return apiClient.post('/clientes', cliente);
  },

  // Atualizar cliente
  async atualizar(id: number, cliente: Partial<Client>): Promise<Response<Client>> {
    return apiClient.put(`/clientes/${id}`, cliente);
  },

  // Deletar cliente
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/clientes/${id}`);
  },

  // Buscar clientes por texto
  async buscar(termo: string): Promise<Response<Client[]>> {
    return apiClient.get(`/clientes/buscar?termo=${termo}`);
  },
};
