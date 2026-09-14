import { createContext } from "react";
import type { IAuthContextType } from "../interfaces/IAuth";

export const AuthContext = createContext<IAuthContextType | undefined>(
  undefined,
);
