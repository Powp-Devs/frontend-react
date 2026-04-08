import apiClient from './api';
import { Produto, Response, PaginatedResponse } from '@/types';

export const produtoService = {
  // Obter todos os produtos
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Produto>> {
    return apiClient.get(`/produtos?page=${page}&pageSize=${pageSize}`);
  },

  // Obter produto por ID
  async obter(id: number): Promise<Response<Produto>> {
    return apiClient.get(`/produtos/${id}`);
  },

  // Criar novo produto
  async criar(produto: Omit<Produto, 'id'>): Promise<Response<Produto>> {
    return apiClient.post('/produtos', produto);
  },

  // Atualizar produto
  async atualizar(id: number, produto: Partial<Produto>): Promise<Response<Produto>> {
    return apiClient.put(`/produtos/${id}`, produto);
  },

  // Deletar produto
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/produtos/${id}`);
  },

  // Buscar produtos por texto
  async buscar(termo: string): Promise<Response<Produto[]>> {
    return apiClient.get(`/produtos/buscar?termo=${termo}`);
  },
};
