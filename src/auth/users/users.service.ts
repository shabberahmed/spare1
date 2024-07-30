
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../../models-dto-type-definitions/3.models/user.schema';
import { Otp } from '../../models-dto-type-definitions/3.models/otp.schema';
import { OtpStatus } from '../../models-dto-type-definitions/1.types/otp.type';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from '../../models-dto-type-definitions/2.dto/update-user.dto';
import { v1 as uuidv1 } from 'uuid';
import { OrganizationUserRoles } from '../../models-dto-type-definitions/1.types/organization.type';

@Injectable()
export class UserService {
  private s3: S3;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    public configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  otpCode = '1234';

  async sendOtp(mobileNumber: string): Promise<{ message: string }> {
    let user = await this.userModel.findOne({ phoneNumber: mobileNumber });

    if (!user) {
      user = await this.userModel.create({ phoneNumber: mobileNumber });
    }

    await this.otpModel.create({
      mobileNumber: mobileNumber,
      otpNumber: this.otpCode,
      expirationTime: new Date(Date.now() + 1 * 60000),
      verificationStatus: OtpStatus.otpSent,
      userId: user._id,
    });

    return { message: 'OTP sent to your mobile number' };
  }

  async loginWithOtp(mobileNumber: string, otp: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ phoneNumber: mobileNumber });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const otpDocument = await this.otpModel.findOne({
        mobileNumber,
        otpNumber: otp,
      });

      if (!otpDocument) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (otpDocument.verificationStatus === OtpStatus.otpSent) {
        if (otpDocument.expirationTime < new Date()) {
          await this.otpModel.findByIdAndDelete(otpDocument._id);
          return { success: false, message: 'OTP has expired' };
        } else {
          otpDocument.verificationStatus = OtpStatus.verified;
          await this.otpModel.findByIdAndDelete(otpDocument._id);
        }
      } else {
        return {
          success: false,
          message: 'Unexpected OTP verification status',
        };
      }

      const payload = user.toJSON();
      const token = jwt.sign(payload, this.configService.get('JWT_SECRET'));

      return { success: true, token };
    } catch (error) {
      console.error('Error during OTP login:', error);
      return { success: false, message: 'Failed to authenticate' };
    }
  }

  async findIfSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      _id: userId,
      isSuperAdmin: true,
    });
    return !!user;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(new Types.ObjectId(userId));
  }

  async updateUser(
    userId: any,
    updateUserDto: UpdateUserDto,
  ): Promise<User | string> {
    const existingUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true },
    );
    return existingUser;
  }

  async getAllUsersByRoles(
    roles:Array<OrganizationUserRoles>
  ): Promise<Array<User>> {
    console.log("service    ***** roles",roles);
    return await this.userModel.find({
      isTenantUser: true,
      roles: { $in: roles }  
    }).exec();
  
  }

  async getOrganizationUsersByPhoneNumberStartingWith(
    phoneNumberStart: string
  ): Promise<Array<User>> {
    const regex = new RegExp(`^${phoneNumberStart}`, 'i'); // Case insensitive matching
    return await this.userModel.find({
      isTenantUser: true,
      phoneNumber: { $regex: regex },
    }).exec();
  }

  async getOrganizationUsersByRolesAndPhoneNumber(
    roles: Array<OrganizationUserRoles>,
    phoneNumberStart: string
  ): Promise<Array<User>> {
    const regex = new RegExp(`^${phoneNumberStart}`, 'i'); // Case insensitive matching
    return await this.userModel.find({
      isTenantUser: true,
      roles: { $in: roles },
      phoneNumber: { $regex: regex },
    }).exec();
  }


async getPresignedUrl(): Promise<{ url: string; key: string }> {
  const key = `uploads/${uuidv1()}.jpg`; // Assuming JPEG file type
  const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: key,
      Expires: 100000,
    };
    const url = this.s3.getSignedUrl('putObject', params);
    return { url, key };
  }
}