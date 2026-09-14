import { useEffect, useState } from "react";
import type { IListing } from "../interfaces/IListing";
import { getFavoritesRequest } from "../services/favoritesService";
import ListingCard from "../components/listing/ListingCard";

export default function Favorites() {
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    getFavoritesRequest()
      .then(setListings)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Favoritos</h1>

      {loading && <p className="text-gray-500">Carregando...</p>}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-3">
            Não foi possível carregar seus favoritos. Verifique sua conexão
            com o servidor.
          </p>
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-gray-500 mt-8 text-center">
          Você ainda não favoritou nenhum anúncio. Clique no coração de um
          anúncio pra salvá-lo aqui.
        </p>
      )}
    </section>
  );
}
