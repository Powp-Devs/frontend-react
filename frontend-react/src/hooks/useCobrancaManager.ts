import { useState, useEffect } from 'react';
import { Cobranca, Plano, CobrancaSortColumn, PlanoSortColumn, SortDirection } from '@/types/Cobranca';
import { cobrancaService, planoService } from '@/services/cobrancaService';

// ── Hook de Cobranças ─────────────────────────────────────

export const useCobrancaManager = () => {
    const [cobrancas, setCobrancas]                 = useState<Cobranca[]>([]);
    const [selectedCobrancas, setSelectedCobrancas] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]               = useState<{ column: CobrancaSortColumn; direction: SortDirection }>({
        column: 'codcobranca', direction: 'asc',
    });
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize]                = useState(10);
    const [totalItems, setTotalItems]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    useEffect(() => { loadCobrancas(); }, [currentPage]);

    const loadCobrancas = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await cobrancaService.listarCobrancas(currentPage, pageSize);
            setCobrancas(res.cobrancas || []);
            const total = res.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize) || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar cobranças');
        } finally {
            setLoading(false);
        }
    };

    const addCobranca = async (dados: Omit<Cobranca, 'codcobranca' | 'dtcadastro'>) => {
        try {
            const nova = await cobrancaService.criarCobranca(dados);
            setCobrancas((prev) => [...prev, nova]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar cobrança';
            setError(msg); throw err;
        }
    };

    const updateCobranca = async (codcobranca: number, dados: Omit<Cobranca, 'codcobranca' | 'dtcadastro'>) => {
        try {
            const updated = await cobrancaService.atualizarCobranca(codcobranca, dados);
            setCobrancas((prev) => prev.map((c) => (c.codcobranca === codcobranca ? updated : c)));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar cobrança';
            setError(msg); throw err;
        }
    };

    const deleteCobranca = async (codcobranca: number) => {
        try {
            await cobrancaService.excluirCobranca(codcobranca);
            setCobrancas((prev) => prev.filter((c) => c.codcobranca !== codcobranca));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao excluir cobrança';
            setError(msg); throw err;
        }
    };

    const toggleSelection = (codcobranca: number) => {
        setSelectedCobrancas((prev) => {
            const next = new Set(prev);
            next.has(codcobranca) ? next.delete(codcobranca) : next.add(codcobranca);
            return next;
        });
    };

    const toggleSelectAll = (list: Cobranca[]) => {
        if (list.length === 0) { setSelectedCobrancas(new Set()); return; }
        const allSelected = list.every((c) => selectedCobrancas.has(c.codcobranca));
        setSelectedCobrancas(allSelected ? new Set() : new Set(list.map((c) => c.codcobranca)));
    };

    const handleSort = (column: CobrancaSortColumn) => {
        setSortConfig((cur) => ({
            column,
            direction: cur.column === column && cur.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getProcessedCobrancas = (searchTerm: string): Cobranca[] => {
        let result = [...cobrancas];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((c) => c.cobranca.toLowerCase().includes(term));
        }
        result.sort((a, b) => {
            const aVal = a[sortConfig.column]; const bVal = b[sortConfig.column];
            if (aVal === undefined || bVal === undefined) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string')
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            return sortConfig.direction === 'asc'
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });
        return result;
    };

    return {
        cobrancas, selectedCobrancas, sortConfig, loading, error,
        addCobranca, updateCobranca, deleteCobranca,
        toggleSelection, toggleSelectAll, handleSort, getProcessedCobrancas,
        reloadCobrancas: loadCobrancas,
        currentPage, setCurrentPage, totalPages, totalItems,
    };
};

// ── Hook de Planos ────────────────────────────────────────

export const usePlanoManager = () => {
    const [planos, setPlanos]               = useState<Plano[]>([]);
    const [selectedPlanos, setSelectedPlanos] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]       = useState<{ column: PlanoSortColumn; direction: SortDirection }>({
        column: 'codplano', direction: 'asc',
    });
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize]                = useState(10);
    const [totalItems, setTotalItems]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    useEffect(() => { loadPlanos(); }, [currentPage]);

    const loadPlanos = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await planoService.listarPlanos(currentPage, pageSize);
            setPlanos(res.planos || []);
            const total = res.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize) || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
        } finally {
            setLoading(false);
        }
    };

    const addPlano = async (dados: Omit<Plano, 'codplano' | 'dtcadastro'>) => {
        try {
            const novo = await planoService.criarPlano(dados);
            setPlanos((prev) => [...prev, novo]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar plano';
            setError(msg); throw err;
        }
    };

    const updatePlano = async (codplano: number, dados: Omit<Plano, 'codplano' | 'dtcadastro'>) => {
        try {
            const updated = await planoService.atualizarPlano(codplano, dados);
            setPlanos((prev) => prev.map((p) => (p.codplano === codplano ? updated : p)));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar plano';
            setError(msg); throw err;
        }
    };

    const deletePlano = async (codplano: number) => {
        try {
            await planoService.excluirPlano(codplano);
            setPlanos((prev) => prev.filter((p) => p.codplano !== codplano));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao excluir plano';
            setError(msg); throw err;
        }
    };

    const toggleSelection = (codplano: number) => {
        setSelectedPlanos((prev) => {
            const next = new Set(prev);
            next.has(codplano) ? next.delete(codplano) : next.add(codplano);
            return next;
        });
    };

    const toggleSelectAll = (list: Plano[]) => {
        if (list.length === 0) { setSelectedPlanos(new Set()); return; }
        const allSelected = list.every((p) => selectedPlanos.has(p.codplano));
        setSelectedPlanos(allSelected ? new Set() : new Set(list.map((p) => p.codplano)));
    };

    const handleSort = (column: PlanoSortColumn) => {
        setSortConfig((cur) => ({
            column,
            direction: cur.column === column && cur.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getProcessedPlanos = (searchTerm: string): Plano[] => {
        let result = [...planos];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((p) => p.plano.toLowerCase().includes(term));
        }
        result.sort((a, b) => {
            const aVal = a[sortConfig.column]; const bVal = b[sortConfig.column];
            if (aVal === undefined || bVal === undefined) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string')
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            return sortConfig.direction === 'asc'
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });
        return result;
    };

    return {
        planos, selectedPlanos, sortConfig, loading, error,
        addPlano, updatePlano, deletePlano,
        toggleSelection, toggleSelectAll, handleSort, getProcessedPlanos,
        reloadPlanos: loadPlanos,
        currentPage, setCurrentPage, totalPages, totalItems,
    };
};
