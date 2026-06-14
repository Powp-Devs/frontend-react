import apiClient from './api';
import { Cobranca, Plano } from '@/types/Cobranca';

interface ApiResponse<T> {
    status: number;
    message?: string;
    data?: T;
}

// ── Normalização ──────────────────────────────────────────

function normalizeCobranca(data: any): Cobranca {
    return {
        codcobranca: data.codcobranca,
        cobranca:    data.cobranca   || '',
        status:      data.status === 'A' ? 'A' : 'I',
        dtcadastro:  data.dtcadastro || '',
    };
}

function normalizePlano(data: any): Plano {
    return {
        codplano:   data.codplano,
        plano:      data.plano      || '',
        status:     data.status === 'A' ? 'A' : 'I',
        dtcadastro: data.dtcadastro || '',
        numdias:    data.numdias    ?? 0,
        prazo1:     data.prazo1     ?? null,
        prazo2:     data.prazo2     ?? null,
        prazo3:     data.prazo3     ?? null,
        prazo4:     data.prazo4     ?? null,
        prazo5:     data.prazo5     ?? null,
        prazo6:     data.prazo6     ?? null,
    };
}

// ── Cobrança ──────────────────────────────────────────────

export const cobrancaService = {

    async listarCobrancas(page = 1, perPage = 10): Promise<{ cobrancas: Cobranca[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get('/pagamento/listar/cobranca', {
            params: { page, per_page: perPage },
        });
        const raw = (response as any).data || response;
        // ATENÇÃO: backend retorna "plano" em vez de "cobranca" — tratar os dois
        const lista = raw.cobranca || raw.plano || raw.data || [];
        return {
            cobrancas: lista.map(normalizeCobranca),
            total:     raw.total    || 0,
            page:      raw.page     || 1,
            perPage:   raw.per_page || perPage,
        };
    },

    async criarCobranca(dados: Omit<Cobranca, 'codcobranca' | 'dtcadastro'>): Promise<Cobranca> {
        const response = await apiClient.post<ApiResponse<any>>('/pagamento/cadastrar/cobranca', {
            cobranca: dados.cobranca,
            status:   dados.status,
        });
        const raw = (response as any).data || response;
        return normalizeCobranca(raw.data ?? raw);
    },

    async atualizarCobranca(codcobranca: number, dados: Omit<Cobranca, 'codcobranca' | 'dtcadastro'>): Promise<Cobranca> {
        const response = await apiClient.put<ApiResponse<any>>(`/pagamento/atualizar/cobranca/${codcobranca}`, {
            cobranca: dados.cobranca,
            status:   dados.status,
        });
        const raw = (response as any).data || response;
        return normalizeCobranca(raw.data ?? raw);
    },

    async inativarCobranca(codcobranca: number): Promise<void> {
        await apiClient.put(`/pagamento/inativar/cobranca/${codcobranca}`);
    },

    async excluirCobranca(codcobranca: number): Promise<void> {
        await apiClient.delete(`/pagamento/excluir/cobranca/${codcobranca}`);
    },
};

// ── Plano de Pagamento ────────────────────────────────────

export const planoService = {

    async listarPlanos(page = 1, perPage = 10): Promise<{ planos: Plano[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get('/pagamento/listar/plano', {
            params: { page, per_page: perPage },
        });
        const raw = (response as any).data || response;
        const lista = raw.plano || raw.data || [];
        return {
            planos:  lista.map(normalizePlano),
            total:   raw.total    || 0,
            page:    raw.page     || 1,
            perPage: raw.per_page || perPage,
        };
    },

    async criarPlano(dados: Omit<Plano, 'codplano' | 'dtcadastro'>): Promise<Plano> {
        const response = await apiClient.post<ApiResponse<any>>('/pagamento/cadastrar/plano', buildPlanoPayload(dados));
        const raw = (response as any).data || response;
        return normalizePlano(raw.plano ?? raw.data ?? raw);
    },

    async atualizarPlano(codplano: number, dados: Omit<Plano, 'codplano' | 'dtcadastro'>): Promise<Plano> {
        const response = await apiClient.put<ApiResponse<any>>(`/pagamento/atualizar/plano/${codplano}`, buildPlanoPayload(dados));
        const raw = (response as any).data || response;
        return normalizePlano(raw.data ?? raw);
    },

    async inativarPlano(codplano: number): Promise<void> {
        await apiClient.put(`/pagamento/inativar/plano/${codplano}`);
    },

    async excluirPlano(codplano: number): Promise<void> {
        await apiClient.delete(`/pagamento/excluir/plano/${codplano}`);
    },
};

function buildPlanoPayload(dados: Omit<Plano, 'codplano' | 'dtcadastro'>) {
    return {
        plano:   dados.plano,
        status:  dados.status,
        numdias: dados.numdias ?? 0,
        prazo1:  dados.prazo1  ?? null,
        prazo2:  dados.prazo2  ?? null,
        prazo3:  dados.prazo3  ?? null,
        prazo4:  dados.prazo4  ?? null,
        prazo5:  dados.prazo5  ?? null,
        prazo6:  dados.prazo6  ?? null,
    };
}
