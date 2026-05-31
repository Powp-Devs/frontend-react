import React, { useState } from "react";
import Dashboard from "./DashboardPedido";
import NovoPedido from "./NovoPedido";
import "@/styles/pedido.css"; 

type View = "dashboard" | "novo_pedido";

export default function PedidosPage() {
  const [view, setView] = useState<View>("dashboard");

  return view === "dashboard" ? (
    <Dashboard onNovoPedido={() => setView("novo_pedido")} />
  ) : (
    <NovoPedido onVoltar={() => setView("dashboard")} />
  );
}