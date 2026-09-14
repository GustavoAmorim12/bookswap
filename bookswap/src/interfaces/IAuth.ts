import type { RoleUsers } from "../types/roleUsers";
import type { IUser } from "./IUser";

export interface IAuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ILoginResponse {
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: RoleUsers;
    };
  };
}
