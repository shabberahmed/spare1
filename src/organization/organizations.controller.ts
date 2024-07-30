import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '@app/common';
import { CreateOrganizationDto } from '../models-dto-type-definitions/2.dto/create-organization.dto';
import {
  CreateBranchDto,
  CreateBranchFromOrgDto,
} from '../models-dto-type-definitions/2.dto/create-branch.dto';
import { CreateUserDto } from '../models-dto-type-definitions/2.dto/create-user.dto';
import { SuperAdminGuard } from '../auth/guard/super-admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  OrganizationType,
  OrganizationUserRoles,
} from '../models-dto-type-definitions/1.types/organization.type';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../models-dto-type-definitions/3.models/user.schema';
import { Organization } from '../models-dto-type-definitions/3.models/organization.schema';
import { CompleteOrganizationDetails, OrganizationsBranch } from '../models-dto-type-definitions/3.models/organizations-branch.schema';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationsService) {}
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('/create-organization')
  @ApiOperation({ summary: 'Create Organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization created successfully',
  })
  @ApiBody({
    type: 'object',
    description: 'Data for creating a new organization',
    schema: {
      example: {
        organizationName: 'test',
        organizationType: 'hospital',
        emailDomain: 'test.com',
      },
      properties: {
        organizationName: {
          type: 'string',
          description: 'Organization name',
          example: 'test',
        },
        organizationType: {
          type: 'string',
          description: 'Organization type',
          example: 'hospital',
        },
        emailDomain: {
          type: 'string',
          description: 'Email domain',
          example: 'test.com',
        },
      },
    },
  })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }
  // @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('/check-branch/:organizationId')
  @ApiOperation({ summary: 'Check if any branchs exists' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'organizationId',
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns true if organization exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Returns false if organization does not exist',
  })
  async organizationExists(
    @Param('organizationId') organizationId: string,
  ): Promise<boolean | string> {
    const exists =
      await this.organizationService.checkBranchExists(organizationId);
    return exists;
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('/add-branch')
  @ApiOperation({ summary: 'Add Branch' })
  @ApiResponse({ status: 200, description: 'Branch added successfully' })
  @ApiBody({
    type: 'object',
    description: 'Data for adding a new branch',
    schema: {
      example: {
        branchName: 'test',
        branchLocationLatnLng: 'test',
        branchAddress: 'test',
        branchFacilities: ['test'],
        organizationId: 'test',
      },
      properties: {
        branchName: {
          type: 'string',
          description: 'Branch name',
          example: 'test',
        },
        branchLocationLatnLng: {
          type: 'string',
          description: 'Branch location',
          example: 'test',
        },
        branchAddress: {
          type: 'string',
          description: 'Branch address',
          example: 'test',
        },
        branchFacilities: {
          type: 'array',
          description: 'Branch facilities',
          example: ['test'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization id',
          example: 'test',
        },
      },
    },
  })
  async addBranch(@Body() createBranchDto: CreateBranchDto) {
    return this.organizationService.addBranch(createBranchDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    OrganizationUserRoles.HospitalsAdmin,
    OrganizationUserRoles.HospitalityAdmin,
    OrganizationUserRoles.PlayAreaAdmin,
  )
  @Post('/add-branch-from-org')
  @ApiOperation({ summary: 'Add Branch From Org' })
  @ApiResponse({ status: 200, description: 'Branch added successfully' })
  @ApiBody({
    type: 'object',
    description: 'Data for adding a new branch',
    schema: {
      example: {
        branchName: 'test',
        branchLocationLatnLng: 'test',
        branchAddress: 'test',
        branchFacilities: ['test'],
      },
      properties: {
        branchName: {
          type: 'string',
          description: 'Branch name',
          example: 'test',
        },
        branchLocationLatnLng: {
          type: 'string',
          description: 'Branch location',
          example: 'test',
        },
        branchAddress: {
          type: 'string',
          description: 'Branch address',
          example: 'test',
        },
        branchFacilities: {
          type: 'array',
          description: 'Branch facilities',
          example: ['test'],
        },
      },
    },
  })
  async addBranchFromOrg(
    @Body() createBranchFromOrgDto: CreateBranchFromOrgDto,
    @CurrentUser() user: User,
  ) {
    //@ts-ignore
    let createBranchDto:CreateBranchDto=  createBranchFromOrgDto;
    if (!user) {
      return { message: 'Invalid user' };
    }
    createBranchDto.organizationId =
      await this.organizationService.findOrganizationIdOfUser(user._id);
    if (createBranchDto.organizationId)
      return this.organizationService.addBranch(createBranchDto);
    else
      return { message: "Invalid organization Id" };
    
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrganizationUserRoles.HospitalsAdmin, OrganizationUserRoles.HospitalityAdmin, OrganizationUserRoles.HotelsAdmin, OrganizationUserRoles.PlayAreaAdmin)
  @Get('/get-org-details')
  @ApiOperation({ summary: 'Get Branch From Org' })
  @ApiResponse({ status: 200, type: CompleteOrganizationDetails })//{organization:Organization, branch:Array<OrganizationsBranch> })
  async getCompleteOrgDetails(@CurrentUser() user: User) {
    if (!user) {
      return { message: "Invalid user" };
    }
    let organizationId = await this.organizationService.findOrganizationIdOfUser(user._id);
    if (organizationId) {
      return this.organizationService.getOrganizationDetails(organizationId);
    }
    else {
      return { message: "Invalid organization Id" };
    }


  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('/add-user')
  @ApiOperation({ summary: 'Add User' })
  @ApiResponse({ status: 200, description: 'User added successfully' })
  @ApiBody({
    type: 'object',
    description: 'Data for adding a new user',
    schema: {
      example: {
        phoneNumber: 'test',
        role: 'test',
        organizationId: 'test',
      },
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Phone number',
          example: 'test',
        },
        role: {
          type: 'string',
          description: 'Role',
          example: 'test',
        },
        organizationId: {
          type: 'string',
          description: 'Organization id',
        },
      },
    },
  })
  async addUser(@Body() createUserDto: CreateUserDto) {
    return this.organizationService.addUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    OrganizationUserRoles.HospitalsAdmin,
    OrganizationUserRoles.HospitalityAdmin,
    OrganizationUserRoles.PlayAreaAdmin,
  )
  @Post('/add-user-from-org')
  @ApiOperation({ summary: 'Add User from organization' })
  @ApiResponse({ status: 200, description: 'User added successfully' })
  @ApiBody({
    type: 'object',
    description: 'Data for adding a new user',
    schema: {
      example: {
        phoneNumber: 'test',
        role: 'test',
      },
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Phone number',
          example: 'test',
        },
        role: {
          type: 'string',
          description: 'Role',
          example: 'test',
        },
       
      },
    },
  })
  async addUserFromOrg(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      return { message: 'Invalid user' };
    }
    createUserDto.organizationId =
      await this.organizationService.findOrganizationIdOfUser(user._id);
    if (createUserDto.organizationId)
      return this.organizationService.addUser(createUserDto);
    else return { message: 'Invalid organization Id' };
  }

  @Get('by-organization-type')
  async findAllByType(
    @Query('organizationType')
    organizationType: OrganizationType = OrganizationType.Hospitals,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 2,
  ) {
    return this.organizationService.findAllByOrganizationType(
      organizationType,
      page,
      limit,
    );
  }
}
