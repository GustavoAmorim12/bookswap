import api from "./api";
import type { IDiscipline } from "../interfaces/IDiscipline";

export async function getDisciplinesRequest() {
  const response = await api.get<{ data: IDiscipline[] }>("/catalog/disciplines");
  return response.data.data;
}