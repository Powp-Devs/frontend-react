import apiClient from './api';
import type {
  DashboardVendasResponse,
  DashboardEstoqueResponse,
  DashboardClientesResponse,
} from '@/types/Dashboard';

export const dashboardService = {
  getVendas: (dataInicial?: string, dataFinal?: string) =>
    apiClient.get<DashboardVendasResponse>('/dashboard/vendas', {
      params: {
        dtinicio: dataInicial,
        dtfim: dataFinal
      }
    }),

  getEstoque: () =>
    apiClient.get<DashboardEstoqueResponse>('/dashboard/estoque'),

  getClientes: () =>
    apiClient.get<DashboardClientesResponse>('/dashboard/clientes'),
};
