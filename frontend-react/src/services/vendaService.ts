import apiClient from './api';
import { Venda, Response, PaginatedResponse } from '@/types/index.d';

export const vendaService = {
  // Obter todas as vendas
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Venda>> {
    return apiClient.get(`/vendas?page=${page}&pageSize=${pageSize}`);
  },

  // Obter venda por ID
  async obter(id: number): Promise<Response<Venda>> {
    return apiClient.get(`/vendas/${id}`);
  },

  // Criar nova venda
  async criar(venda: Omit<Venda, 'id'>): Promise<Response<Venda>> {
    return apiClient.post('/vendas', venda);
  },

  // Atualizar venda
  async atualizar(id: number, venda: Partial<Venda>): Promise<Response<Venda>> {
    return apiClient.put(`/vendas/${id}`, venda);
  },

  // Cancelar venda (soft delete)
  async cancelar(id: number): Promise<Response<void>> {
    return apiClient.put(`/vendas/${id}/cancelar`, {});
  },

  // Buscar vendas por cliente
  async buscarPorCliente(clienteId: number): Promise<Response<Venda[]>> {
    return apiClient.get(`/vendas/cliente/${clienteId}`);
  },

  // Obter relatório de vendas
  async obterRelatorio(dataInicio: string, dataFim: string): Promise<Response<any>> {
    return apiClient.get(`/vendas/relatorio?inicio=${dataInicio}&fim=${dataFim}`);
  },
};
