import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { IListing } from "../interfaces/IListing";
import { getListingByIdRequest } from "../services/listingService";
import {
  getFavoritesRequest,
  addFavoriteRequest,
  removeFavoriteRequest,
} from "../services/favoritesService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function ListingView() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showError } = useToast();
  const [listing, setListing] = useState<IListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setLoading(true);
    setError(false);

    getListingByIdRequest(id)
      .then((data) => {
        if (!ignore) setListing(data);
      })
      .catch(() => {
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    getFavoritesRequest()
      .then((favorites) => {
        if (!ignore) setIsFavorited(favorites.some((f) => f._id === id));
      })
      .catch(() => {
        // não bloqueia a página por causa disso — o coração só fica
        // "desmarcado" até o usuário tentar de novo
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleToggleFavorite() {
    if (!id || favoriteBusy) return;
    setFavoriteBusy(true);
    const nextState = !isFavorited;
    setIsFavorited(nextState); // otimista

    try {
      if (nextState) {
        await addFavoriteRequest(id);
      } else {
        await removeFavoriteRequest(id);
      }
    } catch {
      setIsFavorited(!nextState); // desfaz em caso de erro
      showError("Não foi possível atualizar seus favoritos.");
    } finally {
      setFavoriteBusy(false);
    }
  }

  if (loading) return <p className="text-center py-8">Carregando...</p>;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-3">
          Não foi possível carregar este anúncio. Verifique sua conexão com o
          servidor.
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!listing) return <p className="text-center py-8">Anúncio não encontrado.</p>;

  const isOwner = listing.author._id === user?.id;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="relative">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteBusy}
          aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFavorited}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white disabled:opacity-60"
        >
          <span
            className={isFavorited ? "text-red-500 text-xl" : "text-gray-400 text-xl"}
            aria-hidden="true"
          >
            {isFavorited ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-sm text-gray-600">
            {listing.discipline.label} · {listing.condition} · {listing.status.label}
          </p>
        </div>

        {isOwner && (
          <Link
            to={`/anuncios/${listing._id}/editar`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Editar
          </Link>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap">{listing.description}</p>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium">Anunciado por</p>
        <p>{listing.author.name} — {listing.author.email}</p>
      </div>

      {/* TODO: seção de comentários/perguntas (opcional, conforme enunciado) */}
    </section>
  );
}
