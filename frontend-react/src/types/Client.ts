export type SortColumn = "id" | "nome" | "email" | "telefone" | "cpf_cnpj" | "cidade" | "estado" | "cep";

export interface Client {
  id: number;
  nome: string;
  email: string;
  email2?: string;
  telefone?: string;
  celular?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  cpf_cnpj?: string;
  fantasia?: string;
  obs?: string;
  bloqueio?: string;
  motivo_bloq?: string;
  rg?: string;
  dt_nascimento?: string;
  inscricaoestadual?: string;
  dtabertura?: string;
  endereco?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  perPage: number;
}

// Tipos de Domínio
export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  quantidade: number;
  sku?: string;
  ativo?: boolean;
}

export interface Estoque {
  id: number;
  produtoId: number;
  quantidade: number;
  localizacao?: string;
  dataAtualizacao?: string;
}

export interface Venda {
  id: number;
  clienteId: number;
  data: string;
  valor: number;
  status?: string;
  observacoes?: string;
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo?: boolean;
  dataCadastro?: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cargo?: string;
  salario?: number;
  dataAdmissao?: string;
  ativo?: boolean;
}

export interface Lancamento {
  id: number;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  data: string;
  categoria?: string;
  observacoes?: string;
  pago?: boolean;
}

export interface Response<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
