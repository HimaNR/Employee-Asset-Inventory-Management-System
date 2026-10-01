export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  userCount: number;
}
