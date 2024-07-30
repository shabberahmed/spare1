import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OtpStatus } from '../1.types/otp.type';

@Schema({ optimisticConcurrency: true, timestamps: true })
export class Otp extends Document {
  @Prop({ required: true, type: String })
  mobileNumber: string;

  @Prop({ type: String })
  otpNumber: string;

  @Prop({ type: String })
  emailDomain: string;

  @Prop({ type: Date }) // Corrected to Date type
  expirationTime: Date;

  @Prop({ type: Date }) // Corrected to Date type
  verificationTime: Date;

  @Prop({ type: String, enum: OtpStatus })
  verificationStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
