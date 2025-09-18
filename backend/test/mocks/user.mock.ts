
import { Role } from "src/user/enums/role.enum";

export interface UserMock {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const adminUser: UserMock = {
  _id: "admin-id",
  name: "Admin User",
  email: "admin@example.com",
  password: "hashedpassword", 
  role: Role.Admin,
};

export const regularUser: UserMock = {
  _id: "user-id",
  name: "Regular User",
  email: "user@example.com",
  password: "hashedpassword",
  role: Role.Regular,
};
