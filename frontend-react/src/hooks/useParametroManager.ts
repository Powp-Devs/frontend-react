import { useState, useEffect } from 'react';
import { Parametro } from '@/types/Parametro';
import { parametroService } from '@/services/parametroService';

export const useParametroManager = () => {
    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadParametros();
    }, [currentPage]);

    const loadParametros = async () => {
        setLoading(true);
        try {
            const response = await parametroService.listar(currentPage, pageSize);
            setParametros(response.parametros || []);
            
            const total = response.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize) || 1);
        } catch (err) {
            setError('Erro ao carregar os parâmetros do sistema');
        } finally {
            setLoading(false);
        }
    };

    const updateParametro = async (codparametro: number, valor: string, status: string) => {
        try {
            // Idealmente você pega o ID do usuário logado do seu AuthContext/Store
            const usuarioLogadoId = 1; 

            const updated = await parametroService.atualizar(codparametro, valor, status, usuarioLogadoId);
            
            // Atualiza a lista local para refletir a mudança imediatamente
            setParametros((prev) =>
                prev.map((p) => (p.codparametro === codparametro ? updated : p))
            );
        } catch (err) {
            throw err;
        }
    };

    return {
        parametros,
        loading,
        error,
        updateParametro,
        reloadParametros: loadParametros,
        currentPage,
        setCurrentPage,
        totalItems,
        totalPages
    }; 
};