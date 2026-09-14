import api from "./api";
import type { IListing } from "../interfaces/IListing";

export async function getFavoritesRequest() {
  const response = await api.get<{ data: IListing[] }>("/favorites");
  return response.data.data;
}

export async function addFavoriteRequest(listingId: string) {
  await api.post(`/favorites/${listingId}`);
}

export async function removeFavoriteRequest(listingId: string) {
  await api.delete(`/favorites/${listingId}`);
}
