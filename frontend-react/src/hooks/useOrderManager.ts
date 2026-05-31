import { useState, useCallback, useMemo, useEffect } from 'react';
import { pedidoService } from '@/services/pedidoService';
import type { PedidoCabecalho, PedidoDetalhe, LancarPedidoResponse } from '@/services/pedidoService';
import { PedidoCreate, PedidoItemCreate } from '@/types/Order';
import { produtoService } from '@/services/produtoService';
import { Product } from '@/types/Product';
import api from '@/services/api';

export interface ItemCarrinho {
  codproduto:     number;
  produto:        string;   
  valor_tabela:   number;  
  quantidade:     number;
  perc_desconto:  number;  
  valor_venda:    number;   
  valor_total:    number;  
  valor_desconto: number;   
}
interface cliente {
  codcliente: number;
  cliente: string;
}

interface ModalBuscaState {
  aberto:        boolean;
  termoBusca:    string;
  produtos:      Product[];
  totalProdutos: number;
  pagina:        number;
  perPage:       number;
  carregando:    boolean;
}

interface ModalDetalheState {
  aberto:       boolean;
  produto:      Product | null;
  quantidade:   number;
  percDesconto: number;
}

interface LoadingState {
  lancar:           boolean;
  listar:           boolean;
  obter:            boolean;
  buscarPorCliente: boolean;
  cancelar:         boolean;
  buscarProdutos:   boolean;
}

interface UsePedidoReturn {
  pedidos:       PedidoCabecalho[];
  pedidoDetalhe: PedidoDetalhe | null;
  total:         number;
  page:          number;
  perPage:       number;

  itens:              ItemCarrinho[];
  totalItens:         number;  
  totalDescontoItens: number;  
  quantidadeTotal:    number;  

  modalBusca:          ModalBuscaState;
  modalDetalhe:        ModalDetalheState;
  precoFinalCalculado: number; 

  loading: LoadingState;
  error:   string | null;

  clientes: cliente[];

  abrirModalBusca:              () => void;
  fecharModalBusca:             () => void;
  setTermoBusca:                (termo: string) => void;
  buscarProdutosModal:          (termo?: string, pagina?: number) => Promise<void>;
  selecionarProdutoParaDetalhe: (produto: Product) => void;

  fecharModalDetalhe:    () => void;
  setQuantidade:         (qtd: number) => void;
  setPercDesconto:       (perc: number) => void;
  confirmarInclusaoItem: () => void;

  removerItem:    (codproduto: number) => void;
  limparCarrinho: () => void;

  lancarPedido:     (dadosBase: Omit<PedidoCreate, 'itens'>) => Promise<LancarPedidoResponse | null>;
  listarPedidos:    (page?: number, pageSize?: number) => Promise<void>;
  obterPedido:      (codpedido: number) => Promise<PedidoDetalhe | null>;
  cancelarPedido:   (codpedido: number) => Promise<boolean>;

  limparErro:    () => void;
  limparDetalhe: () => void;
}

function calcularValorVenda(valorTabela: number, percDesconto: number): number {
  const descFraction = Math.min(Math.max(percDesconto, 0), 100) / 100;
  return parseFloat((valorTabela * (1 - descFraction)).toFixed(2));
}

function calcularPrecoFinal(valorTabela: number, percDesconto: number, quantidade: number): number {
  return parseFloat((calcularValorVenda(valorTabela, percDesconto) * quantidade).toFixed(2));
}

function montarItemCarrinho(produto: Product, quantidade: number, percDesconto: number): ItemCarrinho {
  const tabela        = produto.preco_venda ?? 0;
  const valorVenda    = calcularValorVenda(tabela, percDesconto);
  const valorTotal    = parseFloat((valorVenda * quantidade).toFixed(2));
  const valorDesconto = parseFloat(((tabela - valorVenda) * quantidade).toFixed(2));

  return {
    codproduto:     produto.codproduto,
    produto:        produto.produto,
    valor_tabela:   tabela,
    quantidade,
    perc_desconto:  percDesconto,
    valor_venda:    valorVenda,
    valor_total:    valorTotal,
    valor_desconto: valorDesconto,
  };
}

