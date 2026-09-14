import { useEffect, useState } from "react";
import type { IDiscipline } from "../../interfaces/IDiscipline";
import type { ListingType } from "../../interfaces/IListing";
import { getDisciplinesRequest } from "../../services/catalogService";

export interface ListingFilterValues {
  q: string;
  disciplineId: string;
  type: ListingType | "";
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: ListingFilterValues = {
  q: "",
  disciplineId: "",
  type: "",
  minPrice: "",
  maxPrice: "",
};

interface ListingFiltersProps {
  values: ListingFilterValues;
  onChange: (values: ListingFilterValues) => void;
}

export default function ListingFilters({ values, onChange }: ListingFiltersProps) {
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);

  useEffect(() => {
    getDisciplinesRequest().then(setDisciplines);
  }, []);

  function update<K extends keyof ListingFilterValues>(
    field: K,
    value: ListingFilterValues[K]
  ) {
    onChange({ ...values, [field]: value });
  }

  const hasActiveFilters =
    values.q || values.disciplineId || values.type || values.minPrice || values.maxPrice;

  return (
    <div className="mb-6 space-y-3">
      <input
        type="text"
        placeholder="Buscar por título ou descrição..."
        value={values.q}
        onChange={(e) => update("q", e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={values.disciplineId}
          onChange={(e) => update("disciplineId", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas as disciplinas</option>
          {disciplines.map((d) => (
            <option key={d._id} value={d._id}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={values.type}
          onChange={(e) => update("type", e.target.value as ListingType | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="troca">Troca</option>
          <option value="venda">Venda</option>
          <option value="doacao">Doação</option>
        </select>

        {values.type === "venda" && (
          <>
            <input
              type="number"
              min={0}
              placeholder="Preço mín."
              value={values.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              placeholder="Preço máx."
              value={values.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
