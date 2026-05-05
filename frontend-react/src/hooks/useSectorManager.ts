import { useState, useEffect } from 'react';
import { Sector, SortColumn, SortDirection } from '@/types/Sector';
import { setorService } from '@/services/setorService';

export const useSectorManager = () => {
    const [sectors, setSectors]                   = useState<Sector[]>([]);
    const [selectedSectors, setSelectedSectors]   = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]             = useState<{ column: SortColumn; direction: SortDirection }>({
        column:    'codsetor',
        direction: 'asc',
    });
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [currentPage]           = useState(1);
    const [pageSize]              = useState(10);

    // ── Carga inicial ──────────────────────────────────────
    useEffect(() => {
        loadSectors();
    }, [currentPage]);

    const loadSectors = async () => {
        setLoading(true);
        setError(null);
        try {
            const { sectors: data } = await setorService.listar(currentPage, pageSize);
            setSectors(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar setores');
        } finally {
            setLoading(false);
        }
    };

    // ── CRUD ───────────────────────────────────────────────

    const addSector = async (sectorData: Omit<Sector, 'codsetor' | 'dtcadastro'>) => {
        try {
            const newSector = await setorService.criar(sectorData);
            setSectors((prev) => [...prev, newSector]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar setor';
            setError(msg);
            throw err;
        }
    };

    const updateSector = async (codsetor: number, updatedData: Partial<Sector>) => {
        try {
            // Para o setor, vamos usar inativar quando status for 'I'
            let updated: Sector;
            if (updatedData.status === 'I') {
                updated = await setorService.inativar(codsetor);
            } else {
                // Se o backend não suporta PUT com atualização completa, buscamos e atualizamos localmente
                const current = sectors.find((s) => s.codsetor === codsetor);
                if (!current) throw new Error('Setor não encontrado');
                updated = { ...current, ...updatedData };
            }
            setSectors((prev) =>
                prev.map((s) => (s.codsetor === codsetor ? updated : s))
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar setor';
            setError(msg);
            throw err;
        }
    };

    const deleteSector = async (codsetor: number) => {
        try {
            await setorService.deletar(codsetor);
            setSectors((prev) => prev.filter((s) => s.codsetor !== codsetor));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao deletar setor';
            setError(msg);
            throw err;
        }
    };

    const getSector = async (codsetor: number): Promise<Sector> => {
        return setorService.obter(codsetor);
    };

    // ── Seleção ────────────────────────────────────────────

    const toggleSelection = (codsetor: number) => {
        setSelectedSectors((prev) => {
            const next = new Set(prev);
            next.has(codsetor) ? next.delete(codsetor) : next.add(codsetor);
            return next;
        });
    };

    const toggleSelectAll = (displaySectors: Sector[]) => {
        if (displaySectors.length === 0) {
            setSelectedSectors(new Set());
            return;
        }
        const allSelected = displaySectors.every((s) =>
            selectedSectors.has(s.codsetor)
        );
        setSelectedSectors(
            allSelected
                ? new Set()
                : new Set(displaySectors.map((s) => s.codsetor))
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
        const columns: (keyof Sector)[] = ['codsetor', 'setor', 'status', 'dtcadastro'];

        const header = columns.join(',');
        const rows = sectors.map((s) =>
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
        link.setAttribute('download', 'setores.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Filtro + ordenação local ───────────────────────────
    const getProcessedSectors = (searchTerm: string): Sector[] => {
        let result = [...sectors];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (s) =>
                    s.setor.toLowerCase().includes(term)
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
        sectors,
        selectedSectors,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addSector,
        updateSector,
        deleteSector,
        getSector,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedSectors,
        reloadSectors: loadSectors,
    };
};
