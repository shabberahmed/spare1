import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Organization } from '../models-dto-type-definitions/3.models/organization.schema';
import { User } from '../models-dto-type-definitions/3.models/user.schema';
import { OrganizationsBranch } from '../models-dto-type-definitions/3.models/organizations-branch.schema';
import { CreateOrganizationDto } from '../models-dto-type-definitions/2.dto/create-organization.dto';
import { CreateBranchDto } from '../models-dto-type-definitions/2.dto/create-branch.dto';
import { CreateUserDto } from '../models-dto-type-definitions/2.dto/create-user.dto';
import { OrganizationType } from '../models-dto-type-definitions/1.types/organization.type';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(OrganizationsBranch.name)
    private branchModel: Model<OrganizationsBranch>,
  ) {}

  // Create organization
  async create(createOrganizationDto: CreateOrganizationDto): Promise<any> {
    try {
      const { organizationName, organizationType } = createOrganizationDto;

      // Check if an organization with the same name and type exists
      const existingOrganization = await this.organizationModel.findOne({
        organizationName: {
          $regex: new RegExp(`^${organizationName}$`, 'i'), 
        },
        organizationType: organizationType,
      });

      if (existingOrganization) {
        return {
          message: `${organizationName} already exists in ${organizationType}`,
        };
      }

      // Create new organization
      const createdOrganization = new this.organizationModel(
        createOrganizationDto,
      );
      const savedOrganization = await createdOrganization.save();
      return savedOrganization;
    } catch (err) {
      return {
        message: 'Internal server error',
        error: err.message,
      };
    }
  }

  // Check if organization exists
  async checkBranchExists(organizationId: string): Promise<boolean | string> {
    if (!Types.ObjectId.isValid(organizationId)) {
      return 'enter a valid object id';
    }
    const branchCount = await this.organizationModel.countDocuments({
      organizationId,
    });

    return branchCount > 0;
  }

  async getOrganizationDetails(organizationId: string):Promise<any>
  {
    const organization = await this.organizationModel.findById(organizationId);
    const branchesList = await this.branchModel.find({organizationId:organizationId})

    return {
      organization:organization,
      branches: branchesList
    }
  }
  // Check if organization exists
  async organizationExists(organizationId: string): Promise<boolean | string> {
    if (!Types.ObjectId.isValid(organizationId)) {
      return 'enter a valid object id';
    }
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      return false;
    } else {
      return true;
    }
  }

  async findOrganizationIdOfUser(userId: any): Promise<string | any> {
    const user = await this.userModel.findOne({
      _id: userId,
    });
    console.log(user.organizationId, 'check org id');
    return user.organizationId;
  }

  // Add branch
  async addBranch(createBranchDto: CreateBranchDto): Promise<any> {
    const { organizationId } = createBranchDto;
    try {
      const organizationExists = await this.organizationExists(organizationId);
      if (!organizationExists) {
        return {
          success: false,
          message: `Organization with ID not found.`,
        };
      }

      const newBranch = new this.branchModel(createBranchDto);
      const savedBranch = await newBranch.save();
      return {
        success: true,
        branch: savedBranch,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Internal server error',
        error: err.message,
      };
    }
  }

  // Add user
  async addUser(createUserDto: CreateUserDto): Promise<any> {
    const { organizationId, phoneNumber, role } = createUserDto;
    try {

      if(organizationId===null || organizationId=== undefined)
        {
          return {
            message: `Organization ID not sent`,
          };
        }
      const organizationExists = await this.organizationExists(organizationId);
      if (!organizationExists) {
        return {
          message: `Organization with ID ${organizationId} not found.`,
        };
      }

      let user = await this.userModel.findOne({ phoneNumber });
      if (user) {
        if (!user.roles.includes(role)) {
          user.roles.push(role);
          user.organizationId = new mongoose.Types.ObjectId(organizationId);
          await user.save();
        }
      } else {
        createUserDto.isTenantUser = true;
        user = new this.userModel(createUserDto);
        await user.save();
      }

      return user;
    } catch (err) {
      return {
        message: 'Internal server error',
        error: err.message,
      };
    }
  }

  async findAllByOrganizationType(
    organizationType: OrganizationType,
    page: number = 1,
    limit: number = 2,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    console.log("type",organizationType);
    const [organizations, total] = await Promise.all([
      this.organizationModel.find({ organizationType:organizationType }).skip(skip).limit(limit).exec(),
      this.organizationModel.countDocuments({ organizationType:organizationType }).exec()
    ]);

    return {
      total,
      page,
      limit,
      data: organizations,
    };
  }
}
