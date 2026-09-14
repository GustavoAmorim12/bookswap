import { useEffect, useState } from "react";
import type { IDiscipline } from "../../interfaces/IDiscipline";
import type { IListing, ListingCondition, ListingType } from "../../interfaces/IListing";
import { getDisciplinesRequest } from "../../services/catalogService";
import { uploadImageRequest, validateImageFile } from "../../services/uploadService";
import { useToast } from "../../hooks/useToast";

export interface ListingFormValues {
  title: string;
  description: string;
  disciplineId: string;
  condition: ListingCondition;
  type: ListingType;
  price?: number;
  imageUrl: string;
}

interface ListingFormProps {
  initialValues?: Partial<IListing>;
  onSubmit: (values: ListingFormValues) => Promise<void>;
  submitLabel: string;
}

export default function ListingForm({
  initialValues,
  onSubmit,
  submitLabel,
}: ListingFormProps) {
  const { showError } = useToast();
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [values, setValues] = useState<ListingFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    disciplineId: initialValues?.discipline?._id ?? "",
    condition: initialValues?.condition ?? "usado",
    type: initialValues?.type ?? "troca",
    price: initialValues?.price,
    imageUrl: initialValues?.imageUrl ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getDisciplinesRequest().then(setDisciplines);
  }, []);

  function handleChange<K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo depois
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      showError(validationError);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageRequest(file);
      handleChange("imageUrl", url);
    } catch {
      showError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          required
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Disciplina</label>
          <select
            required
            value={values.disciplineId}
            onChange={(e) => handleChange("disciplineId", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Selecione</option>
            {disciplines.map((d) => (
              <option key={d._id} value={d._id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Condição</label>
          <select
            value={values.condition}
            onChange={(e) =>
              handleChange("condition", e.target.value as ListingCondition)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="novo">Novo</option>
            <option value="seminovo">Seminovo</option>
            <option value="usado">Usado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={values.type}
            onChange={(e) => handleChange("type", e.target.value as ListingType)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="troca">Troca</option>
            <option value="venda">Venda</option>
            <option value="doacao">Doação</option>
          </select>
        </div>

        {values.type === "venda" && (
          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.price ?? ""}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Foto do material</label>

        {values.imageUrl && (
          <img
            src={values.imageUrl}
            alt="Prévia do anúncio"
            className="w-full h-40 object-cover rounded-md mb-2 border border-gray-200"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
        />

        {uploading && (
          <p className="text-sm text-gray-500 mt-1">Enviando imagem...</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          JPEG, PNG, WEBP ou GIF, até 5MB.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Enviando..." : submitLabel}
      </button>
    </form>
  );
}
