import { Role } from '../../user/enums/role.enum';

export interface ActiveUser {
  id: string;
  email: string;
  role: Role;
}
