import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import { getListingsRequest } from "../services/listingService";
import { getDisciplinesRequest } from "../services/catalogService";

vi.mock("../services/listingService", () => ({
  getListingsRequest: vi.fn(),
}));
vi.mock("../services/catalogService", () => ({
  getDisciplinesRequest: vi.fn(),
}));

const mockedGetListings = vi.mocked(getListingsRequest);
const mockedGetDisciplines = vi.mocked(getDisciplinesRequest);

const sampleListing = {
  _id: "l1",
  title: "Cálculo I - Stewart",
  description: "Livro usado, bom estado.",
  condition: "usado" as const,
  type: "venda" as const,
  price: 45,
  imageUrl: "https://example.com/img.png",
  discipline: { _id: "d1", label: "Cálculo I", order: 1 },
  author: { _id: "u1", name: "Ana", username: "ana", email: "ana@fiap.com.br" },
  status: { _id: "s1", label: "Disponível", order: 1 },
  createDate: "2026-08-20T00:00:00.000Z",
  updateDate: "2026-08-20T00:00:00.000Z",
};

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Home />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    mockedGetDisciplines.mockResolvedValue([
      { _id: "d1", label: "Cálculo I", order: 1, isActive: true },
    ]);
  });

  it("mostra os anúncios retornados pela API", async () => {
    mockedGetListings.mockResolvedValue({
      data: [sampleListing],
      meta: { page: 1, pageSize: 9, total: 1 },
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Cálculo I - Stewart")).toBeInTheDocument();
    });
    expect(screen.getByText(/1 anúncio encontrado/i)).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há resultados", async () => {
    mockedGetListings.mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 9, total: 0 },
    });

    renderHome();

    await waitFor(() => {
      expect(
        screen.getByText(/nenhum anúncio encontrado com esses filtros/i)
      ).toBeInTheDocument();
    });
  });

  it("não mostra paginação quando só existe uma página", async () => {
    mockedGetListings.mockResolvedValue({
      data: [sampleListing],
      meta: { page: 1, pageSize: 9, total: 1 },
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Cálculo I - Stewart")).toBeInTheDocument();
    });
    expect(screen.queryByText(/página 1 de/i)).not.toBeInTheDocument();
  });

  it("mostra controles de paginação quando há mais de uma página", async () => {
    mockedGetListings.mockResolvedValue({
      data: [sampleListing],
      meta: { page: 1, pageSize: 1, total: 3 },
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Anterior")).toBeDisabled();
    expect(screen.getByText("Próxima")).toBeEnabled();
  });
});
