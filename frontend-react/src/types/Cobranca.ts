export interface Cobranca {
    codcobranca: number;
    cobranca: string;
    status: 'A' | 'I';
    dtcadastro: string;
}

export interface Plano {
    codplano: number;
    plano: string;
    status: 'A' | 'I';
    dtcadastro: string;
    numdias: number;
    prazo1?: number | null;
    prazo2?: number | null;
    prazo3?: number | null;
    prazo4?: number | null;
    prazo5?: number | null;
    prazo6?: number | null;
}

export type SortDirection = 'asc' | 'desc';
export type CobrancaSortColumn = keyof Cobranca;
export type PlanoSortColumn = keyof Plano;
