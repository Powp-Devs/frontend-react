export interface Employee {
  // Campos PWEMPREGADO
  codempregado: number;
  empregado: string;
  cpf: string;
  rg?: string;
  data_nascimento: string;
  data_admissao: string;
  data_demissao?: string;
  email_corporativo?: string;
  obs?: string;
  bloqueio?: string;
  motivo_bloq?: string;
  cargo?: string;
  salario: number;
  codsetor: number;
  codendereco?: number;
  codtelefone?: number;
  codcontato?: number; // Alias para codtelefone (usado no backend)

  // Campos PWENDERECO (quando retornados da API)
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  pais?: string;

  // Campos PWCONTATO (quando retornados da API)
  telefone?: string;
  celular?: string;
  email?: string;
  email2?: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Employee;
