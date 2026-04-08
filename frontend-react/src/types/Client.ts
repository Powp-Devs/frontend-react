export type SortColumn = "id" | "nome" | "email" | "telefone";

export interface Client {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  perPage: number;
}
