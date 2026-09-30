import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';

/**
 * Every create field is optional, EXCEPT assetCode, which cannot be changed:
 * it is the physical tag stuck on the device.
 * Send null to clear an optional field (e.g. "notes": null).
 * Status and isActive are changed only through workflow endpoints, never here.
 */
export class UpdateAssetDto extends PartialType(
  OmitType(CreateAssetDto, ['assetCode'] as const),
) {}
