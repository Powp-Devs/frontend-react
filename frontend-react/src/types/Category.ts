export interface Category {
    codcategoria: number;
    categoria: string;
    status: 'A' | 'I';
    dtcadastro: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Category;
