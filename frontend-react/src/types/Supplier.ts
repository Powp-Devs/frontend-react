export interface Supplier {
  id: number;
  name: string; // Razão Social
  email: string;
  date: string;
  // Campos adicionais do formulário
  cnpj?: string;
  fantasyName?: string;
  cep?: string;
  address?: string; // Logradouro
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Supplier;
