import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Tenant, TenantType } from './models/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantService } from './tenants.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Get('/by-org')
  async getTenantByOrg(@Query('organization') organization_name: string,@Query('organizationType') organizationType: TenantType) {
    const tenant = await this.tenantService.getTenantByOrg(organization_name,organizationType);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }
  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Tenant> {
    return this.tenantService.findById(id);
  }

  @Post()
  async create(@Body() createTenantDto: any) {
    console.log(createTenantDto);
    return this.tenantService.create(createTenantDto);
  }
  @Post('create-multiple')
  async createMultipleTenant(
    @Body() createTenantDtos: CreateTenantDto[],
  ): Promise<Tenant[]> {
    console.log('Creating multiple tenants:', createTenantDtos);
    return this.tenantService.createMultipleTenant(createTenantDtos);
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() tenant: Tenant,
  ): Promise<Tenant> {
    return this.tenantService.update(id, tenant);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Tenant> {
    return this.tenantService.delete(id);
  }
  // tenant user ------section

  @Post('create-tenant-user')
  async createTenantUser(@Body() tenantUser: any): Promise<any> {
    return this.tenantService.createTenantUser(tenantUser);
  }
}
