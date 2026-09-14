import { Link } from "react-router-dom";
import type { IListing } from "../../interfaces/IListing";

interface ListingCardProps {
  listing: IListing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      to={`/anuncios/${listing._id}`}
      className="block rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <img
        src={listing.imageUrl}
        alt={listing.title}
        className="w-full h-32 object-cover rounded-md mb-3"
      />
      <h2 className="font-semibold">{listing.title}</h2>
      <p className="text-sm text-gray-600">{listing.discipline.label}</p>
      <p className="text-sm mt-1">
        {listing.type === "venda" && listing.price
          ? `R$ ${listing.price.toFixed(2)}`
          : listing.type === "troca"
          ? "Troca"
          : "Doação"}
      </p>
    </Link>
  );
}
