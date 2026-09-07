import { describe, it, expect } from "vitest";
import { calcularPrecoFinal } from "./desconto.js";

describe("calcularPrecoFinal", () => {
  it("aplica um desconto normal de 10%", () => {
    expect(calcularPrecoFinal(100, 10)).toBe(90);
  });

  it("com desconto de 0% devolve o valor original", () => {
    expect(calcularPrecoFinal(100, 0)).toBe(100);
  });

  it("com desconto de 100% o produto sai de graca", () => {
    expect(calcularPrecoFinal(100, 100)).toBe(0);
  });

  it("rejeita desconto acima de 100% em vez de devolver preco negativo", () => {
    expect(() => calcularPrecoFinal(100, 120)).toThrow();
  });
});
