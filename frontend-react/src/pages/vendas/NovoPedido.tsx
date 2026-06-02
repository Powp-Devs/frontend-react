import React, { useEffect, useState } from "react";
import "@/styles/pedido.css";
import { useToastContext } from "@/components/ToastContext";
import { CustomSelect } from "@/components/CustomSelect";
import { usePedido } from "@/hooks/useOrderManager";
import { fmt, calcItem } from "./pedidos.utils";
import IconCarrinho from "@/assets/icons/shopping_cart.svg";
import IconSearch from "@/assets/icons/Search.svg";

// ─── Tipagens ─────────────────────────────────────────────────────────────────
export type TabNovoPedido = "dados_gerais" | "itens";

export interface ItemCarrinho {
  codproduto: number;
  produto: string;
  preco_venda: number;
  quantidade: number;
  perc_desconto: number;
  valor_venda: number;
  valor_total: number;
}
// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PRODUTOS_BUSCA = [
  { codproduto: 5, produto: "MARMITEX ALUM N09 1200ML WYDA", preco_venda: 3.99, status: "A" },
  { codproduto: 9, produto: "AZEITONA VDE DIZA 100G SACHE", preco_venda: 6.5, status: "A" },
  { codproduto: 11, produto: "MOLHO BRANCO PREDILECTA 240G SACHE", preco_venda: 7.8, status: "A" },
  { codproduto: 18, produto: "FILME PVC 28X015MT WYDA", preco_venda: 12.9, status: "A" },
  { codproduto: 22, produto: "SACOLA PLÁSTICA 50X60CM", preco_venda: 1.99, status: "A" },
  { codproduto: 31, produto: "COPO DESC 200ML C/50 UN", preco_venda: 4.2, status: "A" },
  { codproduto: 47, produto: "DETERGENTE LIMÃO 500ML", preco_venda: 2.75, status: "A" },
  { codproduto: 53, produto: "ESPONJA DUPLA FACE PCT/3", preco_venda: 3.15, status: "A" },
];
// ─── MODAL: Busca de Produto ──────────────────────────────────────────────────
function ModalBuscaProduto({ onSelect, onClose }: { onSelect: (p: any) => void; onClose: () => void }) {
  const [termo, setTermo] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;

  const filtered = MOCK_PRODUTOS_BUSCA.filter(p =>
    !termo.trim() ||
    p.produto.toLowerCase().includes(termo.toLowerCase()) ||
    String(p.codproduto).includes(termo)
  );
  
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 560 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <span style={{ fontSize: 20 }}></span>
            <span className="modal-title">Buscar Produto</span>
          </div>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {/* Busca */}
        <div className="modal-search-wrapper">
          <div className="modal-search-input-wrapper">
            <input
              autoFocus
              value={termo}
              onChange={e => { setTermo(e.target.value); setPage(1); }}
              placeholder="Buscar por código ou descrição..."
              className="modal-search-input"
            />
          </div>
        </div>

        {/* Tabela Header */}
        <div className="modal-table-head">
          <span>FOTO</span><span>CÓD.</span><span>DESCRIÇÃO</span><span style={{ textAlign: "right" }}>PREÇO</span><span />
        </div>

        {/* Tabela Linhas */}
        <div className="modal-table-body">
          {paginated.map(p => (
            <div key={p.codproduto} className="modal-table-row">
              <div className="modal-thumb">📦</div>
              <span className="modal-row-code">{p.codproduto}</span>
              <span className="modal-row-name">{p.produto}</span>
              <span className="modal-row-price">{fmt(p.preco_venda)}</span>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => onSelect(p)} className="modal-select-btn">
                  Selecionar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={`page-btn ${page === n ? "active" : ""}`}>
              {n}
            </button>
          ))}
          <span className="page-info">Página {page} de {totalPages || 1}</span>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: Detalhe do Produto ────────────────────────────────────────────────
