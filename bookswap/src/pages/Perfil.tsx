import { useAuth } from "../hooks/useAuth";

export default function Perfil() {
  const { user, logout } = useAuth();

  if (!user) return null; // rota já é protegida por RequireAuth

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            Nome
          </p>
          <p className="text-sm font-medium">{user.name}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            Usuário
          </p>
          <p className="text-sm font-medium">@{user.username}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            E-mail
          </p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-6 w-full rounded-md border border-red-300 text-red-600 px-4 py-2 text-sm hover:bg-red-50"
      >
        Sair da conta
      </button>
    </section>
  );
}
