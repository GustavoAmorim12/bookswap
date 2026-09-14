import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { IListing } from "../interfaces/IListing";
import { getListingsRequest } from "../services/listingService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import ListingFilters, {
  EMPTY_FILTERS,
  type ListingFilterValues,
} from "../components/listing/ListingFilters";
import ListingCard from "../components/listing/ListingCard";

const PAGE_SIZE = 9;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<ListingFilterValues>({
    ...EMPTY_FILTERS,
    disciplineId: searchParams.get("disciplina") ?? "",
  });
  const [page, setPage] = useState(1);

  const [listings, setListings] = useState<IListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedQuery = useDebouncedValue(filters.q, 350);

  // mantém a URL sincronizada com o filtro de disciplina, pra links
  // vindos do Header (/?disciplina=xyz) e o botão "voltar" funcionarem
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (filters.disciplineId) next.set("disciplina", filters.disciplineId);
    else next.delete("disciplina");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.disciplineId]);

  // se o usuário clicar num link de disciplina diferente no Header,
  // reflete de volta no estado do filtro
  useEffect(() => {
    const fromUrl = searchParams.get("disciplina") ?? "";
    setFilters((prev) => (prev.disciplineId === fromUrl ? prev : { ...prev, disciplineId: fromUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("disciplina")]);

  // qualquer mudança de filtro volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters.disciplineId, filters.type, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);

    getListingsRequest({
      q: debouncedQuery || undefined,
      disciplineId: filters.disciplineId || undefined,
      type: filters.type || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((response) => {
        if (ignore) return;
        setListings(response.data);
        setTotal(response.meta.total);
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
  }, [debouncedQuery, filters.disciplineId, filters.type, filters.minPrice, filters.maxPrice, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Anúncios disponíveis</h1>
        <Link
          to="/anuncios/novo"
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 text-center"
        >
          Novo anúncio
        </Link>
      </div>

      <ListingFilters values={filters} onChange={setFilters} />

      {loading && <p className="text-gray-500">Carregando anúncios...</p>}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-3">
            Não foi possível carregar os anúncios. Verifique sua conexão com
            o servidor.
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {total} {total === 1 ? "anúncio encontrado" : "anúncios encontrados"}
        </p>
      )}

      {!error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-gray-500 mt-8 text-center">
          Nenhum anúncio encontrado com esses filtros.
        </p>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}
