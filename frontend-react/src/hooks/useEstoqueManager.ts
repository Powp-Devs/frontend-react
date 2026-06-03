import { useState, useEffect, useCallback } from 'react';
import { EstoqueItem, EstoqueUpdatePayload, StatusEstoque } from '@/types/Estoque';
import { estoqueService } from '@/services/estoqueService';
import authService from '@/services/authService';

export const useEstoqueManager = () => {
    const [itens, setItens] = useState<EstoqueItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'todos' | 'baixo' | 'critico'>('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const usuarioId: number = authService.getUser()?.codusuario ?? 1;

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await estoqueService.listar(currentPage, pageSize);
            setItens(res.data);
            setTotal(res.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => { carregar(); }, [carregar]);

    // Classifica o status do item
    const getStatus = (item: EstoqueItem): StatusEstoque => {
        const disponivel = item.estoque - item.estoque_reservado - item.estoque_bloqueado;
        if (disponivel <= 0) return 'critico';
        if (disponivel <= item.estoque_minimo) return 'baixo';
        return 'normal';
    };

    // Itens filtrados
    const itensFiltrados = itens.filter(item => {
        const matchSearch = !searchTerm ||
            item.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codproduto.toString().includes(searchTerm);

        if (!matchSearch) return false;

        if (filterStatus === 'todos') return true;
        const status = getStatus(item);
        if (filterStatus === 'baixo')  return status === 'baixo';
        if (filterStatus === 'critico') return status === 'critico';
        return true;
    });

    // Counters para os badges do header
    const totalCritico = itens.filter(i => getStatus(i) === 'critico').length;
    const totalBaixo   = itens.filter(i => getStatus(i) === 'baixo').length;

    const atualizar = async (codproduto: number, payload: EstoqueUpdatePayload) => {
        const updated = await estoqueService.atualizar(codproduto, usuarioId, payload);
        setItens(prev => prev.map(i => i.codproduto === codproduto ? { ...updated, produto: i.produto, sku: i.sku } : i));
        return updated;
    };

    const excluir = async (codproduto: number) => {
        await estoqueService.excluir(codproduto);
        setItens(prev => prev.filter(i => i.codproduto !== codproduto));
        setTotal(prev => prev - 1);
    };

    const totalPages = Math.ceil(total / pageSize);

    return {
        itens: itensFiltrados,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        currentPage,
        setCurrentPage,
        totalPages,
        total,
        totalCritico,
        totalBaixo,
        getStatus,
        atualizar,
        excluir,
        carregar,
    };
};
