import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/authService";

vi.mock("../services/authService", () => ({
  loginRequest: vi.fn(),
}));

const mockedLogin = vi.mocked(loginRequest);

const fakeUser = {
  id: "u1",
  name: "Ana Souza",
  username: "ana.souza",
  email: "ana@fiap.com.br",
  role: "ALUNO" as const,
};

// componente mínimo só pra exercitar o hook useAuth através do Provider
function Probe() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{isAuthenticated ? "logado" : "deslogado"}</p>
      <p data-testid="name">{user?.name ?? "-"}</p>
      <button onClick={() => login("ana@fiap.com.br", "123456").catch(() => {})}>
        Entrar
      </button>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockedLogin.mockReset();
  });

  it("começa deslogado quando não há sessão salva", () => {
    renderProbe();
    expect(screen.getByTestId("status")).toHaveTextContent("deslogado");
  });

  it("autentica e guarda o usuário após login bem-sucedido", async () => {
    mockedLogin.mockResolvedValue({ token: "mock-token-u1", user: fakeUser });
    const user = userEvent.setup();

    renderProbe();
    await user.click(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("logado");
    });
    expect(screen.getByTestId("name")).toHaveTextContent("Ana Souza");
    expect(sessionStorage.getItem("token")).toBe("mock-token-u1");
  });

  it("propaga o erro quando o login falha, sem autenticar", async () => {
    mockedLogin.mockRejectedValue(new Error("credenciais inválidas"));
    const user = userEvent.setup();

    renderProbe();
    await user.click(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalled();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("deslogado");
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("logout limpa o usuário e o sessionStorage", async () => {
    mockedLogin.mockResolvedValue({ token: "mock-token-u1", user: fakeUser });
    const user = userEvent.setup();

    renderProbe();
    await user.click(screen.getByText("Entrar"));
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("logado");
    });

    await user.click(screen.getByText("Sair"));

    expect(screen.getByTestId("status")).toHaveTextContent("deslogado");
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });

  it("recupera a sessão do sessionStorage ao montar", () => {
    sessionStorage.setItem("user", JSON.stringify(fakeUser));
    sessionStorage.setItem("token", "mock-token-u1");

    renderProbe();

    expect(screen.getByTestId("status")).toHaveTextContent("logado");
    expect(screen.getByTestId("name")).toHaveTextContent("Ana Souza");
  });
});
