export interface PedidoItemCreate {
  // Campos PWPEDIDOI
  codproduto: number;
  quantidade: number;
  valor_venda: number;
  perc_desconto: number;
}

export interface PedidoCreate {
  // Campos PWPEDIDOC
  codcliente: number;
  codcobranca: number;
  codplano: number;
  codvendedor: number;
  status: string;
  obs?: string | null; 
  itens: PedidoItemCreate[];
}