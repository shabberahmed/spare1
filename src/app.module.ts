import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; // Adjust path as per your project
import { TenantModule } from './tenants/tenants.module';
// import { PaymentsService } from './payments/payments.service';
// import { PaymentsController } from './payments/payments.controller';
import { PaymentsModule } from './payments/payments.module';
import { OrganizationsModule } from './organization/organizations.module';
import { JwtModule } from '@nestjs/jwt';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
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
    }),
    AuthModule,
    TenantModule,
    PaymentsModule,
    PaymentsModule,
    OrganizationsModule,
    TaskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
