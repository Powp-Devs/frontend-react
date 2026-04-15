import { useEffect, useState } from 'react';
import { Product, SortDirection, SortColumn} from '../types/Product';

const initialProducts: Product[] = [
  {
    id: 1, 
    name: 'Notebook Pro', 
    description: 'Notebook de alta performance para desenvolvedores.', 
    price: 7500.0, 
    imageUrl: 'https://exemplo.com/img/notebook.jpg'
  },
  {
    id: 2, 
    name: 'Teclado Mecânico', 
    description: 'Teclado mecânico switch brown com LED RGB.', 
    price: 450.0, 
    imageUrl: 'https://exemplo.com/img/teclado.jpg'
  },
  {
    id: 3, 
    name: 'Monitor UltraWide', 
    description: 'Monitor 34 polegadas WQHD para máxima produtividade.', 
    price: 2500.0, 
    imageUrl: 'https://exemplo.com/img/monitor.jpg'
  },
  {
    id: 4, 
    name: 'Mouse Wireless', 
    description: 'Mouse ergonômico sem fio com bateria de longa duração.', 
    price: 299.9, 
    imageUrl: 'https://exemplo.com/img/mouse.jpg'
  },
  {
    id: 5, 
    name: 'Headset Noise Cancelling', 
    description: 'Headset com cancelamento de ruído ativo.', 
    price: 890.0, 
    imageUrl: 'https://exemplo.com/img/headset.jpg'
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
    const columns = ['ID', 'Nome', 'Descrição', 'Preço', 'URL da Imagem'];
    let csvContent = columns.join(',') + '\n';

    products.forEach(product => {
      const row = [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`, 
        `"${product.description.replace(/"/g, '""')}"`,
        product.price,
        `"${product.imageUrl.replace(/"/g, '""')}"`
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
            prod.name.toLowerCase().includes(term) || 
            prod.description.toLowerCase().includes(term)
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
