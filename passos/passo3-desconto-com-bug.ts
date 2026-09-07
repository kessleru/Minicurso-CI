/**
 * Calcula o preco final de um produto apos aplicar um desconto percentual.
 *
 * @param valor              Preco original, em reais.
 * @param descontoPercentual Percentual de desconto (ex: 10 para 10%).
 */
export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  const desconto = valor * (descontoPercentual / 100);
  return valor - desconto;
}
