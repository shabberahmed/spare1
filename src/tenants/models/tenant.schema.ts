import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TenantType {
  HOSPITALITY = 'Hospitality',
  HOSPITALS = 'Hospitals',
  HOTELS = 'Hotels',
  PLAY_AREA = 'PlayArea',
}

@Schema({ optimisticConcurrency: true, timestamps: true })
export class Tenant extends Document {
  @Prop({})
  organization_name: string;

  @Prop()
  contact_info: string;

  @Prop({ type: String, enum: TenantType })
  type: TenantType;
  @Prop()
  emailDomain: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
