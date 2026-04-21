import { useState, useEffect } from 'react';
import { Supplier, SortColumn, SortDirection } from '@/types/Supplier';
import { fornecedorService } from '@/services/fornecedorService';

export const useSupplierManager = () => {
    const [suppliers, setSuppliers]               = useState<Supplier[]>([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]             = useState<{ column: SortColumn; direction: SortDirection }>({
        column:    'codfornecedor',
        direction: 'asc',
    });
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [currentPage]           = useState(1);
    const [pageSize]              = useState(10);

    // ── Carga inicial ──────────────────────────────────────
    useEffect(() => {
        loadSuppliers();
    }, [currentPage]);

    const loadSuppliers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { suppliers: data } = await fornecedorService.listar(currentPage, pageSize);
            setSuppliers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores');
        } finally {
            setLoading(false);
        }
    };

    // ── CRUD ───────────────────────────────────────────────

    const addSupplier = async (supplierData: Omit<Supplier, 'codfornecedor'>) => {
        try {
            const newSupplier = await fornecedorService.criar(supplierData);
            setSuppliers((prev) => [...prev, newSupplier]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar fornecedor';
            setError(msg);
            throw err;    // re-lança para o componente exibir o toast
        }
    };

    const updateSupplier = async (codfornecedor: number, updatedData: Partial<Supplier>) => {
        try {
            const updated = await fornecedorService.atualizar(codfornecedor, updatedData);
            setSuppliers((prev) =>
                prev.map((s) => (s.codfornecedor === codfornecedor ? updated : s))
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar fornecedor';
            setError(msg);
            throw err;
        }
    };

    const deleteSupplier = async (codfornecedor: number) => {
        try {
            await fornecedorService.deletar(codfornecedor);
            setSuppliers((prev) => prev.filter((s) => s.codfornecedor !== codfornecedor));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao deletar fornecedor';
            setError(msg);
            throw err;
        }
    };

    /**
     * Busca um fornecedor completo (com endereço e contato) por ID.
     * Usado pelo modal de edição.
     * ← adicionado: CadastroFornecedor chamava getSupplier mas o hook não o expunha.
     */
    const getSupplier = async (codfornecedor: number): Promise<Supplier> => {
        return fornecedorService.obter(codfornecedor);
    };

    // ── Seleção ────────────────────────────────────────────

    /**
     * toggleSelection — nome usado em CadastroFornecedor.
     * ← corrigido: o hook expunha toggleSelectSupplier (nome divergente).
     */
    const toggleSelection = (codfornecedor: number) => {
        setSelectedSuppliers((prev) => {
            const next = new Set(prev);
            next.has(codfornecedor) ? next.delete(codfornecedor) : next.add(codfornecedor);
            return next;
        });
    };

    const toggleSelectAll = (displaySuppliers: Supplier[]) => {
        if (displaySuppliers.length === 0) {
            setSelectedSuppliers(new Set());
            return;
        }
        const allSelected = displaySuppliers.every((s) =>
            selectedSuppliers.has(s.codfornecedor)
        );
        setSelectedSuppliers(
            allSelected
                ? new Set()
                : new Set(displaySuppliers.map((s) => s.codfornecedor))
        );
    };

    // ── Ordenação ──────────────────────────────────────────
    const handleSort = (column: SortColumn) => {
        setSortConfig((current) => ({
            column,
            direction:
                current.column === column && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // ── Export CSV ─────────────────────────────────────────
    const exportToCSV = () => {
        const columns: (keyof Supplier)[] = [
            'codfornecedor', 'fornecedor', 'fantasia', 'cnpj', 'inscricaoestadual',
            'tipopessoa', 'dtcadastro', 'obs', 'bloqueio', 'motivo_bloq', 'dtbloqueio',
            'nome_representante', 'cpf_representante',
            'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf', 'pais',
            'telefone', 'celular', 'email', 'email2',
        ];

        const header = columns.join(',');
        const rows = suppliers.map((s) =>
            columns
                .map((col) => `"${String(s[col] ?? '').replace(/"/g, '""')}"`)
                .join(',')
        );

        const blob = new Blob([[header, ...rows].join('\n')], {
            type: 'text/csv;charset=utf-8;',
        });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', 'fornecedores.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Filtro + ordenação local ───────────────────────────
    const getProcessedSuppliers = (searchTerm: string): Supplier[] => {
        let result = [...suppliers];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (s) =>
                    s.fornecedor.toLowerCase().includes(term) ||
                    s.cnpj.toLowerCase().includes(term)       ||
                    s.email.toLowerCase().includes(term)
            );
        }

        result.sort((a, b) => {
            const aVal = a[sortConfig.column];
            const bVal = b[sortConfig.column];
            if (aVal === undefined || bVal === undefined) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortConfig.direction === 'asc'
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });

        return result;
    };

    return {
        suppliers,
        selectedSuppliers,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedSuppliers,
        reloadSuppliers: loadSuppliers,
    };
};
