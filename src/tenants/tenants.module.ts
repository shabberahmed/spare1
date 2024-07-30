import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { Tenant, TenantSchema } from './models/tenant.schema';
import * as joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantUser, TenantUserSchema } from './models/tenant-user.schema';
import { TenantService } from './tenants.service';
import { TenantController } from './tenants.controller';

// import { TenantRepository } from './tenant.repository';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
      }),
    }),
    TenantModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantUser.name, schema: TenantUserSchema },
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