export function usePedido(): UsePedidoReturn {
  const [pedidos,       setPedidos]       = useState<PedidoCabecalho[]>([]);
  const [pedidoDetalhe, setPedidoDetalhe] = useState<PedidoDetalhe | null>(null);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(10);
  const [clientes,      setClientes]      = useState<cliente[]>([]);

  // ── Carrinho ──
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  // ── Modal busca ──
  const [modalBusca, setModalBusca] = useState<ModalBuscaState>({
    aberto:        false,
    termoBusca:    '',
    produtos:      [],
    totalProdutos: 0,
    pagina:        1,
    perPage:       10,
    carregando:    false,
  });

  // ── Modal detalhe ──
  const [modalDetalhe, setModalDetalhe] = useState<ModalDetalheState>({
    aberto:       false,
    produto:      null,
    quantidade:   1,
    percDesconto: 0,
  });

  // ── Loading / erro ──
  const [loading, setLoading] = useState<LoadingState>({
    lancar:           false,
    listar:           false,
    obter:            false,
    buscarPorCliente: false,
    cancelar:         false,
    buscarProdutos:   false,
  });
  const [error, setError] = useState<string | null>(null);

  const setLoadingKey = (key: keyof LoadingState, value: boolean) =>
    setLoading(prev => ({ ...prev, [key]: value }));

  // ── Derivados do carrinho ──
  const totalItens = useMemo(
    () => itens.reduce((acc, i) => acc + i.valor_total, 0),
    [itens]
  );
  const totalDescontoItens = useMemo(
    () => itens.reduce((acc, i) => acc + i.valor_desconto, 0),
    [itens]
  );
  const quantidadeTotal = useMemo(
    () => itens.reduce((acc, i) => acc + i.quantidade, 0),
    [itens]
  );

  // ── Preço final em tempo real (modal detalhe) ──
  const precoFinalCalculado = useMemo(() => {
    if (!modalDetalhe.produto) return 0;
    return calcularPrecoFinal(
      modalDetalhe.produto.preco_venda ?? 0,
      modalDetalhe.percDesconto,
      modalDetalhe.quantidade
    );
  }, [modalDetalhe.produto, modalDetalhe.percDesconto, modalDetalhe.quantidade]);

  // MODAL BUSCA

  const abrirModalBusca = useCallback(() => {
    setModalBusca(prev => ({ ...prev, aberto: true }));
  }, []);

  const fecharModalBusca = useCallback(() => {
    setModalBusca({
      aberto:        false,
      termoBusca:    '',
      produtos:      [],
      totalProdutos: 0,
      pagina:        1,
      perPage:       10,
      carregando:    false,
    });
  }, []);

  const setTermoBusca = useCallback((termo: string) => {
    setModalBusca(prev => ({ ...prev, termoBusca: termo }));
  }, []);

  const buscarProdutosModal = useCallback(
    async (termo?: string, pagina = 1) => {
      setModalBusca(prev => ({ ...prev, carregando: true }));
      setLoadingKey('buscarProdutos', true);
      try {
        const buscarTermo = termo ?? modalBusca.termoBusca;
        let response: any;

        if (buscarTermo.trim()) {
          const lista = await produtoService.buscar(buscarTermo);
          response = { produtos: lista, total: lista.length, page: 1, per_page: lista.length };
        } else {
          response = await produtoService.listar(pagina, modalBusca.perPage);
        }

        setModalBusca(prev => ({
          ...prev,
          produtos:      response.produtos ?? [],
          totalProdutos: response.total    ?? 0,
          pagina:        response.page     ?? pagina,
          carregando:    false,
        }));
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Erro ao buscar produtos.');
        setModalBusca(prev => ({ ...prev, carregando: false }));
      } finally {
        setLoadingKey('buscarProdutos', false);
      }
    },
    [modalBusca.termoBusca, modalBusca.perPage]
  );

  //MODAL DETALHE

  const selecionarProdutoParaDetalhe = useCallback((produto: Product) => {
    setItens(prev => {
      const existente = prev.find(i => i.codproduto === produto.codproduto);
      setModalDetalhe({
        aberto:       true,
        produto,
        quantidade:   existente?.quantidade   ?? 1,
        percDesconto: existente?.perc_desconto ?? 0,
      });
      return prev;
    });
  }, []);

  const fecharModalDetalhe = useCallback(() => {
    setModalDetalhe({ aberto: false, produto: null, quantidade: 1, percDesconto: 0 });
  }, []);

  const setQuantidade = useCallback((qtd: number) => {
    setModalDetalhe(prev => ({ ...prev, quantidade: Math.max(1, qtd) }));
  }, []);

  const setPercDesconto = useCallback((perc: number) => {
    setModalDetalhe(prev => ({
      ...prev,
      percDesconto: Math.min(Math.max(perc, 0), 100),
    }));
  }, []);

  const confirmarInclusaoItem = useCallback(() => {
    const { produto, quantidade, percDesconto } = modalDetalhe;
    if (!produto) return;

    const novoItem = montarItemCarrinho(produto, quantidade, percDesconto);

    setItens(prev => {
      const idx = prev.findIndex(i => i.codproduto === novoItem.codproduto);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = novoItem;
        return copia;
      }
      return [...prev, novoItem];
    });

    fecharModalDetalhe();
    fecharModalBusca();
  }, [modalDetalhe, fecharModalDetalhe, fecharModalBusca]);


  // CARRINHO

  const removerItem = useCallback((codproduto: number) => {
    setItens(prev => prev.filter(i => i.codproduto !== codproduto));
  }, []);

  const limparCarrinho = useCallback(() => setItens([]), []);


  // PEDIDO

  const lancarPedido = useCallback(
    async (dadosBase: Omit<PedidoCreate, 'itens'>): Promise<LancarPedidoResponse | null> => {
      if (itens.length === 0) {
        setError('Adicione ao menos um item antes de lançar o pedido.');
        return null;
      }

      const itensMapeados: PedidoItemCreate[] = itens.map(i => ({
        codproduto:    i.codproduto,
        quantidade:    i.quantidade,
        valor_venda:   i.valor_venda,
        perc_desconto: i.perc_desconto,
      }));

      const pedido: PedidoCreate = { ...dadosBase, itens: itensMapeados };

      setLoadingKey('lancar', true);
      setError(null);
      try {
        const response = await pedidoService.lancar(pedido);
        if (response.success) limparCarrinho();
        return response;
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Erro ao lançar pedido.');
        return null;
      } finally {
        setLoadingKey('lancar', false);
      }
    },
    [itens, limparCarrinho]
  );

  const listarPedidos = useCallback(
    async (currentPage = 1, pageSize = 10): Promise<void> => {
      setLoadingKey('listar', true);
      setError(null);
      try {
        const response = await pedidoService.listar(currentPage, pageSize);
        setPedidos(response.pedidos);
        setTotal(response.total);
        setPage(response.page);
        setPerPage(response.per_page);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Erro ao listar pedidos.');
      } finally {
        setLoadingKey('listar', false);
      }
    },
    []
  );

  const obterPedido = useCallback(
    async (codpedido: number): Promise<PedidoDetalhe | null> => {
      setLoadingKey('obter', true);
      setError(null);
      try {
        const detalhe = await pedidoService.obter(codpedido);
        setPedidoDetalhe(detalhe);
        return detalhe;
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? `Erro ao buscar pedido #${codpedido}.`);
        return null;
      } finally {
        setLoadingKey('obter', false);
      }
    },
    []
  );



  const cancelarPedido = useCallback(
    async (codpedido: number): Promise<boolean> => {
      setLoadingKey('cancelar', true);
      setError(null);
      try {
        await pedidoService.cancelar(codpedido);
        setPedidos(prev =>
          prev.map(p => p.codpedido === codpedido ? { ...p, status: 'I' } : p)
        );
        if (pedidoDetalhe?.codpedido === codpedido) {
          setPedidoDetalhe(prev => prev ? { ...prev, status: 'I' } : null);
        }
        return true;
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? `Erro ao cancelar pedido #${codpedido}.`);
        return false;
      } finally {
        setLoadingKey('cancelar', false);
      }
    },
    [pedidoDetalhe]
  );

  // buscar cliente
    useEffect(() => {
      async function carregarClientes() {
        try {
          const response = await api.get<any>('/clientes/listar');
          console.log("Resposta clientes:", response);
          const listaClientes = response?.data?.cliente || response?.cliente || [];
          setClientes(listaClientes);
        } catch (error) {
          console.error("Erro ao carregar clientes:", error);
        }
      }
      carregarClientes();
    }, []);
  

  // ── Utilitários ──────────────────────────────────────────────────────────────
  const limparErro    = useCallback(() => setError(null), []);
  const limparDetalhe = useCallback(() => setPedidoDetalhe(null), []);

  return {
    // Pedidos
    pedidos,
    pedidoDetalhe,
    total,
    page,
    perPage,
    // Carrinho
    itens,
    totalItens,
    totalDescontoItens,
    quantidadeTotal,
    // Modais
    modalBusca,
    modalDetalhe,
    precoFinalCalculado,
    // Misc
    loading,
    error,
    // Ações modais
    abrirModalBusca,
    fecharModalBusca,
    setTermoBusca,
    buscarProdutosModal,
    selecionarProdutoParaDetalhe,
    fecharModalDetalhe,
    setQuantidade,
    setPercDesconto,
    confirmarInclusaoItem,
    // Ações carrinho
    removerItem,
    limparCarrinho,
    // Ações pedido
    lancarPedido,
    listarPedidos,
    obterPedido,
    cancelarPedido,
    // clientes
    clientes,
    // Utilitários
    limparErro,
    limparDetalhe,
  };
}