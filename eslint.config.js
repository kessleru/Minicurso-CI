import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // "passos/" guarda versoes propositalmente quebradas para a aula
    // (bug de desconto, erro de lint). Nao fazem parte do codigo real.
    ignores: ["node_modules/**", "dist/**", "passos/**"],
  },
  {
    rules: {
      // Deixa o exemplo didatico: erro no que quebra o codigo,
      // aviso no que e so estilo. Bom para o slide de "check vermelho".
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
