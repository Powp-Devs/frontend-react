import apiClient from "./api";
import { Parametro } from '@/types/Parametro';

interface PaginatedResponse {
    parametros: Parametro[];
    total: number;
    page: number;
    per_page: number;
}

export const parametroService = {
    async listar(page = 1, perPage = 10): Promise<{ parametros: Parametro[]; total: number }> {
        const response = await apiClient.get<PaginatedResponse>('/parametros/listar', {
            params: { page, per_page: perPage },
        });

        const data = (response as any).data || response;

        return {
            parametros: data.parametros || [],
            total: data.total || 0,
        };
    },

    async atualizar(codparametro: number, valor: string, status: string, codusuario: number): Promise<Parametro> {
        const payload = {
            valor,
            status,
            codusuario_alteracao: codusuario
        };

        const response = await apiClient.put(`/parametros/atualizar/${codparametro}`, payload);
        const data = (response as any).data || response;
        return data.data;
    }
}