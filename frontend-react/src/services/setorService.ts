import apiClient from './api';
import { Sector } from '@/types/Sector';

// -------------------------------------------------------
// Tipos de resposta — espelham exatamente o que o backend retorna
// -------------------------------------------------------
interface ApiResponse<T> {
    status: number;
    message?: string;
    data?: T;
    success?: boolean;
}

interface PaginatedResponse {
    setor: any[];
    total: number;
    page: number;
    per_page: number;
}

// -------------------------------------------------------
// Normalização — converte dados brutos para Sector
// -------------------------------------------------------
function normalizeSectorData(data: any): Sector {
    return {
        codsetor: data.codsetor,
        setor: data.setor || '',
        status: data.status === 'A' ? 'A' : 'I',
        dtcadastro: data.dtcadastro || '',
    };
}

// -------------------------------------------------------
// Service
// -------------------------------------------------------
export const setorService = {

    /**
     * Listar setores com paginação.
     * Rota: GET /setor/listar?page=&per_page=
     */
    async listar(page = 1, perPage = 10): Promise<{ sectors: Sector[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get<PaginatedResponse>('/setor/listar', {
            params: { page, per_page: perPage },
        });

        const sectors = response.setor.map((s: any) => normalizeSectorData(s));

        return { sectors, total: response.total, page: response.page, perPage: response.per_page };
    },

    /**
     * Obter setor por ID.
     * Rota: GET /setor/buscar/{codsetor}
     */
    async obter(codsetor: number): Promise<Sector> {
        const response = await apiClient.get<ApiResponse<any>>(`/setor/buscar/${codsetor}`);
        return normalizeSectorData(response.data ?? response);
    },

    /**
     * Criar setor.
     * Rota: POST /setor/cadastrar
     */
    async criar(sector: Omit<Sector, 'codsetor' | 'dtcadastro'>): Promise<Sector> {
        const payload = {
            setor: sector.setor,
            status: sector.status,
        };
        const response = await apiClient.post<ApiResponse<any>>('/setor/cadastrar', payload);
        return normalizeSectorData(response.data ?? response);
    },

    /**
     * Atualizar setor (inativar).
     * Rota: PUT /setor/inativar/{codsetor}
     */
    async inativar(codsetor: number): Promise<Sector> {
        const response = await apiClient.put<ApiResponse<any>>(`/setor/inativar/${codsetor}`);
        return normalizeSectorData(response.data ?? response);
    },

    /**
     * Deletar setor.
     * Rota: DELETE /setor/delete/{codsetor}
     */
    async deletar(codsetor: number): Promise<void> {
        await apiClient.delete(`/setor/delete/${codsetor}`);
    },
};
