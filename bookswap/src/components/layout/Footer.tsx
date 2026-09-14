import { Link } from "react-router-dom";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 px-8 py-8 text-slate-300">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 text-white font-semibold">BookSwap</h3>
          <p className="text-sm text-slate-400">
            Marketplace de troca, venda e doação de livros e materiais
            didáticos entre alunos.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-white font-semibold">Institucional</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/sobre" className="hover:text-white">
                Sobre o projeto
              </Link>
            </li>
            <li>
              <Link to="/como-funciona" className="hover:text-white">
                Como funciona
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-white font-semibold">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/termos" className="hover:text-white">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-white">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-800 pt-4 text-xs text-slate-500">
        © {year} BookSwap — projeto acadêmico (Tech Challenge, Fase 03).
      </div>
    </footer>
  );
}
