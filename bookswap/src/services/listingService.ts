import api from "./api";
import type { IListing, ListingType } from "../interfaces/IListing";

export interface ListingFilters {
  q?: string;
  disciplineId?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface ListingsResponse {
  data: IListing[];
  meta: { page: number; pageSize: number; total: number };
}

export async function getListingsRequest(filters: ListingFilters = {}) {
  const response = await api.get<ListingsResponse>("/listings", {
    params: filters,
  });
  return response.data;
}

export async function getListingByIdRequest(id: string) {
  const response = await api.get<{ data: IListing }>(`/listings/${id}`);
  return response.data.data;
}

export async function getMyListingsRequest() {
  const response = await api.get<{ data: IListing[] }>("/listings/mine");
  return response.data.data;
}

export async function createListingRequest(payload: Partial<IListing>) {
  const response = await api.post<{ data: IListing }>("/listings", payload);
  return response.data.data;
}

export async function updateListingRequest(
  id: string,
  payload: Partial<IListing>
) {
  const response = await api.put<{ data: IListing }>(
    `/listings/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteListingRequest(id: string) {
  await api.delete(`/listings/${id}`);
}
