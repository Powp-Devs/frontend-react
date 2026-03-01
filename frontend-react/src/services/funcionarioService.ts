import apiClient from './api';
import { Funcionario, Response, PaginatedResponse } from '@/types/index.d';

export const funcionarioService = {
  // Obter todos os funcionários
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Funcionario>> {
    return apiClient.get(`/funcionarios?page=${page}&pageSize=${pageSize}`);
  },

  // Obter funcionário por ID
  async obter(id: number): Promise<Response<Funcionario>> {
    return apiClient.get(`/funcionarios/${id}`);
  },

  // Criar novo funcionário
  async criar(funcionario: Omit<Funcionario, 'id'>): Promise<Response<Funcionario>> {
    return apiClient.post('/funcionarios', funcionario);
  },

  // Atualizar funcionário
  async atualizar(id: number, funcionario: Partial<Funcionario>): Promise<Response<Funcionario>> {
    return apiClient.put(`/funcionarios/${id}`, funcionario);
  },

  // Deletar funcionário
  async deletar(id: number): Promise<Response<void>> {
    return apiClient.delete(`/funcionarios/${id}`);
  },

  // Buscar funcionários por texto
  async buscar(termo: string): Promise<Response<Funcionario[]>> {
    return apiClient.get(`/funcionarios/buscar?termo=${termo}`);
  },
};
