// Tipos principais
export type {
  Client,
  ClientListResponse,
  Response,
  PaginatedResponse,
  Produto,
  Estoque,
  Venda,
  Fornecedor,
  Funcionario,
  Lancamento
} from './Client';

export type { Employee } from './Employee';
export type { Supplier } from './Supplier';

// Tipos relacionados aos componentes
export type { SortColumn as ClientSortColumn } from './Client';
export type { SortColumn as EmployeeSortColumn, SortDirection } from './Employee';
export type { SortColumn as SupplierSortColumn } from './Supplier';
