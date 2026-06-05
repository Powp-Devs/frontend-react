import { useState, useEffect } from 'react';
import { Category, SortColumn, SortDirection } from '@/types/Category';
import { categoriaService } from '@/services/categoriaService';

export const useCategoryManager = () => {
    const [categories, setCategories]               = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]               = useState<{ column: SortColumn; direction: SortDirection }>({
        column:    'codcategoria',
        direction: 'asc',
    });
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize]                = useState(10);
    const [totalItems, setTotalItems]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    useEffect(() => {
        loadCategories();
    }, [currentPage]);

    const loadCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoriaService.listar(currentPage, pageSize);
            setCategories(response.categories || []);
            const total = response.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize) || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    // ── CRUD ───────────────────────────────────────────────

    const addCategory = async (categoryData: Omit<Category, 'codcategoria' | 'dtcadastro' | 'status'>) => {
        try {
            const newCategory = await categoriaService.criar(categoryData);
            setCategories((prev) => [...prev, newCategory]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar categoria';
            setError(msg);
            throw err;
        }
    };

    const updateCategory = async (codcategoria: number, updatedData: Partial<Category>) => {
        try {
            const current = categories.find((c) => c.codcategoria === codcategoria);
            if (!current) throw new Error('Categoria não encontrada');
            const updated = await categoriaService.atualizar(codcategoria, {
                categoria: updatedData.categoria ?? current.categoria,
                status:    updatedData.status    ?? current.status,
            });
            setCategories((prev) =>
                prev.map((c) => (c.codcategoria === codcategoria ? updated : c))
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
            setError(msg);
            throw err;
        }
    };

    const deleteCategory = async (codcategoria: number) => {
        try {
            await categoriaService.deletar(codcategoria);
            setCategories((prev) => prev.filter((c) => c.codcategoria !== codcategoria));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao deletar categoria';
            setError(msg);
            throw err;
        }
    };

    const getCategory = async (codcategoria: number): Promise<Category> => {
        return categoriaService.obter(codcategoria);
    };

    // ── Seleção ────────────────────────────────────────────

    const toggleSelection = (codcategoria: number) => {
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            next.has(codcategoria) ? next.delete(codcategoria) : next.add(codcategoria);
            return next;
        });
    };

    const toggleSelectAll = (displayCategories: Category[]) => {
        if (displayCategories.length === 0) {
            setSelectedCategories(new Set());
            return;
        }
        const allSelected = displayCategories.every((c) => selectedCategories.has(c.codcategoria));
        setSelectedCategories(
            allSelected
                ? new Set()
                : new Set(displayCategories.map((c) => c.codcategoria))
        );
    };

    // ── Ordenação ──────────────────────────────────────────
    const handleSort = (column: SortColumn) => {
        setSortConfig((current) => ({
            column,
            direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // ── Export CSV ─────────────────────────────────────────
    const exportToCSV = () => {
        const columns: (keyof Category)[] = ['codcategoria', 'categoria', 'status', 'dtcadastro'];
        const header = columns.join(',');
        const rows = categories.map((c) =>
            columns.map((col) => `"${String(c[col] ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', 'categorias.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Filtro + ordenação local ───────────────────────────
    const getProcessedCategories = (searchTerm: string): Category[] => {
        let result = [...categories];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((c) => c.categoria.toLowerCase().includes(term));
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
        categories,
        selectedCategories,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedCategories,
        reloadCategories: loadCategories,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
    };
};
