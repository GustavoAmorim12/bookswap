import { useState } from "react";
import type { ReactNode } from "react";
import type { IUser } from "../interfaces/IUser";
import { AuthContext } from "./AuthContextDefinition";
import { loginRequest } from "../services/authService";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email: string, password: string) {
    const { token, user } = await loginRequest(email, password);

    const loggedUser: IUser = { ...user };

    sessionStorage.setItem("user", JSON.stringify(loggedUser));
    sessionStorage.setItem("token", token);
    setUser(loggedUser);
  }

  function logout() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
