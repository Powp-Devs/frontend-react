import axios from 'axios';
import api from './api';
import apiClient from './api';
import { Product } from '@/types/Product';

interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  success?: boolean;
}

interface PaginatedResponse<T> {
  status: number;
  produto: T[];
  obs: any[];
  total: number;
  page: number;
  per_page: number;
}


export const produtoService = {
  // Obter todos os produtos
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/produtos/listar', {
      params: { page, page_size: pageSize }
    });
    return response;
  },
  // Obter produto por ID
  async obter(codproduto: number): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/produtos/${codproduto}`);
    return response.data as Product;
  },

  // Criar novo produto
  async criar(produto: Omit<Product, 'codproduto'>): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/produtos/cadastrar', produto);
    return response.data as Product;
  },

  // Atualizar produto
  async atualizar(codproduto: number, produto: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/produtos/${codproduto}`, produto);
    return response.data as Product;
  },

  // Atualizar preço do produto
  async atualizarPreco(codproduto: number, preco_venda: number): Promise<Product> {
    const response = await apiClient.patch<ApiResponse<Product>>(`/produtos/${codproduto}/preco`, { preco_venda });
    return response.data as Product;
  },

  // Deletar produto
  async deletar(codproduto: number): Promise<void> {
    return apiClient.delete(`/produtos/${codproduto}`);
  },

  // Buscar produtos por texto
  async buscar(termo: string): Promise<Product[]> {
    return apiClient.get(`/produtos/buscar?termo=${termo}`);
  },
  
};
