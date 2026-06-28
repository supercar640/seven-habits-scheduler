export interface Role {
  id: string;
  userId: string;
  name: string;
  description?: string;
  sortOrder: number;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RoleInput {
  name: string;
  description?: string;
  sortOrder: number;
}
