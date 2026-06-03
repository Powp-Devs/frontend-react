export interface Product {  
  // Campos PWPRODUTO
  codproduto: number;
  produto: string;
  sku: string;
  embalagem: string;
  unidade: string;
  gtin: string;
  ean: string;
  status: 'A' | 'I';
  obs: string;
  codfornecedor: number;
  codcategoria: number;
  // Campos PWTABPR
  custo?: number;
  preco_venda?: number;
  margem: number;
  // Campos de estoque (somente no formulário de criação)
  estoque?: number;
  estoque_minimo?: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Product;