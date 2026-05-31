import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import NovoPedido from "./NovoPedido";
import "@/styles/pedido.css";
import { CustomSelect } from "@/components/CustomSelect";
type View = "novo_pedido";

import { STATUS_COLORS, STATUS_LABELS, fmt } from "./pedidos.utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PEDIDOS = [
  { codpedido: 1001, data: "2025-05-01", cliente: "Supermercado Central",    codcliente: 1, valor_total:  4320.5, valor_desconto:  210.0, qtdprodutos: 12, status: "A", codvendedor: 3 },
  { codpedido: 1002, data: "2025-05-02", cliente: "Distribuidora Ômega",     codcliente: 2, valor_total:  8750.0, valor_desconto:    0,   qtdprodutos: 30, status: "A", codvendedor: 3 },
  { codpedido: 1003, data: "2025-05-03", cliente: "Mercado do Bairro",       codcliente: 3, valor_total:  1200.0, valor_desconto:   50.0, qtdprodutos:  5, status: "I", codvendedor: 2 },
  { codpedido: 1004, data: "2025-05-04", cliente: "Atacado Três Estrelas",   codcliente: 4, valor_total: 15600.0, valor_desconto: 1400.0, qtdprodutos: 60, status: "A", codvendedor: 3 },
  { codpedido: 1005, data: "2025-05-05", cliente: "Loja Familiar Silva",     codcliente: 5, valor_total:   980.0, valor_desconto:    0,   qtdprodutos:  4, status: "I", codvendedor: 1 },
  { codpedido: 1006, data: "2025-05-06", cliente: "Supermercado Central",    codcliente: 1, valor_total:  3100.0, valor_desconto:  120.0, qtdprodutos:  9, status: "A", codvendedor: 3 },
  { codpedido: 1007, data: "2025-05-07", cliente: "Distribuidora Ômega",     codcliente: 2, valor_total:  6400.0, valor_desconto:  400.0, qtdprodutos: 22, status: "A", codvendedor: 3 },
  { codpedido: 1008, data: "2025-05-08", cliente: "Mercearia Bom Preço",     codcliente: 6, valor_total:   540.0, valor_desconto:    0,   qtdprodutos:  3, status: "I", codvendedor: 2 },
];

const MOCK_PRODUTOS_MAIS_VENDIDOS = [
  { codproduto:  5, produto: "MARMITEX ALUM N09 1200ML WYDA", total_vendido: 340, valor_total: 12480.0 },
  { codproduto:  9, produto: "AZEITONA VDE DIZA 100G SACHE",  total_vendido: 280, valor_total:  4200.0 },
  { codproduto: 18, produto: "FILME PVC 28X015MT WYDA",       total_vendido: 210, valor_total:  8190.0 },
  { codproduto: 11, produto: "MOLHO BRANCO PREDILECTA 240G",  total_vendido: 175, valor_total:  3150.0 },
  { codproduto: 22, produto: "SACOLA PLÁSTICA 50X60CM",       total_vendido: 150, valor_total:  2250.0 },
];

const MOCK_CLIENTES_ATIVOS = [
  { codcliente: 4, cliente: "Atacado Três Estrelas",  total_pedidos: 8, valor_total: 82400.0 },
  { codcliente: 2, cliente: "Distribuidora Ômega",    total_pedidos: 6, valor_total: 61800.0 },
  { codcliente: 1, cliente: "Supermercado Central",   total_pedidos: 5, valor_total: 37600.0 },
  { codcliente: 3, cliente: "Mercado do Bairro",      total_pedidos: 4, valor_total: 14200.0 },
];

type StatusPedido = "A" | "I";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "A";
  return (
    <span className={`badge ${isActive ? "active" : "inactive"}`}>
      <span className={`badge-dot ${isActive ? "active" : "inactive"}`} />
      {isActive ? "ATIVO" : "INATIVO"}
    </span>
  );
}

