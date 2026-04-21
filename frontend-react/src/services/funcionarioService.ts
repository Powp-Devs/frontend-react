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

/**
 * Normaliza dados da API para o padrão esperado pelo formulário
 * A API retorna dados aninhados em "endereco" e "contato"
 */
function normalizeEmployeeData(data: any): Employee {
  // Extrair dados de endereço (vêm aninhados em data.endereco)
  const endereco = data.endereco || {};
  // Extrair dados de contato (vêm aninhados em data.contato)
  const contato = data.contato || {};
  
  return {
    // Campos do empregado
    codempregado: data.codempregado,
    empregado: data.empregado || '',
    cpf: data.cpf || '',
    rg: data.rg || '',
    data_nascimento: data.data_nascimento || '',
    data_admissao: data.data_admissao || '',
    data_demissao: data.data_demissao,
    email_corporativo: data.email_corporativo || '',
    obs: data.obs || '',
    bloqueio: data.bloqueio || '',
    motivo_bloq: data.motivo_bloq || '',
    cargo: data.cargo || '',
    salario: data.salario || 0,
    codsetor: data.codsetor || 1,
    codendereco: data.codendereco,
    codtelefone: data.codtelefone,
    codcontato: data.codtelefone, // Manter compatibilidade com backend
    
    // Campos de endereço (extraídos do objeto aninhado "endereco")
    cep: endereco.cep || '',
    logradouro: endereco.logradouro || '',
    numero: endereco.numero?.toString() || '',
    bairro: endereco.bairro || '',
    cidade: endereco.cidade || '',
    uf: endereco.uf || '',
    pais: endereco.pais || '',
    
    // Campos de contato (extraídos do objeto aninhado "contato")
    // Priorizar email do contato sobre email corporativo
    email: contato.email || data.email || data.email_corporativo || '',
    email2: contato.email2 || '',
    telefone: contato.telefone || '',
    celular: contato.celular || '',
  };
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
    return normalizeEmployeeData(response.data);
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
   */
  async atualizar(codempregado: number, funcionario: Partial<Employee>): Promise<Employee> {
    // Mapear para o formato esperado pelo backend
    const dataToSend = {
      // Campos do empregado
      empregado: funcionario.empregado || '',
      cpf: funcionario.cpf || '',
      rg: funcionario.rg || '',
      data_nascimento: funcionario.data_nascimento || '',
      data_admissao: funcionario.data_admissao || '',
      data_demissao: funcionario.data_demissao || null,
      email_corporativo: funcionario.email_corporativo || '',
      obs: funcionario.obs || '',
      bloqueio: funcionario.bloqueio || 'N',
      motivo_bloq: funcionario.motivo_bloq || '',
      cargo: funcionario.cargo || '',
      salario: funcionario.salario || 0,
      codsetor: funcionario.codsetor || 1,
      
      // Campos de endereço
      codendereco: funcionario.codendereco,
      cep: funcionario.cep || '',
      logradouro: funcionario.logradouro || '',
      numero: funcionario.numero || '',
      bairro: funcionario.bairro || '',
      cidade: funcionario.cidade || '',
      uf: funcionario.uf || '',
      pais: funcionario.pais || 'BR',
      
      // Campos de contato (backend espera codcontato, não codtelefone)
      codcontato: funcionario.codtelefone || funcionario.codcontato,
      email: funcionario.email || '',
      email2: funcionario.email2 || '',
      telefone: funcionario.telefone || '',
      celular: funcionario.celular || '',
    };

    const response = await apiClient.put<ApiResponse<Employee>>(`/empregados/${codempregado}`, dataToSend);
    return normalizeEmployeeData(response.data);
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
