import apiClient from './api';
import { EstoqueItem, EstoqueUpdatePayload, Movimentacao } from '@/types/Estoque';

interface ListResponse {
    status: number;
    message: string;
    data: EstoqueItem[];
    total: number;
    page: number;
    per_page: number;
}

interface SingleResponse {
    status: number;
    message: string;
    data: EstoqueItem;
}

interface ValidarResponse {
    status: number;
    message: string;
    codproduto: number;
    estoque_disponivel: number;
}

function normalize(raw: any): EstoqueItem {
    return {
        codestoque:        raw.codestoque        ?? 0,
        codproduto:        raw.codproduto        ?? 0,
        estoque:           Number(raw.estoque)           ?? 0,
        estoque_minimo:    Number(raw.estoque_minimo)    ?? 0,
        estoque_reservado: Number(raw.estoque_reservado) ?? 0,
        estoque_bloqueado: Number(raw.estoque_bloqueado) ?? 0,
        data_cadastro:     raw.data_cadastro     ?? null,
        data_ultent:       raw.data_ultent       ?? null,
        obs:               raw.obs               ?? null,
        produto:           raw.produto           ?? '',
        sku:               raw.sku               ?? '',
    };
}

export const estoqueService = {
    async listar(page = 1, perPage = 20): Promise<ListResponse> {
        const res = await apiClient.get<ListResponse>('/estoque/listar', {
            params: { page, per_page: perPage },
        });
        return { ...res, data: (res.data ?? []).map(normalize) };
    },

    async buscar(codproduto: number): Promise<EstoqueItem> {
        const res = await apiClient.get<SingleResponse>(`/estoque/buscar/${codproduto}`);
        return normalize(res.data);
    },

    async validar(codproduto: number): Promise<ValidarResponse> {
        return apiClient.get<ValidarResponse>(`/estoque/validar/${codproduto}`);
    },

    // PUT /estoque/atualizar/{codproduto}?usuario_logado_id=X
    async atualizar(codproduto: number, usuarioId: number, payload: EstoqueUpdatePayload): Promise<EstoqueItem> {
        const res = await apiClient.put<SingleResponse>(
            `/estoque/atualizar/${codproduto}`,
            payload,
            { params: { usuario_logado_id: usuarioId } }
        );
        return normalize(res.data);
    },

    async excluir(codproduto: number): Promise<void> {
        await apiClient.delete(`/estoque/excluir/${codproduto}`);
    },
};
