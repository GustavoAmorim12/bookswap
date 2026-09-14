import { describe, it, expect } from "vitest";
import { validateImageFile } from "./uploadService";

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type });
}

describe("validateImageFile", () => {
  it("aceita um PNG dentro do limite de tamanho", () => {
    const file = makeFile("foto.png", "image/png", 1024);
    expect(validateImageFile(file)).toBeNull();
  });

  it("aceita JPEG, WEBP e GIF", () => {
    expect(validateImageFile(makeFile("a.jpg", "image/jpeg", 100))).toBeNull();
    expect(validateImageFile(makeFile("a.webp", "image/webp", 100))).toBeNull();
    expect(validateImageFile(makeFile("a.gif", "image/gif", 100))).toBeNull();
  });

  it("rejeita tipo de arquivo não suportado", () => {
    const file = makeFile("documento.pdf", "application/pdf", 1024);
    expect(validateImageFile(file)).toMatch(/formato não suportado/i);
  });

  it("rejeita arquivo maior que 5MB", () => {
    const file = makeFile("foto-grande.png", "image/png", 6 * 1024 * 1024);
    expect(validateImageFile(file)).toMatch(/5mb/i);
  });

  it("aceita um arquivo exatamente no limite de 5MB", () => {
    const file = makeFile("foto-limite.png", "image/png", 5 * 1024 * 1024);
    expect(validateImageFile(file)).toBeNull();
  });
});
