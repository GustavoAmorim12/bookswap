import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">
        A página que você está procurando não existe.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Voltar para a Home
      </Link>
    </div>
  );
}
