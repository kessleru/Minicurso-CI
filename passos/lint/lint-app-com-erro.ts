// @ts-nocheck

import express from "express";
import { calcularPrecoFinal } from "./desconto.js";

export const app = express();

app.use(express.json());

app.post("/calcular", (req, res) => {
  const { valor, descontoPercentual } = req.body;
  const naoUsada = 42;

  try {
    const precoFinal = calcularPrecoFinal(valor, descontoPercentual);
    res.json({ precoFinal });
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
});
