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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
        // per_page=1000 para trazer todos para o lookup de busca
        const response = await api.get<any>('/fornecedor/listar?per_page=1000');
        const listaFornecedores = response?.data || [];
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

      const total = response.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / pageSize) || 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar Produtos');
    } finally {
      setLoading(false);
    }
  };


  // Funções CRUD

  // Adicionar
  const addProduct = async (productData: any) => {
    setLoading(true);
    try {
      // 1. Separamos as variáveis de estoque dos dados puros do produto
      const { 
        estoque, 
        estoque_minimo, 
        ...dadosProduto 
      } = productData;

      // 2. Enviamos apenas os dados do Produto para a API
      const novoProduto = await produtoService.criar(dadosProduto);

      if (!novoProduto || !novoProduto.codproduto) {
        throw new Error("Erro interno: A API não retornou o código do produto criado.");
      }

      // 3. Montamos o Payload exato que a sua rota de Estoque espera
      const payloadEstoque = {
        codproduto: novoProduto.codproduto, // O ID que acabou de ser gerado no backend!
        estoque: Number(estoque) || 0,
        estoque_minimo: Number(estoque_minimo) || 0,
        estoque_reservado: 0,
        estoque_bloqueado: 0,
        obs: "Saldo inicial cadastrado via formulário de produto"
      };

      // 4. Disparamos a segunda requisição para salvar o estoque
      await produtoService.cadastrarEstoque(payloadEstoque);

      // 5. Atualizamos a tabela na tela do usuário
      setProducts(prev => [...prev, novoProduto]);
      
      return novoProduto;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar produto e estoque';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar
  const updateProduct = async (id: number, productData: any) => {
    setLoading(true);
    try {
      // 👇 Removemos o stock para não enviar para a rota de produto!
      const { estoque, estoque_minimo, ...dadosProduto } = productData;
      
      const updated = await produtoService.atualizar(id, dadosProduto);
      
      setProducts(prev => prev.map(p => p.codproduto === id ? updated : p));
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
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
        loading,
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
        loadProducts,
        currentPage, 
        setCurrentPage, 
        totalPages,
        totalItems
    };
};
