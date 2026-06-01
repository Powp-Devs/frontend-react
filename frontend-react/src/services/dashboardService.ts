import apiClient from './api';
import type {
  DashboardVendasResponse,
  DashboardEstoqueResponse,
  DashboardClientesResponse,
} from '@/types/Dashboard';

export const dashboardService = {
  getVendas: () =>
    apiClient.get<DashboardVendasResponse>('/dashboard/vendas'),

  getEstoque: () =>
    apiClient.get<DashboardEstoqueResponse>('/dashboard/estoque'),

  getClientes: () =>
    apiClient.get<DashboardClientesResponse>('/dashboard/clientes'),
};
