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
  produtos: T[];
  obs: any[];
  total: number;
  page: number;
  per_page: number;
}
function normalizeProductData(data: any): Product {
    return {
        // Campos PWPRODUTO
        codproduto:    data.codproduto,
        produto:       data.produto       || '',
        obs:           data.obs           || '',
        embalagem:     data.embalagem     || '',
        sku:           data.sku           || '',
        unidade:       data.unidade       || '',
        gtin:          data.gtin          || '',
        ean:           data.ean           || '',
        status:        data.status === 'I' ? 'I' : 'A',
        codfornecedor: data.codfornecedor,
        // Campos PWTABPR
        custo:         data.custo        ?? undefined,
        preco_venda:   data.preco_venda  ?? undefined,
        margem:        data.margem       ?? 0,
    };
}
export const produtoService = {
  // Obter todos os produtos
  async listar(page = 1, pageSize = 10): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/produtos/listar', {
      params: { page, page_size: pageSize }
    });
    return {
      ...response,
      produtos: (response.produtos ?? []).map(normalizeProductData),
    };
  },
  // Obter produto por ID
   async obter(codproduto: number): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/produtos/buscar/${codproduto}`);
    return normalizeProductData(response.data);
  },

  // Criar novo produto
  async criar(produto: Omit<Product, 'codproduto'>): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/produtos/cadastrar', produto);
    return normalizeProductData(response.data);
  },

  // Atualizar produto
  async atualizar(codproduto: number, produto: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/produtos/atualizar/${codproduto}`, produto);
    return normalizeProductData(response.data);
  },

  // Atualizar preço do produto
  async atualizarPreco(codproduto: number, preco_venda: number): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/produtos/atualizar/preco/${codproduto}`, { preco_venda });
    return normalizeProductData(response.data);
  },

  // Deletar produto
  async deletar(codproduto: number): Promise<void> {
    return apiClient.delete(`/produtos/excluir/${codproduto}`);
  },
  // Buscar produtos por texto
  async buscar(termo: string): Promise<Product[]> {
    return apiClient.get(`/produtos/buscar?termo=${termo}`);
  },
  
};
