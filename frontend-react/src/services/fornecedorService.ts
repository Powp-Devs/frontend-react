import apiClient from './api';
import { Supplier } from '@/types/Supplier';

// -------------------------------------------------------
// Tipos de resposta — espelham exatamente o que o backend retorna
// -------------------------------------------------------
interface ApiResponse<T> {
    status: number;
    message?: string;
    data?: T;
    success?: boolean;
}

/**
 * Resposta de list_fornecedor: backend retorna três arrays separados.
 * endereco e contato são indexados por codendereco / codcontato,
 * referenciados no objeto Fornecedor via codendereco / codtelefone.
 */
interface PaginatedResponse {
    fornecedor: any[];
    endereco:   any[];
    contato:    any[];
    total:      number;
    page:       number;
    per_page:   number;
}

// -------------------------------------------------------
// Normalização — usada tanto no GET by ID quanto na listagem
// -------------------------------------------------------
function normalizeSupplierData(data: any, endereco: any = {}, contato: any = {}): Supplier {
    // Na resposta de obter() os dados já vêm aninhados em data.endereco / data.contato.
    // Na listagem passamos os objetos separados via parâmetros.
    const end = data.endereco ?? endereco;
    const con = data.contato  ?? contato;

    return {
        codfornecedor:      data.codfornecedor,
        fornecedor:         data.fornecedor         || '',
        fantasia:           data.fantasia            || '',
        cnpj:               data.cnpj               || '',
        inscricaoestadual:  data.inscricaoestadual   || '',
        tipopessoa:         data.tipopessoa === 'F' ? 'F' : 'J',   // ← corrigido: 'J' || 'F' sempre retornava 'J'
        dtcadastro:         data.dtcadastro          || '',
        obs:                data.obs                 || '',
        bloqueio:           data.bloqueio            || 'N',
        motivo_bloq:        data.motivo_bloqueio     || '',   // ← backend usa motivo_bloqueio
        dtbloqueio:         data.dtbloqueio          || '',
        nome_representante: data.nome_representante  || '',
        cpf_representante:  data.cpf_representante   || '',
        // Endereço
        cep:        end.cep        || '',
        logradouro: end.logradouro || '',
        numero:     end.numero?.toString() || '',
        bairro:     end.bairro     || '',
        cidade:     end.cidade     || '',
        uf:         end.uf         || '',
        pais:       end.pais       || '',
        // Contato
        telefone: con.telefone || '',
        celular:  con.celular  || '',
        email:    con.email    || '',
        email2:   con.email2   || '',
    };
}

