import apiClient from './api';
import { Employee } from '@/types/Employee';

/**
 * Interface de Resposta Padrão do Backend
 */
interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  success?: boolean;
}

interface PaginatedResponse<T> {
  status: number;
  empregado: T[];
  endereco: any[];
  contato: any[];
  total: number;
  page: number;
  per_page: number;
}

export const funcionarioService = {
  /**
   * Obtém lista paginada de empregados
   */
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Employee>> {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/empregados', {
      params: { page, page_size: pageSize }
    });
    return response;
  },

  /**
   * Obtém um empregado específico pelo ID
   */
  async obter(codempregado: number): Promise<Employee> {
    const response = await apiClient.get<ApiResponse<Employee>>(`/empregados/${codempregado}`);
    return response.data as Employee;
  },

  /**
   * Cria um novo empregado
   */
  async criar(funcionario: Omit<Employee, 'codempregado'>): Promise<Employee> {
    const response = await apiClient.post<ApiResponse<Employee>>('/empregados/cadastrar', funcionario);
    return response.data as Employee;
  },

  /**
   * Atualiza dados parciais de um empregado
   * Nota: Backend ainda não tem PUT implementado, usar criar para agora
   */
  async atualizar(codempregado: number, funcionario: Partial<Employee>): Promise<Employee> {
    // TODO: Implementar PUT no backend
    throw new Error('Método de atualização ainda não implementado no backend');
  },

  /**
   * Remove um registro do banco de dados
   */
  async deletar(codempregado: number): Promise<void> {
    await apiClient.delete(`/empregados/${codempregado}`);
  },

  /**
   * Busca funcionários por termo (Query Search)
   * TODO: Implementar busca no backend
   */
  async buscar(termo: string): Promise<Employee[]> {
    // Por enquanto, faz GET de todos e filtra no frontend
    const response = await this.listar(1, 100);
    return response.empregado.filter(emp =>
      emp.empregado.toLowerCase().includes(termo.toLowerCase()) ||
      emp.cpf.includes(termo) ||
      emp.email?.toLowerCase().includes(termo.toLowerCase())
    );
  }
};
