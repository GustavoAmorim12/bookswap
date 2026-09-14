import { useNavigate } from "react-router-dom";
import ListingForm, {
  type ListingFormValues,
} from "../components/listing/ListingForm";
import { createListingRequest } from "../services/listingService";
import { useToast } from "../hooks/useToast";

export default function ListingCreate() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  async function handleSubmit(values: ListingFormValues) {
    try {
      const listing = await createListingRequest({
        title: values.title,
        description: values.description,
        condition: values.condition,
        type: values.type,
        price: values.type === "venda" ? values.price : undefined,
        imageUrl: values.imageUrl,
        discipline: { _id: values.disciplineId } as never,
      });
      showSuccess("Anúncio criado com sucesso!");
      navigate(`/anuncios/${listing._id}`);
    } catch {
      showError("Não foi possível criar o anúncio.");
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Novo anúncio</h1>
      <ListingForm onSubmit={handleSubmit} submitLabel="Publicar anúncio" />
    </section>
  );
}