function DonutChart({ pedidos }: { pedidos: typeof MOCK_PEDIDOS }) {
  const data = useMemo(() => {
    const counts: Record<string, { count: number; valor: number }> = {};
    pedidos.forEach(p => {
      if (!counts[p.status]) counts[p.status] = { count: 0, valor: 0 };
      counts[p.status].count++;
      counts[p.status].valor += p.valor_total;
    });
    return Object.entries(counts).map(([status, v]) => ({
      name:   STATUS_LABELS[status] ?? status,
      value:  v.count,
      valor:  v.valor,
      status,
      pct:    Math.round((v.count / pedidos.length) * 100),
    }));
  }, [pedidos]);

  const total = pedidos.reduce((a, p) => a + p.valor_total, 0);

  return (
    <div className="donut-wrapper">
      <div className="donut-chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={52} outerRadius={78}
              dataKey="value"
              strokeWidth={3}
              stroke="#fff"
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any, _name: any, props: any) =>
                [`${val} pedidos — ${fmt(props.payload.valor)}`, props.payload.name]}
              wrapperClassName="tooltip-content"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <p className="donut-total-label">TOTAL DO PERÍODO</p>
        <p className="donut-total-value">{fmt(total)}</p>
        {data.map(d => (
          <div key={d.status} className="donut-legend-row">
            <span 
              className="donut-legend-dot" 
              style={{ backgroundColor: STATUS_COLORS[d.status] }} 
            />
            <span className="donut-legend-name">{d.name}</span>
            <span className="donut-legend-pct">{d.pct}%</span>
            <span className="donut-legend-count">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ onNovoPedido }: { onNovoPedido: () => void }) {
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | "">("");
  const [pesquisa, setPesquisa]         = useState("");

  const pedidosFiltrados = MOCK_PEDIDOS.filter(p => {
    const matchStatus   = !filtroStatus || p.status === filtroStatus;
    const matchPesquisa = !pesquisa
      || p.cliente.toLowerCase().includes(pesquisa.toLowerCase())
      || String(p.codpedido).includes(pesquisa);
    return matchStatus && matchPesquisa;
  });

  const totalGeral = pedidosFiltrados.reduce((a, p) => a + p.valor_total, 0);

  return (
    <div className="page-wrapper">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-logo-row">
          <span className="top-bar-title">Pedidos</span>
        </div>
        <button
          onClick={onNovoPedido}
          className="top-bar-btn"
        >
          <span className="NovoPedido">＋</span>
          Novo Pedido
        </button>
      </div>

      <div className="page-body">

        {/* Donut + Clientes + Produtos */}
        <div className="cards-grid">

          <div className="card-fade-in" style={{ "--delay": ".4s" } as React.CSSProperties}>
            <p className="section-label">STATUS DOS PEDIDOS</p>
            <DonutChart pedidos={MOCK_PEDIDOS} />
          </div>

          <div className="card-fade-in" style={{ "--delay": ".5s" } as React.CSSProperties}>
            <p className="section-label">CLIENTES MAIS ATIVOS</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {MOCK_CLIENTES_ATIVOS.map((c, i) => (
                <div key={c.codcliente} className="rank-row">
                  <span className={`rank-badge ${i === 0 ? "first" : ""}`}>{i + 1}</span>
                  <div className="rank-name-wrapper">
                    <p className="rank-name">{c.cliente}</p>
                    <p className="rank-sub">{c.total_pedidos} pedidos</p>
                  </div>
                  <span className="rank-value">{fmt(c.valor_total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-fade-in" style={{ "--delay": ".6s" } as React.CSSProperties}>
            <p className="section-label">PRODUTOS MAIS VENDIDOS</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {MOCK_PRODUTOS_MAIS_VENDIDOS.map((p, i) => (
                <div key={p.codproduto} className="rank-row">
                  <span className={`rank-badge ${i === 0 ? "first" : ""}`}>{i + 1}</span>
                  <div className="rank-name-wrapper">
                    <p className="rank-name" style={{ fontSize: 12 }}>{p.produto}</p>
                    <p className="rank-sub">{p.total_vendido} un. vendidas</p>
                  </div>
                  <span className="rank-value">{fmt(p.valor_total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="card-overflow">

          {/* Header da lista */}
          <div className="list-header">
            <div style={{ flex: 1 }}>
              <p className="list-header-title">Lista de Pedidos</p>
              <p className="list-header-sub">{pedidosFiltrados.length} pedidos • {fmt(totalGeral)}</p>
            </div>
            <input
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
              placeholder="🔍  Buscar cliente ou nº pedido"
              className="search-input"
            />
            <div className="filter-status">
                <CustomSelect
                    options={[
                    { value: "", label: "Todos os status" },
                    { value: "A", label: "Ativo" },
                    { value: "I", label: "Inativo" },
                    ]}
                    value={filtroStatus}
                    onChange={(val) => setFiltroStatus(val as StatusPedido | "")}
                />
            </div>
          </div>

          {/* Tabela */}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr className="table-head">
                  {["Nº PEDIDO", "DATA", "CLIENTE", "PRODUTOS", "DESCONTO", "TOTAL", "STATUS"].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(p => (
                  <tr
                    key={p.codpedido}
                    className="table-row"
                  >
                    <td className="td-code">#{p.codpedido}</td>
                    <td className="td">{new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="td-name">{p.cliente}</td>
                    <td className="td" style={{ textAlign: "center" }}>{p.qtdprodutos}</td>
                    <td className={`td-discount ${p.valor_desconto > 0 ? "has-disc" : ""}`}>
                      {p.valor_desconto > 0 ? `− ${fmt(p.valor_desconto)}` : "—"}
                    </td>
                    <td className="td bold">{fmt(p.valor_total)}</td>
                    <td className="td"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

