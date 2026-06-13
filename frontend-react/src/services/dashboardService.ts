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

  getEstoque: (dataInicial?: string, dataFinal?: string) =>
    apiClient.get<DashboardEstoqueResponse>('/dashboard/estoque', {
      params: {
        dtinicio: dataInicial,
        dtfim: dataFinal
      }
    }),

  getClientes: (dataInicial?: string, dataFinal?: string) =>
    apiClient.get<DashboardClientesResponse>('/dashboard/clientes', {
      params: {
        dtinicio: dataInicial,
        dtfim: dataFinal
      }
    }), 
};
