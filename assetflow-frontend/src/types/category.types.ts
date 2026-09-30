export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CategorySortField = 'name' | 'createdAt' | 'updatedAt';

// "type" (not "interface") so it can be passed as a query-string record
export type CategoryQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: CategorySortField;
  sortOrder?: 'asc' | 'desc';
};

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
