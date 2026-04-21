export interface Supplier {

//Campos fornecedor
    codfornecedor: number;
    fornecedor: string;
    fantasia: string;
    cnpj: string;
    inscricaoestadual: string;
    tipopessoa: 'J' | 'F';
    dtcadastro: string;
    obs: string;
    bloqueio: string;
    motivo_bloq: string;
    dtbloqueio: string;
    nome_representante: string;
    cpf_representante: string;

//Campos endereço
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    pais: string;

//Campos contato
    telefone: string;
    celular: string;
    email: string;
    email2: string;

}

export type SortDirection = 'asc' | 'desc';
export type SortColumn = keyof Supplier;
