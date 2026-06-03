// Registro de estoque (tabela pwestoque)
export interface EstoqueItem {
    codestoque: number;
    codproduto: number;
    estoque: number;
    estoque_minimo: number;
    estoque_reservado: number;
    estoque_bloqueado: number;
    data_cadastro: string | null;
    data_ultent: string | null;
    obs: string | null;
    // campo enriquecido — preenchido no front ao cruzar com produtos
    produto?: string;
    sku?: string;
}

// Movimentacao (tabela pwmovestoque)
export interface Movimentacao {
    codmov: number;
    data: string;
    codproduto: number;
    tipo_mov: 'E' | 'S';
    quantidade: number;
    obs: string | null;
    codfuncmov: number;
}

// Payload para atualizar estoque via PUT /estoque/atualizar/{codproduto}
export interface EstoqueUpdatePayload {
    estoque?: number;
    estoque_minimo?: number;
    estoque_reservado?: number;
    estoque_bloqueado?: number;
    obs?: string;
}

export type StatusEstoque = 'normal' | 'baixo' | 'critico';
