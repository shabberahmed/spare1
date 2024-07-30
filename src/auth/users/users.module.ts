import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { DatabaseModule } from '@app/common';
// import { UserRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../../models-dto-type-definitions/3.models/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from 'src/models-dto-type-definitions/3.models/otp.schema';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DatabaseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),

  ],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService,MongooseModule],
})
export class UsersModule {}
