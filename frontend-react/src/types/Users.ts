export interface User {
    codusuario: number;
    nome: string;
    email: string;
    usuario: string;
    senha: string;          // campo local no form; enviado como senha_hash para a API
    data_criacao: string;
    data_alteracao?: string;
    ativo: 'S' | 'N';
    obs?: string;
    codempregado: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof User;
