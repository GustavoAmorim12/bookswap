import type { RoleUsers } from "../types/roleUsers";

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: RoleUsers;
}
