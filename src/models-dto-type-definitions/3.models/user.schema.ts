import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import {
  OrganizationType,
  OrganizationUserRoles,
} from '../1.types/organization.type';
import {
  EmailStatus,
  IUser,
  IUserBioStatus,
  Users,
  UserFullNameStatus,
  IDType,
} from '../1.types/user.type';



@Schema({ optimisticConcurrency: true, timestamps: true })
export class User extends Document implements Users {
  @Prop({ required: false, type: String })
  name: string;

  @Prop({ required: false, unique: false })
  email?: string;

  @Prop({ type: [String], enum: OrganizationUserRoles })
  roles: string[];

  @Prop({ type: [String], enum: OrganizationType })
  servicesUsed: string[];

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: Boolean })
  isSuperAdmin: boolean;

  @Prop()
  walletBalance: number;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ type: Boolean })
  isTenantUser: boolean;

  @Prop({ type: Boolean })
  isOrganizationUser: boolean = false;

  @Prop({ type: Object })
  userBioStatus: IUserBioStatus = {
    emailStatus: EmailStatus.NotAdded,
    nameStatus: UserFullNameStatus.NotAdded,
    idCardUploaded: false,
  };

  @Prop({ type: [{ upid: String, isPrimary: Boolean }] })
  upiId: { upid: string; isPrimary: boolean }[];
  

  @Prop({
    type: {
      imageUrl: { type: String },
      idType: { type: String, enum: IDType },
    },
  })
  aadhaarDetails: {
    imageUrl: string;
    idType: IDType;
  };

}


export const UserSchema = SchemaFactory.createForClass(User);

