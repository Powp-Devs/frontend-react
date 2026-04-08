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
