import apiClient from './api';
import { Lancamento, Response, PaginatedResponse } from '@/types/index.d';

export const lancamentoService = {
  // Obter todos os lançamentos
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Lancamento>> {
    return apiClient.get(`/lancamentos?page=${page}&pageSize=${pageSize}`);
  },

  // Obter lançamento por ID
  async obter(id: number): Promise<Response<Lancamento>> {
    return apiClient.get(`/lancamentos/${id}`);
  },

  // Criar novo lançamento
  async criar(lancamento: Omit<Lancamento, 'id'>): Promise<Response<Lancamento>> {
    return apiClient.post('/lancamentos', lancamento);
  },

  // Atualizar lançamento
  async atualizar(id: number, lancamento: Partial<Lancamento>): Promise<Response<Lancamento>> {
    return apiClient.put(`/lancamentos/${id}`, lancamento);
  },

  // Deletar lançamento
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/lancamentos/${id}`);
  },

  // Buscar lançamentos por período
  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Response<Lancamento[]>> {
    return apiClient.get(`/lancamentos/periodo?inicio=${dataInicio}&fim=${dataFim}`);
  },

  // Obter resumo financeiro
  async obterResumo(): Promise<Response<any>> {
    return apiClient.get('/lancamentos/resumo');
  },
};
