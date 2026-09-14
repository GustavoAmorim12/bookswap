import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListingFilters, { EMPTY_FILTERS } from "./ListingFilters";
import { getDisciplinesRequest } from "../../services/catalogService";

vi.mock("../../services/catalogService", () => ({
  getDisciplinesRequest: vi.fn(),
}));

const mockedGetDisciplines = vi.mocked(getDisciplinesRequest);

describe("ListingFilters", () => {
  beforeEach(() => {
    mockedGetDisciplines.mockResolvedValue([
      { _id: "d1", label: "Cálculo I", order: 1, isActive: true },
      { _id: "d2", label: "Banco de Dados", order: 2, isActive: true },
    ]);
  });

  it("carrega e exibe as disciplinas no select", async () => {
    render(<ListingFilters values={EMPTY_FILTERS} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Cálculo I")).toBeInTheDocument();
    });
    expect(screen.getByText("Banco de Dados")).toBeInTheDocument();
  });

  it("chama onChange ao digitar na busca", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ListingFilters values={EMPTY_FILTERS} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/buscar por título/i);
    await user.type(input, "x");

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, q: "x" });
  });

  it("só mostra os campos de preço quando o tipo é venda", () => {
    const { rerender } = render(
      <ListingFilters values={EMPTY_FILTERS} onChange={vi.fn()} />
    );

    expect(screen.queryByPlaceholderText(/preço mín/i)).not.toBeInTheDocument();

    rerender(
      <ListingFilters
        values={{ ...EMPTY_FILTERS, type: "venda" }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/preço mín/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/preço máx/i)).toBeInTheDocument();
  });

  it("botão 'Limpar filtros' só aparece quando há filtro ativo", () => {
    const { rerender } = render(
      <ListingFilters values={EMPTY_FILTERS} onChange={vi.fn()} />
    );
    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument();

    rerender(
      <ListingFilters
        values={{ ...EMPTY_FILTERS, q: "cálculo" }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it("clicar em 'Limpar filtros' volta tudo para o estado vazio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ListingFilters
        values={{ ...EMPTY_FILTERS, q: "cálculo", type: "venda" }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText(/limpar filtros/i));

    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS);
  });
});
