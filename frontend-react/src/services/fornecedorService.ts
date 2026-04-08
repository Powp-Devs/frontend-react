import apiClient from './api';
import { Fornecedor, Response, PaginatedResponse } from '@/types';

export const fornecedorService = {
  // Obter todos os fornecedores
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Fornecedor>> {
    return apiClient.get(`/fornecedores?page=${page}&pageSize=${pageSize}`);
  },

  // Obter fornecedor por ID
  async obter(id: number): Promise<Response<Fornecedor>> {
    return apiClient.get(`/fornecedores/${id}`);
  },

  // Criar novo fornecedor
  async criar(fornecedor: Omit<Fornecedor, 'id'>): Promise<Response<Fornecedor>> {
    return apiClient.post('/fornecedores', fornecedor);
  },

  // Atualizar fornecedor
  async atualizar(id: number, fornecedor: Partial<Fornecedor>): Promise<Response<Fornecedor>> {
    return apiClient.put(`/fornecedores/${id}`, fornecedor);
  },

  // Deletar fornecedor
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/fornecedores/${id}`);
  },

  // Buscar fornecedores por texto
  async buscar(termo: string): Promise<Response<Fornecedor[]>> {
    return apiClient.get(`/fornecedores/buscar?termo=${termo}`);
  },
};
