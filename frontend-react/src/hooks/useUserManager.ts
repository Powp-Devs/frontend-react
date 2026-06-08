import { useState, useEffect } from 'react';
import { User, SortColumn, SortDirection } from '@/types/Users';
import { usuarioService } from '@/services/usuarioService';

export const useUserManager = () => {
    const [users, setUsers]                     = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers]     = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig]           = useState<{ column: SortColumn; direction: SortDirection }>({
        column: 'codusuario', direction: 'asc',
    });
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize]                = useState(10);
    const [totalItems, setTotalItems]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await usuarioService.listar(currentPage, pageSize);
            setUsers(response.users || []);
            const total = response.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize) || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    // ── CRUD ───────────────────────────────────────────────

    const addUser = async (userData: Omit<User, 'codusuario' | 'data_criacao' | 'data_alteracao'>) => {
        try {
            const newUser = await usuarioService.criar(userData);
            setUsers((prev) => [...prev, newUser]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar usuário';
            setError(msg);
            throw err;
        }
    };

    const updateUser = async (codusuario: number, updatedData: Partial<User> & { motivo: string }) => {
        try {
            const updated = await usuarioService.atualizar(codusuario, updatedData);
            setUsers((prev) => prev.map((u) => (u.codusuario === codusuario ? updated : u)));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
            setError(msg);
            throw err;
        }
    };

    const inativarUser = async (codusuario: number, motivo: string) => {
        try {
            await usuarioService.inativar(codusuario, motivo);
            setUsers((prev) =>
                prev.map((u) => (u.codusuario === codusuario ? { ...u, ativo: 'N' as const } : u))
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao inativar usuário';
            setError(msg);
            throw err;
        }
    };

    const deleteUser = async (codusuario: number, motivo: string) => {
        try {
            await usuarioService.deletar(codusuario, motivo);
            setUsers((prev) => prev.filter((u) => u.codusuario !== codusuario));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao deletar usuário';
            setError(msg);
            throw err;
        }
    };

    const getUser = async (codusuario: number): Promise<User> => {
        return usuarioService.obter(codusuario);
    };

    // ── Seleção ────────────────────────────────────────────

    const toggleSelection = (codusuario: number) => {
        setSelectedUsers((prev) => {
            const next = new Set(prev);
            next.has(codusuario) ? next.delete(codusuario) : next.add(codusuario);
            return next;
        });
    };

    const toggleSelectAll = (displayUsers: User[]) => {
        if (displayUsers.length === 0) { setSelectedUsers(new Set()); return; }
        const allSelected = displayUsers.every((u) => selectedUsers.has(u.codusuario));
        setSelectedUsers(
            allSelected ? new Set() : new Set(displayUsers.map((u) => u.codusuario))
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
        const columns: (keyof User)[] = ['codusuario', 'nome', 'email', 'usuario', 'ativo', 'data_criacao', 'codempregado'];
        const header = columns.join(',');
        const rows = users.map((u) =>
            columns.map((col) => `"${String(u[col] ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', 'usuarios.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Filtro + ordenação local ───────────────────────────
    const getProcessedUsers = (searchTerm: string): User[] => {
        let result = [...users];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (u) =>
                    u.nome.toLowerCase().includes(term)    ||
                    u.usuario.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term)
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
        users,
        selectedUsers,
        sortConfig,
        loading,
        error,
        exportToCSV,
        addUser,
        updateUser,
        inativarUser,
        deleteUser,
        getUser,
        toggleSelection,
        toggleSelectAll,
        handleSort,
        getProcessedUsers,
        reloadUsers: loadUsers,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
    };
};
