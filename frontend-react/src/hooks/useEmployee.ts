import { useEffect, useMemo, useState } from 'react';
import { Employee, SortDirection } from '../types/Employee';
import { SortColumn } from '@/types/Employee';
import { set } from 'mobx';

const initialEmployees: Employee[] = [
  {
    id: 11, name: 'Carlos Oliveira', email: 'carlos.oliveira@empresa.com', position: 'Desenvolvedor Front-end', department: 'TI', salary: 5500
  },
  {
    id: 2, name: 'Ana Silva', email: 'ana.silva@empresa.com', position: 'Desenvolvedora Back-end', department: 'TI', salary: 6000
  },
  {
    id: 3, name: 'Álvaro Costa', email: 'alvaro.costa@empresa.com', position: 'Desenvolvedor Full Stack', department: 'TI', salary: 7000
  },
  {
    id: 4, name: 'Zélia Souza', email: 'zelia.souza@empresa.com', position: 'Analista de Sistemas', department: 'TI', salary: 6500
  },
  {
    id: 5, name: 'Beatriz Lima', email: 'beatriz.lima@empresa.com', position: 'Gerente de Projetos', department: 'TI', salary: 8000
  }
];

export const useEmployeeManager = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => 
    {const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      const parsed = JSON.parse(savedEmployees);
    if (parsed.length > 0) return parsed;
    }
    return initialEmployees;
});
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'id',
    direction: 'asc'
  });

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // Funções CRUD 

  // adicionar
  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now(), 
    };

    setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
  };

  // Atualizar
  const updateEmployee = (id: number, updatedData: Partial<Employee>) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) => 
        emp.id === id ? { ...emp, ...updatedData } : emp
      )
    );
  };

  // Deletar
  const deleteEmployee = (id: number) => {
    setEmployees((prevEmployees) => 
      prevEmployees.filter((emp) => emp.id !== id)
    );
    setSelectedEmployees(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Toggle select (checkbox)
  const toggleSelection = (id: number) => {
    setSelectedEmployees(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all 
  const toggleSelectAll = (displayEmployees: Employee[]) => {
    if (displayEmployees.length === 0) {
      setSelectedEmployees(new Set());
      return;
    }
    const allSelected = displayEmployees.every(emp => selectedEmployees.has(emp.id));
    if (allSelected) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(displayEmployees.map(emp => emp.id)));
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
    const columns = ['ID', 'Nome', 'E-mail', 'Cargo', 'Departamento', 'Salário'];
    let csvContent = columns.join(',') + '\n';

    employees.forEach(employee => {
      const row = [
        employee.id,
        `"${employee.name.replace(/"/g, '""')}"`, 
        `"${employee.email.replace(/"/g, '""')}"`,
        `"${employee.position.replace(/"/g, '""')}"`,
        `"${employee.department.replace(/"/g, '""')}"`,
        employee.salary
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
          s.id.toString().includes(term) ||
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
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

  return {

    employees,
    selectedEmployees,
    searchTerm,
    filterDepartment,
    sortConfig,
    setSearchTerm,
    setFilterDepartment,
    exportToCSV,
    addEmployee,
    handleSort,
    updateEmployee,
    deleteEmployee,
    toggleSelection,
    toggleSelectAll,
    getProcessedEmployees,
  };
};