export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Employee;