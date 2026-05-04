export interface Product {  
  // Campos PWPRODUTO
  codproduto: number;
  produto: string;
  obs: string;
  embalagem: string;
  sku: string;
  unidade: string;
  gtin: string;
  ean: string;
  status: 'A' | 'I' ;
  codfornecedor: number;
  // Campos PWTABPR
  custo?: number;
  preco_venda?: number;
  margem: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Product;