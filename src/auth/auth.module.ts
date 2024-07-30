import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { AuthService } from './auth.service'; // Assuming AuthService is in the same directory
import { DatabaseModule } from '@app/common';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwilioService } from '@app/common/twilio';
import { SuperAdminGuard } from './guard/super-admin.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRATION: joi.string().required(),
        TWILIO_ID: joi.string().required(),
        TWILIO_SECRET_KEY: joi.string().required(),
        TWILIO_NUMBER: joi.string().required(),
      }),
    }),
  ],
  controllers: [AuthController], // Ensure AuthService is included here
  providers: [AuthService, LocalStrategy, JwtStrategy, TwilioService, SuperAdminGuard], // Export AuthService if it's used outside AuthModule
})
export class AuthModule{}
  
