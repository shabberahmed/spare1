// tenant-user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TenantUser extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: false })
  verified: boolean;
}

export const TenantUserSchema = SchemaFactory.createForClass(TenantUser);
