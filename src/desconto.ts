/**
 * Calcula o preco final de um produto apos aplicar um desconto percentual.
 *
 * @param valor              Preco original, em reais.
 * @param descontoPercentual Percentual de desconto (ex: 10 para 10%).
 * @throws Error             Se os valores estiverem fora da faixa valida.
 */
export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  
  if (valor < 0) {
    throw new Error("valor nao pode ser negativo");
  }

  if (descontoPercentual < 0 || descontoPercentual > 100) {
    throw new Error("descontoPercentual deve estar entre 0 e 100");
  }
  
  const desconto = valor * (descontoPercentual / 100);
  return valor - desconto;
}
