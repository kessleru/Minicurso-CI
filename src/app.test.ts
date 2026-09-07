import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("POST /calcular", () => {
  it("responde com o preco ja com o desconto aplicado", async () => {
    const resposta = await request(app)
      .post("/calcular")
      .send({ valor: 100, descontoPercentual: 10 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.precoFinal).toBe(90);
  });

  it("responde 400 quando o desconto passa de 100%", async () => {
    const resposta = await request(app)
      .post("/calcular")
      .send({ valor: 100, descontoPercentual: 120 });

    expect(resposta.status).toBe(400);
  });
});
