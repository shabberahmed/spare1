import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantType } from './models/tenant.schema';
import { TenantUser } from './models/tenant-user.schema';
import * as speakeasy from 'speakeasy';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(TenantUser.name) private tenantUserModel: Model<TenantUser>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    console.log('find all working');
    return this.tenantModel.find();
  }

  async findById(id: string): Promise<Tenant> {
    return this.tenantModel.findById(id);
  }

  async create(createTenantDto: CreateTenantDto): Promise<any> {
    const checkType = await this.tenantModel.find({
      type: createTenantDto.type,
    });
    const checkOrgType = checkType.map((val) => val.organization_name);
    const val = checkOrgType.find(
      (org) =>
        org.toLowerCase().trim() ===
        createTenantDto.organization_name.toLowerCase().trim(),
    );
    if (val?.length == 0 || val === undefined) {
      console.log('creating');
      const createdTenant = new this.tenantModel(createTenantDto);
      return createdTenant.save();
    } else {
      return {
        message: `${createTenantDto.organization_name} already exists in ${createTenantDto.type}`,
      };
    }
  }

  async createMultipleTenant(
    createTenantDtos: CreateTenantDto[],
  ): Promise<any> {
    const existingTenantsMessages = [];

    for (const createTenantDto of createTenantDtos) {
      const checkType = await this.tenantModel.find({
        type: createTenantDto.type,
      });

      const checkOrgType = checkType.map((val) => val.organization_name);
      const val = checkOrgType.find(
        (org) =>
          org.toLowerCase().trim() ===
          createTenantDto.organization_name.toLowerCase().trim(),
      );

      if (!val) {
        console.log(`Creating ${createTenantDto.organization_name}`);
        const createdTenant = new this.tenantModel(createTenantDto);
        await createdTenant.save();
      } else {
        existingTenantsMessages.push(
          `${createTenantDto.organization_name} already exists in ${createTenantDto.type}`,
        );
      }
    }
    if (existingTenantsMessages.length > 0) {
      return { messages: existingTenantsMessages };
    } else {
      return { success: true };
    }
  }

  async update(id: string, tenant: Tenant): Promise<any> {
    console.log(id, 'is id');
    console.log(tenant, 'is tenant');
    try {
      const updatedTenant = await this.tenantModel.findByIdAndUpdate(
        id,
        tenant,
        { new: true },
      );

      if (!updatedTenant) {
        return { message: 'Tenant not found' };
      }

      return { message: 'Updated successfully', updatedTenant };
    } catch (err) {
      return { message: err.message };
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const deletedTenant = await this.tenantModel.findByIdAndDelete(id);

      if (!deletedTenant) {
        return { message: 'Tenant not found' };
      }

      return { message: 'Deleted successfully', deletedTenant };
    } catch (err) {
      return { message: err.message };
    }
  }

  // get tenant using organization
  async getTenantByOrg(organization_name: string, organizationType:TenantType): Promise<any> {
    try {
      const tenant = await this.tenantModel.findOne({ organization_name, type:organizationType });

      if (!tenant) {
        return {
          message: `Tenant with organization '${organization_name}' not found.`,
        };
      }

      return tenant;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tenant: ${error.message}`,
      );
    }
  }

  // tenant user ----section

  async createTenantUser(tenantUser: any): Promise<any> {
    try {
      const { tenantId, email } = tenantUser;

      if (!Types.ObjectId.isValid(tenantId)) {
        return {
          statusCode: 400,
          message: 'Invalid tenantId format. Must be a valid ObjectId.',
          error: 'Bad Request',
        };
      }

      const tenant = await this.tenantModel.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found.`);
      }

      const verificationCode = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 6,
      });
      console.log(`Verification code: ${verificationCode}`);

      const newUser = new this.tenantUserModel({ email, tenantId });
      await newUser.save();

      return {
        verificationCode,
        message: 'Verification code sent. Welcome from City Service App!',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          message: error.message,
        };
      } else {
        return { message: `Failed to create tenant user: ${error.message}` };
      }
    }
  }
}
