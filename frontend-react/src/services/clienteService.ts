import apiClient from './api';
import { Cliente, Response, PaginatedResponse } from '@/types/index.d';

export const clienteService = {
  // Obter todos os clientes
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Cliente>> {
    return apiClient.get(`/clientes?page=${page}&pageSize=${pageSize}`);
  },

  // Obter cliente por ID
  async obter(id: number): Promise<Response<Cliente>> {
    return apiClient.get(`/clientes/${id}`);
  },

  // Criar novo cliente
  async criar(cliente: Omit<Cliente, 'id'>): Promise<Response<Cliente>> {
    return apiClient.post('/clientes', cliente);
  },

  // Atualizar cliente
  async atualizar(id: number, cliente: Partial<Cliente>): Promise<Response<Cliente>> {
    return apiClient.put(`/clientes/${id}`, cliente);
  },

  // Deletar cliente
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/clientes/${id}`);
  },

  // Buscar clientes por texto
  async buscar(termo: string): Promise<Response<Cliente[]>> {
    return apiClient.get(`/clientes/buscar?termo=${termo}`);
  },
};
