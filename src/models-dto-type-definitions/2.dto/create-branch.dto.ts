import { OmitType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  branchName: string;

  @IsString()
  @IsNotEmpty()
  branchLocationLatnLng: string;

  @IsString()
  @IsNotEmpty()
  branchAddress: string;

  @IsArray()
  @IsOptional()
  branchFacilities?: string[];

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}

export class CreateBranchFromOrgDto extends OmitType(CreateBranchDto, ['organizationId']) {}
