import { toDateOnly } from '../common/utils/date.util';
import type { AssetRecord } from './asset.select';
import type { AssetResponse } from './interfaces/asset-response.interface';

/** Database record -> public API shape */
export function toAssetResponse(record: AssetRecord): AssetResponse {
  const { assignments, purchaseDate, purchasePrice, warrantyExpiryDate, ...asset } = record;
  const current = assignments[0];

  return {
    ...asset,
    purchaseDate: toDateOnly(purchaseDate),
    warrantyExpiryDate: toDateOnly(warrantyExpiryDate),
    purchasePrice: purchasePrice ? purchasePrice.toFixed(2) : null,
    currentAssignment: current
      ? {
          id: current.id,
          assignedAt: current.assignedAt,
          employee: {
            id: current.employee.id,
            employeeCode: current.employee.employeeCode,
            fullName: `${current.employee.firstName} ${current.employee.lastName}`,
          },
        }
      : null,
  };
}
