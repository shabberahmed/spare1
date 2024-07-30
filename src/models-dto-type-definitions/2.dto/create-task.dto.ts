import { IsString, IsEnum, IsMongoId, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskDto {
  @IsMongoId()
  createdBy: Types.ObjectId;

  @IsMongoId()
  createdFor: Types.ObjectId;

  @IsMongoId()
  assignedTo: Types.ObjectId;

  @IsEnum(['labreports', 'pickup', 'hotels'])
  taskType: string;

  @IsString()
  taskAmount: string;

  @IsString()
  currencyKey: string;

  @IsEnum(['pending', 'assigned', 'done', 'inprogress', 'notdone'])
  paymentStatus: string;

  @IsMongoId()
  paymentId: Types.ObjectId;

  @IsEnum(['pending', 'assigned', 'done', 'inprogress', 'notdone'])
  taskStatus: string;
@IsOptional()
  @IsDateString()
  startTime: string;
  @IsOptional()
  @IsString()
  endTime: string;
  @IsOptional()
  @IsNumber()
  durationHours: number;
}
