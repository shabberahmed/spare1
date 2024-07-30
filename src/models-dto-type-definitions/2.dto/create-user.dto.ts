import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { OrganizationUserRoles } from '../1.types/organization.type';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsEnum(OrganizationUserRoles, { each: true })
  @IsNotEmpty()
  roles: OrganizationUserRoles[];

  @IsString()
  @IsEnum(OrganizationUserRoles)
  @IsNotEmpty()
  role: OrganizationUserRoles;

  @IsArray()
  @IsOptional()
  servicesUsed?: string[];

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsBoolean()
  @IsOptional()
  isTenantUser?: boolean;
  
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

export class CreateUserFromOrgDTO extends CreateUserDto {

  @IsNotEmpty()
  organizationId: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;
}

// dto/login-with-otp.dto.ts

export class LoginWithOtpDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Mobile number used to receive OTP',
  })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({
    example: '1234',
    description: 'The OTP code received on mobile',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
