import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString({ each: true })
  servicesUsed?: string[];

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @IsOptional()
  @IsBoolean()
  isTenantUser?: boolean;

  @IsOptional()
  @IsBoolean()
  isOrganizationUser?: boolean;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsBoolean()
  isAadhaarCardUploaded?: boolean;

  @IsOptional()
  @IsString()
  aadhaarImageUrl?: string;
}
