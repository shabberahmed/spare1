import { IOrganization, OrganizationType } from '../1.types/organization.type';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateOrganizationDto implements IOrganization {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsEnum(OrganizationType)
  @IsNotEmpty()
  organizationType: OrganizationType;

  @IsString()
  @IsOptional()
  emailDomain?: string;
}
