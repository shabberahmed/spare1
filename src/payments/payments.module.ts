import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@app/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import Payment, { PaymentSchema } from '../models-dto-type-definitions/3.models/payment.schema';
import { Task, TaskSchema } from 'src/models-dto-type-definitions/3.models/tasks.schema';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
        RAZORPAY_API_KEY: joi.string().required(),
        RAZORPAY_APT_SECRET: joi.string().required(),
      }),
    }),
    PaymentsModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    DatabaseModule.forFeature([{ name: Task.name, schema: TaskSchema }])
    

  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