function ModalDetalheProduto({ produto, onConfirm, onCancel }: { produto: any; onConfirm: (item: ItemCarrinho) => void; onCancel: () => void }) {
  const [qtd, setQtd] = useState<string>("");
  const [desc, setDesc] = useState(0);

  const { valorVenda, valorTotal } = calcItem(produto.preco_venda, Number(qtd) || 0, desc);

  return (
    <div className="modal-overlay-dark">
      <div className="modal-card-no-overflow" style={{ width: 400 }}>
        
        <div className="modal-header">
          <div className="modal-title-row">
            <span style={{ fontSize: 18 }}>📦</span>
            <span className="modal-title-sm">Detalhes do Produto</span>
          </div>
          <button onClick={onCancel} className="modal-close-btn">✕</button>
        </div>

        <div className="modal-product-info">
          <div className="modal-product-icon">📦</div>
          <div>
            <p className="modal-product-code">Cód. {produto.codproduto}</p>
            <p className="modal-product-name">{produto.produto}</p>
            <p className="modal-product-price">Preço unit.: {fmt(produto.preco_venda)}</p>
          </div>
        </div>

        <div style={{ padding: "20px 24px 0" }}>
          <label className="form-label">QUANTIDADE</label>
          <input 
            type="number" 
            value={qtd}
            onChange={e => setQtd(e.target.value)}
            onBlur={() => {
              if (!qtd || Number(qtd) < 1) setQtd("1");
            }}
            className="form-input" 
          />
        </div>

        <div style={{ padding: "14px 24px 0" }}>
          <label className="form-label">DESCONTO (%)</label>
          <input 
            type="number" min={0} max={100} value={desc}
            onChange={e => setDesc(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="form-input" 
          />
        </div>

        <div className="modal-price-highlight">
          <p className="modal-price-final-label">PREÇO FINAL</p>
          <p className="modal-price-final-value">{fmt(valorTotal)}</p>
          {desc > 0 && (
            <p className="modal-price-sub">
              {fmt(valorVenda)} × {qtd} un. • {desc}% desc.
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="modal-cancel-btn">Cancelar</button>
          <button onClick={() => onConfirm({
            codproduto: produto.codproduto,
            produto: produto.produto,
            preco_venda: produto.preco_venda,
            quantidade: Number(qtd),
            perc_desconto: desc,
            valor_venda: valorVenda,
            valor_total: valorTotal,
          })} className="modal-confirm-btn">Confirmar Inclusão</button>
        </div>
      </div>
    </div>
  );
}

// ─── TELA: Novo Pedido ────────────────────────────────────────────────────────
export default function NovoPedido({ onVoltar }: { onVoltar?: () => void }) {
  const [tab, setTab] = useState<TabNovoPedido>("dados_gerais");
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [modalBusca, setModalBusca] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [form, setForm] = useState({ codcliente: "", codcobranca: "", codplano: "", codvendedor: "", obs: "", status: "A" });
  const totalItens = itens.reduce((a, i) => a + i.valor_total, 0);
  const totalDesconto = itens.reduce((a, i) => a + (i.preco_venda - i.valor_venda) * i.quantidade, 0);
  const { warning } = useToastContext();
  const { clientes } = usePedido();
    const clienteOptions = clientes.map(c => ({
    value: c.codcliente,
    label: `${c.codcliente} – ${c.cliente}`,
  }));


  function validateDadosGerais(): boolean {
  if (!form.codvendedor) {
    warning("Vendedor obrigatório", "Selecione um Cód. Vendedor antes de continuar.");
    return false;
  }
  if (!form.codcliente) {
    warning("Cliente obrigatório", "Selecione um Cód. Cliente antes de continuar.");
    return false;
  }
  if (!form.codcobranca) {
    warning("Cobrança obrigatória", "Informe o Cód. de Cobrança antes de continuar.");
    return false;
  }
  if (!form.codplano) {
    warning("Plano obrigatório", "Informe o Cód. de Plano antes de continuar.");
    return false;
  }
  return true;
}

  function adicionarItem(item: ItemCarrinho) {
    setItens(prev => {
      const idx = prev.findIndex(i => i.codproduto === item.codproduto);
      if (idx >= 0) { const c = [...prev]; c[idx] = item; return c; }
      return [...prev, item];
    });
    setProdutoSelecionado(null);
    setModalBusca(false);
  }

  function removerItem(cod: number) {
    setItens(prev => prev.filter(i => i.codproduto !== cod));
  } ''
  return (
  <>
     <div className="top-bar">
        {onVoltar && (
          <button onClick={onVoltar} className="btn-secondary" style={{ marginRight: 12 }}>
            ← Voltar
          </button>
        )}
        <span className="top-bar-title">Lançar Pedido</span>
        </div>
    <div className="page-wrapper">
        {/* Stepper */}
        <div className="stepper">
          {[{ n: 1, label: "Selecionar Vendedor", done: !!form.codvendedor }, 
            { n: 2, label: "Selecionar Cliente", done: !!form.codcliente }, 
            { n: 3, label: "Preencher Formulário", done: 
              !!form.codvendedor && 
              !!form.codcliente && 
              !!form.codcobranca && 
              !!form.codplano && 
              itens.length > 0
            }]
            .map((s, i, arr) => (
            <div className="step" key={s.n} style={{ flex: i < arr.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className={`step-circle ${s.done ? "done" : i === 3 ? "active" : ""}`}>
                  {s.done ? "✓" : s.n}
                </div>
                <span className={`step-label ${s.done ? "done" : i === 3 ? "active" : ""}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className={`step-line ${s.done ? "done" : i === 3 ? "active" : ""}`} />}
            </div>
          ))}
        </div>
      <div className="page-body-narrow">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        {/* Card principal com Tabs */}
        <div className="card-main">
          <div className="tab-bar">
            {([["dados_gerais", "Dados Gerais"], ["itens", `Itens (${itens.length})`]] as const).map(([key, label]) => (
              <button key={key} 
              onClick={() => {
                if (key === "itens" && !validateDadosGerais()) return;
                  setTab(key);
                }}
                className={`tab-btn ${tab === key ? "active" : ""}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Aba: Dados Gerais */}
          {tab === "dados_gerais" && (
            <div className="tab-content">
              <div className="form-grid">
                    <div>
                      <label className="form-label">CÓD. CLIENTE</label>
                      <CustomSelect
                        options={clienteOptions}
                        value={form.codcliente}
                        onChange={val => setForm(prev => ({ ...prev, codcliente: String(val) }))}
                        placeholder="Selecione um cliente..."
                      />
                    </div>

                {[
                  
                  ["codcobranca", "Cód. Cobrança"],
                  ["codplano", "Cód. Plano"],
                  ["codvendedor", "Cód. Vendedor"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="form-label">{label.toUpperCase()}</label>
                    <input
                      type="number"
                      value={(form as any)[field]}
                      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                ))}
                <div className="form-full-col">
                  <label className="form-label">OBSERVAÇÃO</label>
                  <textarea
                    value={form.obs}
                    onChange={e => setForm(prev => ({ ...prev, obs: e.target.value }))}
                    maxLength={255}
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="footer-actions-end">
                <button onClick={() => {if (validateDadosGerais()) setTab("itens");}} 
                className="btn-primary"
                >
                  Próximo: Itens →
                </button>
              </div>
            </div>
          )}

          {/* Aba: Itens */}
          {tab === "itens" && (
            <div className="tab-content">
              <div className="items-header">
                <p className="items-title">Itens do Pedido</p>
                <button onClick={() => setModalBusca(true)} className="btn-primary-small">
                  + Adicionar Item
                </button>
              </div>

              {itens.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    
                    </div>
                  <p className="empty-text">Nenhum item adicionado.</p>
                  <p className="empty-subtext">Clique em "Adicionar Item" para buscar produtos.</p>
                </div>
              ) : (
                <>
                  <table className="table" style={{ marginBottom: 16 }}>
                    <thead className="table-head">
                      <tr>
                        {["CÓD.", "PRODUTO", "QTD", "PREÇO TAB.", "DESC. %", "VLR. VENDA", "TOTAL", ""].map(h => (
                          <th key={h} className="th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map(item => (
                        <tr key={item.codproduto} className="table-row">
                          <td className="td-item-code">{item.codproduto}</td>
                          <td className="td-item-name">{item.produto}</td>
                          <td className="td-item-qty">{item.quantidade}</td>
                          <td className="td-item-price">{fmt(item.preco_venda)}</td>
                          <td className={`td-item-disc ${item.perc_desconto > 0 ? 'has-disc' : ''}`}>
                            {item.perc_desconto > 0 ? `${item.perc_desconto}%` : "—"}
                          </td>
                          <td className="td-item-sell">{fmt(item.valor_venda)}</td>
                          <td className="td-item-total">{fmt(item.valor_total)}</td>
                          <td style={{ padding: 12 }}>
                            <button onClick={() => removerItem(item.codproduto)} className="remove-btn">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>


                </>
              )}

              <div className="footer-actions">
                <button onClick={() => setTab("dados_gerais")} className="btn-secondary">
                  ← Dados Gerais
                </button>
                <button
                  disabled={itens.length === 0}
                  className={itens.length === 0 ? "btn-disabled" : "btn-primary"}
                >
                  Enviar Solicitação
                </button>
              </div>
            </div>
          )}

        </div>
        <div className="totals-box">
                    <div className="totals-header">
                        <span className="totals-title">Resumo do Pedido</span>
                    </div>
                    <div className="totals-inner">
                      <div className="Subtotal-row">
                        <span className="totals-label">Subtotal </span>
                        <span className="totals-value">{fmt(totalItens + totalDesconto)}</span>
                      </div>
                    <div className="Desconto-row">
                        <span className="totals-label" style={{ color: "#f97316" }}>Desconto </span>
                        <span className="totals-discount"> {fmt(totalDesconto)}</span>
                    </div>
                    <div className="totals-divider">
                        <span className="totals-grand-label">Total</span>
                        <span className="totals-grand-value">{fmt(totalItens)}</span>
                   </div>
               </div>
        </div>

      </div>
      </div>
    </div>

    {/* Modais */}
    {modalBusca && !produtoSelecionado && (
      <ModalBuscaProduto
        onSelect={p => setProdutoSelecionado(p)}
        onClose={() => setModalBusca(false)}
      />
    )}
    {produtoSelecionado && (
      <ModalDetalheProduto
        produto={produtoSelecionado}
        onConfirm={adicionarItem}
        onCancel={() => setProdutoSelecionado(null)}
      />
    )}
  </>
);
}