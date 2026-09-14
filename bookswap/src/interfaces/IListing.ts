import type { IDiscipline } from "./IDiscipline";

export type ListingType = "troca" | "venda" | "doacao";
export type ListingCondition = "novo" | "seminovo" | "usado";

export interface IListingAuthor {
  _id: string;
  name: string;
  username: string;
  email: string;
}

export interface IListingStatus {
  _id: string;
  label: string; // "Disponível" | "Reservado" | "Trocado"
  order: number;
}

export interface IListing {
  _id: string;
  title: string;
  description: string;
  condition: ListingCondition;
  type: ListingType;
  price?: number; // presente apenas quando type === "venda"
  imageUrl: string;
  discipline: Pick<IDiscipline, "_id" | "label" | "order">;
  author: IListingAuthor;
  status: IListingStatus;
  createDate: string;
  updateDate: string;
}
