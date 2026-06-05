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
        sku:           data.sku           || '',
        embalagem:     data.embalagem     || '',
        unidade:       data.unidade       || '',
        gtin:          data.gtin          || '',
        ean:           data.ean           || '',
        status:        data.status === 'I' ? 'I' : 'A',
        obs:           data.obs           || '',
        codfornecedor: data.codfornecedor  ?? 0,
        codcategoria:  data.codcategoria   ?? 0,
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

  // Criar novo produto — envia APENAS os campos da rota /produtos/cadastrar
  async criar(produto: Omit<Product, 'codproduto' | 'estoque' | 'estoque_minimo'>): Promise<Product> {
    const payload = {
      produto:       produto.produto,
      sku:           produto.sku,
      embalagem:     produto.embalagem,
      unidade:       produto.unidade,
      gtin:          produto.gtin,
      ean:           produto.ean,
      status:        produto.status,
      obs:           produto.obs,
      codfornecedor: produto.codfornecedor,
      codcategoria:  produto.codcategoria,
      custo:         produto.custo ?? 0,
      preco_venda:   produto.preco_venda ?? 0,
      margem:        produto.margem ?? 0,
    };
    const response = await apiClient.post<ApiResponse<Product>>('/produtos/cadastrar', payload);
    
    console.log('Resposta criar:', response);
    const raw = response?.data ?? response; 

    const produtoRetornado = (raw as any).produto || raw;

    /*if (!raw || typeof raw !== 'object' || !(raw as any).codproduto) {
        return {} as Product;
    }*/

    if (!produtoRetornado || !produtoRetornado.codproduto) {
        throw new Error("Erro interno: A API não retornou o código do produto criado.");
    }

    return normalizeProductData(produtoRetornado);
  },

  // FUNÇÃO PARA O ESTOQUE
  async cadastrarEstoque(dadosEstoque: {
    codproduto: number;
    estoque: number;
    estoque_minimo: number;
    estoque_reservado: number;
    estoque_bloqueado: number;
    obs: string;
  }): Promise<void> {
    // Atenção: Confirme se a sua rota no FastAPI é exatamente '/estoque/cadastrar'
    await apiClient.post('/estoque/cadastrar', dadosEstoque);
  },

  // Atualizar produto — envia APENAS os campos da rota /produtos/atualizar
  async atualizar(codproduto: number, produto: Partial<Product>): Promise<Product> {
    const payload: Record<string, any> = {};
    const camposProduto = ['produto','sku','embalagem','unidade','gtin','ean','status','obs','codfornecedor','codcategoria','custo','preco_venda','margem'] as const;
    camposProduto.forEach(k => { if (produto[k] !== undefined) payload[k] = produto[k]; });
    const response = await apiClient.put<ApiResponse<Product>>(`/produtos/atualizar/${codproduto}`, payload);
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
