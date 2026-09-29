export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  assetCount: number;
  createdAt: Date;
  updatedAt: Date;
}