// -------------------------------------------------------
// Service
// -------------------------------------------------------
export const fornecedorService = {

    /**
     * Listar com paginação.
     * Rota correta: GET /fornecedor/listar?page=&per_page=   (não /fornecedor)
     * O backend retorna arrays separados de fornecedor, endereco e contato.
     * Aqui fazemos o join para que cada Supplier chegue completo ao hook.
     */
    async listar(page = 1, perPage = 10): Promise<{ suppliers: Supplier[]; total: number; page: number; perPage: number }> {
        const response = await apiClient.get<PaginatedResponse>('/fornecedor/listar', {
            params: { page, per_page: perPage },   // ← corrigido: per_page (não pageSize)
        });

        // Indexar endereços e contatos por código para join O(1)
        const enderecoMap = new Map<number, any>(
            response.endereco.map((e: any) => [e.codendereco, e])
        );
        const contatoMap = new Map<number, any>(
            response.contato.map((c: any) => [c.codcontato, c])
        );

        const suppliers = response.fornecedor.map((f: any) =>
            normalizeSupplierData(
                f,
                enderecoMap.get(f.codendereco) ?? {},
                contatoMap.get(f.codtelefone)  ?? {},
            )
        );

        return { suppliers, total: response.total, page: response.page, perPage: response.per_page };
    },

    /**
     * Obter fornecedor por ID.
     * ATENÇÃO: o backend não tem rota GET /fornecedor/:id.
     * Contornamos buscando a lista e filtrando pelo id.
     * Quando o backend implementar GET /fornecedor/:id, basta trocar por:
     *   const response = await apiClient.get(`/fornecedor/${codfornecedor}`);
     *   return normalizeSupplierData(response.data);
     */
    async obter(codfornecedor: number): Promise<Supplier> {
        // Busca uma página grande para garantir que o registro esteja incluso.
        // Substitua por rota dedicada quando disponível no backend.
        const { suppliers } = await this.listar(1, 500);
        const found = suppliers.find((s) => s.codfornecedor === codfornecedor);
        if (!found) throw new Error(`Fornecedor ${codfornecedor} não encontrado`);
        return found;
    },

    /**
     * Criar fornecedor.
     * Rota: POST /fornecedor/cadastrar  ← já estava correta
     * Mapeamos motivo_bloq → motivo_bloqueio para o schema do backend.
     */
    async criar(fornecedor: Omit<Supplier, 'codfornecedor'>): Promise<Supplier> {
        const payload = buildPayload(fornecedor);
        const response = await apiClient.post<ApiResponse<any>>('/fornecedor/cadastrar', payload);
        return normalizeSupplierData(response.data ?? response);
    },

    /**
     * Atualizar fornecedor.
     * Rota correta: PUT /fornecedor/atualizar/:id   (não /fornecedor/:id)
     */
    async atualizar(codfornecedor: number, fornecedor: Partial<Supplier>): Promise<Supplier> {
        const payload = buildPayload(fornecedor);
        const response = await apiClient.put<ApiResponse<any>>(
            `/fornecedor/atualizar/${codfornecedor}`,   // ← corrigido
            payload,
        );
        return normalizeSupplierData(response.data ?? response);
    },

    /**
     * Deletar fornecedor.
     * Rota correta: DELETE /fornecedor/excluir/:id  (não /fornecedor/:id)
     */
    async deletar(codfornecedor: number): Promise<void> {
        await apiClient.delete(`/fornecedor/excluir/${codfornecedor}`);   // ← corrigido
    },
};

// -------------------------------------------------------
// Helper — monta payload flat que o backend/Pydantic espera,
// traduzindo motivo_bloq → motivo_bloqueio
// -------------------------------------------------------
function buildPayload(fornecedor: Partial<Supplier>): Record<string, unknown> {
    return {
        fornecedor:         fornecedor.fornecedor         ?? '',
        fantasia:           fornecedor.fantasia           ?? '',
        cnpj:               fornecedor.cnpj?.replace(/\D/g, '') ?? '',  // envia só dígitos
        inscricaoestadual:  fornecedor.inscricaoestadual  ?? '',
        tipopessoa:         fornecedor.tipopessoa         ?? 'J',
        dtcadastro:         fornecedor.dtcadastro         ?? '',
        obs:                fornecedor.obs                ?? '',
        bloqueio:           fornecedor.bloqueio           ?? 'N',
        motivo_bloqueio:    fornecedor.motivo_bloq        ?? '',   // ← tradução de campo
        dtbloqueio:         fornecedor.dtbloqueio         || null, // null quando vazio (Optional[date])
        nome_representante: fornecedor.nome_representante ?? '',
        cpf_representante:  fornecedor.cpf_representante?.replace(/\D/g, '') ?? '',
        // Endereço
        cep:        fornecedor.cep        ?? '',
        logradouro: fornecedor.logradouro ?? '',
        numero:     fornecedor.numero     ?? '',
        bairro:     fornecedor.bairro     ?? '',
        cidade:     fornecedor.cidade     ?? '',
        uf:         fornecedor.uf         ?? '',
        pais:       fornecedor.pais       ?? '',
        // Contato
        telefone: fornecedor.telefone ?? '',
        celular:  fornecedor.celular  ?? '',
        email:    fornecedor.email    ?? '',
        email2:   fornecedor.email2   || null,   // null quando vazio (Optional[EmailStr])
    };
}
