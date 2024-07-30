import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import {
  Task,
  TaskSchema,
} from 'src/models-dto-type-definitions/3.models/tasks.schema';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { DatabaseModule } from '@app/common';
import { User, UserSchema } from 'src/models-dto-type-definitions/3.models/user.schema';
import { Organization, OrganizationSchema } from 'src/models-dto-type-definitions/3.models/organization.schema';
import Payment, { PaymentSchema } from 'src/models-dto-type-definitions/3.models/payment.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DatabaseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    DatabaseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, ConfigService],
  exports: [TaskService],
})
export class TaskModule {}
