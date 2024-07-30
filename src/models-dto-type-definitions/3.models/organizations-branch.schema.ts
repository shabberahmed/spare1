/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import {
  OrganizationType,
  OrganizationUserRoles,
} from '../1.types/organization.type';
import { Organization } from './organization.schema';

@Schema({ optimisticConcurrency: true, timestamps: true })
export class OrganizationsBranch extends Document {
  @Prop({ required: true })
  branchName: string;

  @Prop({ type: String })
  branchLocationLatnLng: string;

  @Prop({ type: String, required: true })
  branchAddress: string;

  @Prop({ type: [String] })
  branchFacilities: string[];
  // user id reference or organization id reference
  // @Prop({ type: Types.ObjectId, required: true })
  // organizationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;
}

export class CompleteOrganizationDetails {
  organization:Organization;
  branches:Array<OrganizationsBranch>;
}

export const OrganizationsBranchSchema =
  SchemaFactory.createForClass(OrganizationsBranch);
