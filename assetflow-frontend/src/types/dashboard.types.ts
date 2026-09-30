export interface DashboardOverview {
  totalAssets: number;
  available: number;
  assigned: number;
  inRepair: number; // DAMAGED + UNDER_REPAIR
  categories: number;
}
