import { Role } from "src/user/enums/role.enum";

export interface ActiveUserData {
  _id: number;
  email: string;
  role: Role;
}
