import apiClient from './api';
import { Category } from '@/types/Category';

interface ApiResponse<T> {
    status: number;
    message?: string;
    data?: T;
    success?: boolean;
}

interface PaginatedResponse {
    categoria: any[];
    total: number;
    page: number;
    per_page: number;
}

function normalizeCategoryData(data: any): Category {
    return {
        codcategoria: data.codcategoria,
        categoria:    data.categoria || '',
        status:       data.status === 'A' ? 'A' : 'I',
        dtcadastro:   data.dtcadastro || '',
    };
}

export const categoriaService = {

    async listar(page = 1, perPage = 10): Promise<{ categories: Category[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get<PaginatedResponse>('/categoria/listar', {
            params: { page, per_page: perPage },
        });

        const dadosApi = (response as any).data || response;
        const lista = dadosApi.categoria || dadosApi.data || [];
        const categories = lista.map((c: any) => normalizeCategoryData(c));

        return {
            categories,
            total:   dadosApi.total    || 0,
            page:    dadosApi.page     || 1,
            perPage: dadosApi.per_page || perPage,
        };
    },

    async obter(codcategoria: number): Promise<Category> {
        const response = await apiClient.get<ApiResponse<any>>(`/categoria/buscar/${codcategoria}`);
        const raw = (response as any).data || response;
        return normalizeCategoryData(raw.data ?? raw);
    },

    async criar(category: Omit<Category, 'codcategoria' | 'dtcadastro' | 'status'>): Promise<Category> {
        const payload = { categoria: category.categoria };
        const response = await apiClient.post<ApiResponse<any>>('/categoria/cadastrar', payload);
        const raw = (response as any).data || response;
        return normalizeCategoryData(raw.data ?? raw);
    },

    async atualizar(codcategoria: number, category: Pick<Category, 'categoria' | 'status'>): Promise<Category> {
        const payload = { categoria: category.categoria, status: category.status };
        const response = await apiClient.put<ApiResponse<any>>(`/categoria/atualizar/${codcategoria}`, payload);
        const raw = (response as any).data || response;
        return normalizeCategoryData(raw.data ?? raw);
    },

    async inativar(codcategoria: number): Promise<void> {
        await apiClient.put(`/categoria/inativar`, null, { params: { codcategoria } });
    },

    async deletar(codcategoria: number): Promise<void> {
        await apiClient.delete(`/categoria/excluir/${codcategoria}`);
    },
};
