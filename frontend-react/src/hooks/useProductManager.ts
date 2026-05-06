import { useEffect, useState } from 'react';
import { Product, SortDirection, SortColumn} from '../types/Product';
import { produtoService } from '../services/produtoService';
import api from '../services/api';

  interface Fornecedor {
    codfornecedor: number; 
    fornecedor: string;
  }
export const useProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'codproduto',
    direction: 'asc'
  });
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
      produto: '',
      obs: '',
      embalagem: "",
      sku: "",
      ean: "",
      status: "A", 
      codfornecedor: '',
      custo: 0,
      preco_venda: 0,
      margem: 0
    });

  useEffect(() => {
    async function carregarFornecedores() {
      try {
        const response = await api.get<any>('/fornecedor/listar');
        const listaFornecedores = response?.data?.fornecedor || response?.fornecedor || [];
        setFornecedores(listaFornecedores);
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
      }
    }
    carregarFornecedores();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await produtoService.listar(currentPage, pageSize);
      setProducts(response.produtos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar funcionários');
      console.error('Erro ao carregar funcionários:', err);
    } finally {
      setLoading(false);
    }
  };


  // Funções CRUD

  // Adicionar
  const addProduct = async (employeeData: Omit<Product, 'codproduto'>) => {
    try {
      const newProduct = await produtoService.criar(employeeData);
      setProducts((prevProducts) => [...prevProducts, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
      console.error('Erro ao criar produto:', err);
      throw err;
    }
  };

  // Atualizar
  const updateProduct = async (codproduto: number, updatedData: Partial<Product>) => {
    try {
      await produtoService.atualizar(codproduto, updatedData);
      setProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod.codproduto === codproduto ? { ...prod, ...updatedData } : prod
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
      console.error('Erro ao atualizar produto:', err);
      throw err;
    }
  };

  // Deletar
  const deleteProduct = async (codproduto: number) => {
    try {
      await produtoService.deletar(codproduto);
      setProducts((prevProducts) =>
        prevProducts.filter((prod) => prod.codproduto !== codproduto)
      );
      setSelectedProducts(prev => {
        const next = new Set(prev);
        next.delete(codproduto);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto');
      console.error('Erro ao deletar produto:', err);
      throw err;
    }
  };

  // Toggle select (checkbox único)
  const toggleSelection = (id: number) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all 
  const toggleSelectAll = (displayProducts: Product[]) => {
    if (displayProducts.length === 0) {
      setSelectedProducts(new Set());
      return;
    }
    const allSelected = displayProducts.every(prod => selectedProducts.has(prod.codproduto));
    if (allSelected) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(displayProducts.map(prod => prod.codproduto)));
    }
  };

  // --- Ordenação ---
  const handleSort = (column: SortColumn) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Exportar CSV ---
  const exportToCSV = () => {
    const columns = ['ID', 'Produto', 'Observação', 'Preço de Venda'];
    let csvContent = columns.join(',') + '\n';

    products.forEach(product => {
      const row = [
        product.codproduto,
        `"${(product.produto || '').replace(/"/g, '""')}"`,
        `"${(product.obs || '').replace(/"/g, '""')}"`,
        product.preco_venda,
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'produtos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProcessedProducts = (searchTerm: string) => {
    let result = [...products];
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
            prod => 
            prod.produto.toLowerCase().includes(term) || 
            prod.obs.toLowerCase().includes(term)
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
        products,
        selectedProducts,
        searchTerm,
        sortConfig,
        fornecedores,
        setSearchTerm,
        handleSort,
        addProduct,
        updateProduct,
        deleteProduct,
        setFilterCategory,
        toggleSelection,
        toggleSelectAll,
        getProcessedProducts,
        exportToCSV,
        
    };
};
