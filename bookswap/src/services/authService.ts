import api from "./api";
import type { ILoginResponse } from "../interfaces/IAuth";

export async function loginRequest(email: string, password: string) {
  const response = await api.post<ILoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data.data;
}
