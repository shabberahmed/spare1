import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IOrganization, OrganizationType } from '../1.types/organization.type';

@Schema({ optimisticConcurrency: true, timestamps: true })
export class Organization extends Document implements IOrganization {
  @Prop({ required: true })
  organizationName: string;

  @Prop({ type: String, enum: OrganizationType })
  organizationType: OrganizationType;

  @Prop({ type: String })
  emailDomain: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
