/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export default class Payment extends Document {  
  @Prop({ required: false })  
  razorpay_order_id: string;

  @Prop({ required: false })  
  razorpay_payment_id: string;

  @Prop({ required: false })  
  razorpay_signature: string;

  @Prop()  
  payment_method: string;

  @Prop()  
  amount: string;

  @Prop({ default: Date.now })  
  createdAt: Date;

  @Prop({ required: false, enum: ['idcreated', 'orderid_created', 'captured', 'failed', 'refund'] })  
  payment_status: string;

  @Prop({ required: false, enum: ['direct-transfer', 'routing','notdefined'] ,default:'notdefined'})  
  payment_type?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })  
  tenant_users: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrganizationsBranch' }] })  
  org_branches: Types.ObjectId[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);