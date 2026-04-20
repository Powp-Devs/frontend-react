import { useEffect, useState } from 'react';
import { Product, SortDirection, SortColumn} from '../types/Product';

const initialProducts: Product[] = [
  {
    id: 1, 
    produto: 'Notebook Pro', 
    obs: 'Notebook de alta performance para desenvolvedores.',
    embalagem: 'Caixa',
    sku: 'NP-001', 
    unidade: 'un', 
    gtin: '1234567890123', 
    ean: '1234567890123', 
    status: 'A', 
    codfornecedor: 1001,
    custo: 5000.0,
    preco_venda: 7500.0,
    margem: 0.33
  },
  {
    id: 2, 
    produto: 'Teclado Mecânico', 
    obs: 'Teclado mecânico switch brown com LED RGB.', 
    embalagem: 'Caixa',
    sku: 'TM-001', 
    unidade: 'un', 
    gtin: '1234567890124', 
    ean: '1234567890124', 
    status: 'A', 
    codfornecedor: 1002,
    custo: 200.0,
    preco_venda: 450.0,
    margem: 0.56
  },
  {
    id: 3, 
    produto: 'Monitor UltraWide', 
    obs: 'Monitor 34 polegadas WQHD para máxima produtividade.', 
    embalagem: 'Caixa',
    sku: 'MU-001', 
    unidade: 'un', 
    gtin: '1234567890125', 
    ean: '1234567890125', 
    status: 'A', 
    codfornecedor: 1003,
    custo: 1500.0,
    preco_venda: 2500.0,
    margem: 0.4,
  },
  {
    id: 4,
    produto: 'Mouse Wireless',
    obs: 'Mouse ergonômico sem fio com bateria de longa duração.',
    embalagem: 'Caixa',
    sku: 'MW-001',
    unidade: 'un',
    gtin: '1234567890126',
    ean: '1234567890126',
    status: 'A',
    codfornecedor: 1004,
    custo: 299.9,
    preco_venda: 299.9,
    margem: 0.0
  },
  {
    id: 5,
    produto: 'Headset Noise Cancelling',
    obs: 'Headset com cancelamento de ruído ativo.',
    embalagem: 'Caixa',
    sku: 'HN-001',
    unidade: 'un',
    gtin: '1234567890127',
    ean: '1234567890127',
    status: 'A',
    codfornecedor: 1005,
    custo: 890.0,
    preco_venda: 890.0,
    margem: 0.0
  }
];

export const useProductManager = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      if (parsed.length > 0) return parsed;
    }
    return initialProducts;
  });

  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'id',
    direction: 'asc'
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Funções CRUD

  // Adicionar
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(), 
    };

    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  // Atualizar
  const updateProduct = (id: number, updatedData: Partial<Product>) => {
    setProducts((prevProducts) =>
      prevProducts.map((prod) => 
        prod.id === id ? { ...prod, ...updatedData } : prod
      )
    );
  };

  // Deletar
  const deleteProduct = (id: number) => {
    setProducts((prevProducts) => 
      prevProducts.filter((prod) => prod.id !== id)
    );
    setSelectedProducts(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
    const allSelected = displayProducts.every(prod => selectedProducts.has(prod.id));
    if (allSelected) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(displayProducts.map(prod => prod.id)));
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
    const columns = ['CodFornecedor', 'Produto', 'Observação', 'Preço de Venda'];
    let csvContent = columns.join(',') + '\n';

    products.forEach(product => {
      const row = [
        product.id,
        `"${product.produto.replace(/"/g, '""')}"`, 
        `"${product.obs.replace(/"/g, '""')}"`,
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
        setSearchTerm,
        handleSort,
        addProduct,
        updateProduct,
        deleteProduct,
        setFilterCategory,
        toggleSelection,
        toggleSelectAll,
        getProcessedProducts,
        exportToCSV
    };
};
