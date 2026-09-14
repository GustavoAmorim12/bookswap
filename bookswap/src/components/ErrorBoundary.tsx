import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Erro inesperado capturado pelo ErrorBoundary:", error);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado. Tente voltar para a página inicial.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
            >
              Voltar para a Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
