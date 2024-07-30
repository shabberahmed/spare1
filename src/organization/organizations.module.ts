import { Module } from '@nestjs/common';
import { OrganizationController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { DatabaseModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';
import {
  Organization,
  OrganizationSchema,
} from 'src/models-dto-type-definitions/3.models/organization.schema';
import { OrganizationsBranch, OrganizationsBranchSchema } from 'src/models-dto-type-definitions/3.models/organizations-branch.schema';
import { UsersModule } from 'src/auth/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
      }),
    }),
    DatabaseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationsBranch.name, schema: OrganizationsBranchSchema },
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationsService, ConfigService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
