import { useEffect, useMemo, useState } from 'react';
import { Employee, SortDirection, SortColumn } from '../types/Employee';
import { funcionarioService } from '../services/funcionarioService';

export const useEmployeeManager = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'codempregado',
    direction: 'asc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Carregar funcionários ao montar
  useEffect(() => {
    loadEmployees();
  }, [currentPage]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await funcionarioService.listar(currentPage, pageSize);
      setEmployees(response.empregado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar funcionários');
      console.error('Erro ao carregar funcionários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funções CRUD

  // Adicionar
  const addEmployee = async (employeeData: Omit<Employee, 'codempregado'>) => {
    try {
      const newEmployee = await funcionarioService.criar(employeeData);
      setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar funcionário');
      console.error('Erro ao criar funcionário:', err);
      throw err;
    }
  };

  // Atualizar
  const updateEmployee = async (codempregado: number, updatedData: Partial<Employee>) => {
    try {
      await funcionarioService.atualizar(codempregado, updatedData);
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.codempregado === codempregado ? { ...emp, ...updatedData } : emp
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar funcionário');
      console.error('Erro ao atualizar funcionário:', err);
      throw err;
    }
  };

  // Deletar
  const deleteEmployee = async (codempregado: number) => {
    try {
      await funcionarioService.deletar(codempregado);
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.codempregado !== codempregado)
      );
      setSelectedEmployees(prev => {
        const next = new Set(prev);
        next.delete(codempregado);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar funcionário');
      console.error('Erro ao deletar funcionário:', err);
      throw err;
    }
  };

  // Toggle select (checkbox)
  const toggleSelection = (codempregado: number) => {
    setSelectedEmployees(prev => {
      const next = new Set(prev);
      if (next.has(codempregado)) next.delete(codempregado);
      else next.add(codempregado);
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = (displayEmployees: Employee[]) => {
    if (displayEmployees.length === 0) {
      setSelectedEmployees(new Set());
      return;
    }
    const allSelected = displayEmployees.every(emp => selectedEmployees.has(emp.codempregado));
    if (allSelected) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(displayEmployees.map(emp => emp.codempregado)));
    }
  };

  const handleSort = (column: SortColumn) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Exportar CSV
  const exportToCSV = () => {
    const columns = ['ID', 'Nome', 'E-mail', 'Cargo', 'CPF', 'Salário'];
    let csvContent = columns.join(',') + '\n';

    employees.forEach(employee => {
      const row = [
        employee.codempregado,
        `"${(employee.empregado || '').replace(/"/g, '""')}"`,
        `"${(employee.email || '').replace(/"/g, '""')}"`,
        `"${(employee.cargo || '').replace(/"/g, '""')}"`,
        `"${(employee.cpf || '').replace(/"/g, '""')}"`,
        employee.salario
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'funcionarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProcessedEmployees = (searchTerm: string) => {
    let result = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        s =>
          s.codempregado.toString().includes(term) ||
          (s.empregado || '').toLowerCase().includes(term) ||
          (s.email || '').toLowerCase().includes(term) ||
          (s.cpf || '').includes(term)
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      // Tratamento para undefined
      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return result;
  };

  // Obter funcionário específico (para editar)
  const getEmployee = async (codempregado: number): Promise<Employee> => {
    try {
      return await funcionarioService.obter(codempregado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar funcionário');
      console.error('Erro ao carregar funcionário:', err);
      throw err;
    }
  };

  return {
    employees,
    selectedEmployees,
    searchTerm,
    filterDepartment,
    sortConfig,
    loading,
    error,
    currentPage,
    setSearchTerm,
    setFilterDepartment,
    setCurrentPage,
    exportToCSV,
    addEmployee,
    handleSort,
    updateEmployee,
    deleteEmployee,
    toggleSelection,
    toggleSelectAll,
    getProcessedEmployees,
    loadEmployees,
    getEmployee,
  };
};
