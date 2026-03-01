// Interfaces e tipos comuns da aplicação

export interface Cliente {
  id: number;
  cliente: string;
  fantasia?: string;
  email?: string;
  cnpj?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo?: boolean;
  dataCadastro?: string;

  // fields used by cadastro form
  tipopessoa?: 'F' | 'J';
  rg?: string;
  inscricaoestadual?: string;
  logradouro?: string;
  bairro?: string;
}

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

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
