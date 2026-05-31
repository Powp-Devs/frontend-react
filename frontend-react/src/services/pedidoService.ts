import apiClient from './api';
import { PedidoCreate } from '@/types/Order';

interface ApiResponse<T = void> {
  status: number;
  message?: string;
  data?: T;
  success?: boolean;
}

interface PedidoCabecalho {
  codpedido: number;
  data: string;
  codcliente: number;
  codcobranca: number;
  codplano: number;
  qtdprodutos: number;
  valor_total: number;
  valor_desconto: number;
  codvendedor: number;
  status: string;
  obs?: string | null;
}

interface PedidoItem {
  codpedido_item: number;
  codpedido: number;
  data: string;
  codproduto: number;
  quantidade: number;
  valor_tabela: number;
  valor_venda: number;
  valor_total: number;
  desconto: number;
  valor_desconto: number;
}

interface PedidoDetalhe extends PedidoCabecalho {
  itens: PedidoItem[];
}

interface LancarPedidoResponse {
  status: number;
  message: string;
  success: boolean;
}

function normalizePedidoCabecalho(data: any): PedidoCabecalho {
  return {
    codpedido:       data.codpedido,
    data:            data.data            || '',
    codcliente:      data.codcliente,
    codcobranca:     data.codcobranca,
    codplano:        data.codplano,
    qtdprodutos:     data.qtdprodutos     ?? 0,
    valor_total:     data.valor_total     ?? 0,
    valor_desconto:  data.valor_desconto  ?? 0,
    codvendedor:     data.codvendedor,
    status:          data.status === 'I' ? 'I' : 'A',
    obs:             data.obs             ?? null,
  };
}

function normalizePedidoItem(data: any): PedidoItem {
  return {
    codpedido_item:  data.codpedido_item,
    codpedido:       data.codpedido,
    data:            data.data            || '',
    codproduto:      data.codproduto,
    quantidade:      data.quantidade      ?? 0,
    valor_tabela:    data.valor_tabela    ?? 0,
    valor_venda:     data.valor_venda     ?? 0,
    valor_total:     data.valor_total     ?? 0,
    desconto:        data.desconto        ?? 0,
    valor_desconto:  data.valor_desconto  ?? 0,
  };
}

function normalizePedidoDetalhe(data: any): PedidoDetalhe {
  return {
    ...normalizePedidoCabecalho(data),
    itens: Array.isArray(data.itens)
      ? data.itens.map(normalizePedidoItem)
      : [],
  };
}

export const pedidoService = {
  // Lançar novo pedido
  async lancar(pedido: PedidoCreate): Promise<LancarPedidoResponse> {
    const response = await apiClient.post<LancarPedidoResponse>(
      '/pedidos/lancar',
      pedido
    );
    return response as unknown as LancarPedidoResponse;
  },

  // Listar pedidos (cabeçalhos)
  async listar(page = 1, pageSize = 10): Promise<{ pedidos: PedidoCabecalho[]; total: number; page: number; per_page: number }> {
    const response = await apiClient.get('/pedidos/listar', {
      params: { page, page_size: pageSize },
    });
    return {
      ...(response as any),
      pedidos: ((response as any).pedidos ?? []).map(normalizePedidoCabecalho),
    };
  },

  // Buscar pedido por ID (com itens)
  async obter(codpedido: number): Promise<PedidoDetalhe> {
    const response = await apiClient.get<ApiResponse<PedidoDetalhe>>(
      `/pedidos/buscar/${codpedido}`
    );
    return normalizePedidoDetalhe((response as any).data ?? response);
  },

  // Buscar pedidos por cliente
  async buscarPorCliente(codcliente: number): Promise<PedidoCabecalho[]> {
    const response = await apiClient.get<PedidoCabecalho[]>(
      `/pedidos/buscar?codcliente=${codcliente}`
    );
    return ((response as any) ?? []).map(normalizePedidoCabecalho);
  },

  // Cancelar pedido (status -> 'I')
  async cancelar(codpedido: number): Promise<ApiResponse> {
    return apiClient.put(`/pedidos/cancelar/${codpedido}`);
  },
};

export type { PedidoCabecalho, PedidoItem, PedidoDetalhe, LancarPedidoResponse };