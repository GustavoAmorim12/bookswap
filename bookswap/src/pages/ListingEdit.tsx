import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IListing } from "../interfaces/IListing";
import ListingForm, {
  type ListingFormValues,
} from "../components/listing/ListingForm";
import {
  getListingByIdRequest,
  updateListingRequest,
} from "../services/listingService";
import { useToast } from "../hooks/useToast";

export default function ListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [listing, setListing] = useState<IListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getListingByIdRequest(id)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: ListingFormValues) {
    if (!id) return;
    try {
      await updateListingRequest(id, {
        title: values.title,
        description: values.description,
        condition: values.condition,
        type: values.type,
        price: values.type === "venda" ? values.price : undefined,
        imageUrl: values.imageUrl,
        discipline: { _id: values.disciplineId } as never,
      });
      showSuccess("Anúncio atualizado com sucesso!");
      navigate(`/anuncios/${id}`);
    } catch {
      showError("Não foi possível atualizar o anúncio.");
    }
  }

  if (loading) return <p className="text-center py-8">Carregando...</p>;
  if (!listing) return <p className="text-center py-8">Anúncio não encontrado.</p>;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar anúncio</h1>
      <ListingForm
        initialValues={listing}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
      />
    </section>
  );
}
