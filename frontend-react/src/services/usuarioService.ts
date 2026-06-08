import apiClient from "./api";
import { User } from '@/types/Users';

interface ApiResponse<T> {
    status: number;
    message?: string;
    data?: T;
}

interface PaginatedResponse {
    status: number;
    usuarios: any[];
    total: number;
    page: number;
    per_page: number;
}

function normalizeUserData(data: any): User {
    return {
        codusuario:     data.codusuario,
        nome:           data.nome           || '',
        email:          data.email          || '',
        usuario:        data.usuario        || '',
        senha:          '',                         // nunca expõe o hash
        data_criacao:   data.data_criacao   || '',
        data_alteracao: data.data_alteracao || '',
        ativo:          data.ativo === 'S' ? 'S' : 'N',
        obs:            data.obs            || '',
        codempregado:   data.codempregado   || 0,
    };
}

export const usuarioService = {

    async listar(page = 1, perPage = 10): Promise<{ users: User[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get<PaginatedResponse>('/usuarios/listar', {
            params: { page, per_page: perPage },
        });

        const rawData = (response as any).data || response;
        const lista   = rawData.usuarios || rawData.data || [];

        return {
            users:   lista.map(normalizeUserData),
            total:   rawData.total    || 0,
            page:    rawData.page     || 1,
            perPage: rawData.per_page || perPage,
        };
    },

    async obter(codusuario: number): Promise<User> {
        const response = await apiClient.get<ApiResponse<any>>(`/usuarios/buscar/${codusuario}`);
        const raw = (response as any).data || response;
        return normalizeUserData(raw.data ?? raw);
    },

    async criar(user: Omit<User, 'codusuario' | 'data_criacao' | 'data_alteracao'>): Promise<User> {
        const payload = {
            nome:         user.nome,
            email:        user.email,
            usuario:      user.usuario,
            senha_hash:   user.senha,
            data_criacao: new Date().toISOString(),
            ativo:        user.ativo ?? 'S',
            obs:          user.obs   ?? '',
            codempregado: user.codempregado,
        };
        const response = await apiClient.post<ApiResponse<any>>('/usuarios/cadastrar', payload);
        const raw = (response as any).data || response;
        return normalizeUserData(raw.data ?? raw);
    },

    async atualizar(codusuario: number, user: Partial<User> & { motivo: string }): Promise<User> {
        const payload = {
            nome:           user.nome         || '',
            email:          user.email        || '',
            usuario:        user.usuario      || '',
            senha_hash:     user.senha        || '',
            data_alteracao: new Date().toISOString(),
            ativo:          user.ativo        ?? 'S',
            obs:            user.obs          ?? '',
            codempregado:   user.codempregado || 0,
            motivo:         user.motivo,
        };
        const response = await apiClient.put<ApiResponse<any>>(`/usuarios/atualizar/${codusuario}`, payload);
        const raw = (response as any).data || response;
        return normalizeUserData(raw.data ?? raw);
    },

    async inativar(codusuario: number, motivo: string): Promise<void> {
        await apiClient.put(`/usuarios/inativar/${codusuario}`, null, {
            params: { motivo },
        });
    },

    async deletar(codusuario: number, motivo: string): Promise<void> {
        await apiClient.delete(`/usuarios/excluir/${codusuario}`, {
            params: { motivo },
        });
    },
};
