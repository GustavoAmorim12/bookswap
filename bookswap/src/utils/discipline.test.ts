import { describe, it, expect } from "vitest";
import { normalizeText } from "./discipline";

describe("normalizeText", () => {
  it("remove acentos", () => {
    expect(normalizeText("Cálculo")).toBe("calculo");
  });

  it("deixa tudo em minúsculo", () => {
    expect(normalizeText("BANCO DE DADOS")).toBe("banco de dados");
  });

  it("remove espaços nas pontas", () => {
    expect(normalizeText("  Front-End  ")).toBe("front-end");
  });

  it("mantém números e hífens", () => {
    expect(normalizeText("Cálculo II - Avançado")).toBe("calculo ii - avancado");
  });

  it("string vazia continua vazia", () => {
    expect(normalizeText("")).toBe("");
  });
});
