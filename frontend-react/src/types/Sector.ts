export interface Sector {
    codsetor: number;
    setor: string;
    status: 'A' | 'I';
    dtcadastro: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Sector;
