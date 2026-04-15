export interface Product {  
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Product;