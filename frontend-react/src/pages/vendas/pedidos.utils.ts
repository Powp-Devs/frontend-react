export const STATUS_COLORS: Record<string, string> = {
  A: "#004d40", // Trocado a variável de cor pelo HEX correspondente
  I: "#f97316",
};

export const STATUS_LABELS: Record<string, string> = {
  A: "Ativo",
  I: "Inativo",
};

export const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtN = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export function calcItem(
  preco: number,
  qty: number,
  desc: number
): { valorVenda: number; valorTotal: number } {
  const vv = parseFloat((preco * (1 - Math.min(desc, 100) / 100)).toFixed(2));
  return { valorVenda: vv, valorTotal: parseFloat((vv * qty).toFixed(2)) };
}