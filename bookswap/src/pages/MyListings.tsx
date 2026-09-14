import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { IListing } from "../interfaces/IListing";
import {
  getMyListingsRequest,
  deleteListingRequest,
} from "../services/listingService";
import { useToast } from "../hooks/useToast";

export default function MyListings() {
  const { showSuccess, showError } = useToast();
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  function loadListings() {
    setLoading(true);
    setError(false);
    getMyListingsRequest()
      .then(setListings)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este anúncio? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      await deleteListingRequest(id);
      showSuccess("Anúncio excluído.");
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch {
      showError("Não foi possível excluir o anúncio.");
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Meus anúncios</h1>
        <Link
          to="/anuncios/novo"
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 text-center"
        >
          Novo anúncio
        </Link>
      </div>

      {loading && <p>Carregando...</p>}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-3">
            Não foi possível carregar seus anúncios. Verifique sua conexão
            com o servidor.
          </p>
          <button
            type="button"
            onClick={loadListings}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!error && (
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{listing.title}</p>
                <p className="text-sm text-gray-500">{listing.status.label}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/anuncios/${listing._id}/editar`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(listing._id)}
                  className="rounded-md border border-red-300 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-gray-500 mt-8 text-center">
          Você ainda não publicou nenhum anúncio.
        </p>
      )}
    </section>
  );
}
