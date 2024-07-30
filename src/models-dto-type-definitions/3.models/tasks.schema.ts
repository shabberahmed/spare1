import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TaskStatus } from '../1.types/task,types';

@Schema({ collection: 'tasks', timestamps: true, optimisticConcurrency: true })
export class Task {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // manager or admin id

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdFor: Types.ObjectId; // tenant or patient user id

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId; // ground staff id

  @Prop({ required: true, enum: ['labreports', 'pickup', 'hotels'] })
  taskType: string;

  @Prop({ required: true })
  taskAmount: number; // bill number

  @Prop({ required: true })
  currencyKey: string;

  @Prop({ required: true, default: 'pending' })
  paymentStatus: string;
// new
  @Prop({ required: true, type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId[];
  // @Prop({ required: true, type: Types.ObjectId, ref: 'Payment' })
  // paymentId: Types.ObjectId; 
  // check if any success
  @Prop({ required: false, type: Types.ObjectId, ref: 'Payment' })
  successPaymentId?: Types.ObjectId;
  @Prop({ required: true, default: 'pending', enum: TaskStatus })
  taskStatus: string;

  @Prop({ required: false })
  startTime: Date;

  @Prop({ required: false })
  endTime: Date;

  @Prop({ required: false })
  durationHours: number;
  @Prop({ required: false, type: String })
  formattedDuration: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
