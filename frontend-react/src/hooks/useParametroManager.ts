import { useState, useEffect } from 'react';
import { Parametro } from '@/types/Parametro';
import { parametroService } from '@/services/parametroService';

export const useParametroManager = () => {
    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadParametros();
    }, []);

    const loadParametros = async () => {
        setLoading(true);
        try {
            // Trazemos 50 registros de uma vez pois parâmetros geralmente são exibidos numa lista única
            const response = await parametroService.listar(1, 50);
            setParametros(response.parametros || []);
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
        reloadParametros: loadParametros
    }; 
};