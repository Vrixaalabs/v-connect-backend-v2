import { IRole } from '../../models/Role';

export interface Permission {
  resource: string;
  actions: Array<'create' | 'read' | 'update' | 'delete' | 'manage'>;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface RoleResponse {
  success: boolean;
  message: string;
  role: IRole | null;
}
