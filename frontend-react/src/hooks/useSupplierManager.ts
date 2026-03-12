import { useState, useEffect, useMemo } from 'react';
import { Supplier, SortColumn, SortDirection } from '../types/Supplier';

// Dados iniciais (migrados do suppliers.js)
const initialSuppliersData: Supplier[] = [
  { id: 11, name: 'Mondelez Brasil LTDA', email: 'pedro@dominio.com', date: '02 feb 2023' },
  { id: 15, name: 'Bic Amazonia LTDA', email: 'joao@dominio.com', date: '02 feb 2023' },
  { id: 104, name: 'Colgate LTDA', email: 'matheus@dominio.com', date: '02 feb 2023' },
  { id: 105, name: 'Microsoft LTDS', email: 'marcos@dominio.com', date: '02 feb 2023' },
  { id: 201, name: 'Unilever LTDA', email: 'victor@dominio.com', date: '02 feb 2023' },
  { id: 210, name: 'Procter & Gamble Brasil LTDA', email: 'rebecca@dominio.com', date: '02 feb 2023' },
  { id: 212, name: 'Coca-cola LTDA', email: 'igor@dominio.com', date: '02 feb 2023' }
];

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export function useSupplierManager() {
  // Estado inicial carrega do localStorage ou usa o mock
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : initialSuppliersData;
  });

  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'id',
    direction: 'asc'
  });

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Adicionar Fornecedor
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'date'>) => {
    const maxId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) : 0;
    const newSupplier: Supplier = {
      ...supplierData,
      id: maxId + 1,
      date: formatDate(new Date())
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  // Atualizar Fornecedor
  const updateSupplier = (id: number, updatedData: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updatedData } : s)));
  };

  // Deletar um
  const deleteSupplier = (id: number) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setSelectedSuppliers(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Seleção (Checkbox)
  const toggleSelection = (id: number) => {
    setSelectedSuppliers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = (filteredSuppliers: Supplier[]) => {
    if (selectedSuppliers.size === filteredSuppliers.length && filteredSuppliers.length > 0) {
      setSelectedSuppliers(new Set());
    } else {
      setSelectedSuppliers(new Set(filteredSuppliers.map(s => s.id)));
    }
  };

  // Ordenação
  const handleSort = (column: SortColumn) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Exportar CSV
  const exportToCSV = () => {
    const columns = ['Cod. Fornec', 'Fornecedor', 'E-MAIL', 'Data de cadastro'];
    let csvContent = columns.join(',') + '\n';

    suppliers.forEach(supplier => {
      const row = [
        supplier.id,
        `"${supplier.name.replace(/"/g, '""')}"`,
        supplier.email,
        supplier.date
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fornecedores_${formatDate(new Date()).replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtro e Ordenação (Memoized)
  const getProcessedSuppliers = (searchTerm: string) => {
    let result = [...suppliers];

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
    suppliers,
    selectedSuppliers,
    sortConfig,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSelection,
    toggleSelectAll,
    handleSort,
    exportToCSV,
    getProcessedSuppliers
  };
}
