// Dashboard de Vendas
export interface DashboardVendasResponse {
  status: number;
  message: string;
  sales_today_count: number;
  sales_value_today: number;
  active_clients_count: number;
  ticket_medio: number;
  grafico_vendas: {
    labels: string[];
    data: number[];
  };
  vendas_por_produto: {
    labels: string[];
    data: number[];
    total_itens: number;
  };
  vendas_por_dia: {
    labels: string[];
    data: number[];
  };
  meio_pagamento: {
    labels: string[];
    data: number[];
  };
}

// Dashboard de Estoque
export interface ProdutoEstoqueCritico {
  codigo: string;
  produto: string;
  estoque_atual: number;
  estoque_minimo: number;
  status: 'critico' | 'alerta' | 'normal';
}

export interface CategoriaEstoque {
  codcategoria: number;
  categoria: string;
  qtd_produto: number;
}

export interface ProdutoValidar {
  codigo: string;
  produto: string;
  estoque_atual: number;
  estoque_minimo: number;
}

export interface DashboardEstoqueResponse {
  status: number;
  message: string;
  qtd_produto: number;
  valor_estoque: number;
  estoque_minimo: number;
  estoque_zerado: number;
  categorias: CategoriaEstoque[];
  estoque_validar: ProdutoValidar[];
}

// Dashboard de Clientes
export interface ClienteChurn {
  cliente: string;
  ultima_compra: string;
  valor_total: number;
  risco: 'alto' | 'medio' | 'baixo';
}

export interface NovoCliente {
  cliente: string;
  data_cadastro: string;
  primeira_compra: number;
  status: 'ativo' | 'pendente';
}

export interface DashboardClientesResponse {
  status: number;
  message: string;
  total_clientes: number;
  clientes_ativos: number;
  ticket_medio: number;
  taxa_retencao: number;
  evolucao: {
    labels: string[];
    novos: number[];
    ativos: number[];
    inativos: number[];
  };
  segmentacao: {
    labels: string[];
    valores: number[];
  };
  top_clientes: {
    labels: string[];
    faturamento: number[];
  };
  distribuicao_geografica: {
    labels: string[];
    valores: number[];
  };
  clientes_churn: ClienteChurn[];
  novos_clientes: NovoCliente[];
}
