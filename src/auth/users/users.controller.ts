import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './users.service';
import { SuperAdminGuard } from '../guard/super-admin.guard';
import { JwtAuthGuard } from '@app/common';
import { OrganizationUserRoles } from 'src/models-dto-type-definitions/1.types/organization.type';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../guard/roles.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RequestOtpDto } from '../../models-dto-type-definitions/2.dto/create-user.dto';
import { UpdateUserDto } from '../../models-dto-type-definitions/2.dto/update-user.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../models-dto-type-definitions/3.models/user.schema';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/request-otp')
  @ApiOperation({ summary: 'Request OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiBody({
    type: 'object',
    schema: {
      type: 'object',
      description: 'request otp with mobile number',
      properties: {
        mobileNumber: {
          type: 'string',
          description: 'please enter mobile number',
          example: '+911234567890',
        },
      },
    },
  }) // Use RequestOtpDto here
  async sendOtp(@Body() requestOtpDto: RequestOtpDto) {
    const otp = await this.userService.sendOtp(requestOtpDto.mobileNumber);
    return { otp };
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login with OTP' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Login with OTP',
      properties: {
        mobileNumber: {
          type: 'string',
          description: 'Phone number',
          example: '+911234567890',
        },
        otp: {
          type: 'string',
          description: 'OTP',
          example: '1234',
        },
      },
    },
  })
  async loginWithOtp(
    @Body('mobileNumber') mobileNumber: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('came here');
    const data = await this.userService.loginWithOtp(mobileNumber, otp);
    res.cookie('token', data.token); // Example: Setting token in a cookie
    // res.setHeader('Authorization', Bearer ${data.token});
    console.log(data.token);
    return { data };
  }

  @Get('superadmin')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({ summary: 'Get Super Admin Info' })
  @ApiResponse({ status: 200, description: 'Super admin info retrieved' })
  getSuperAdminInfo() {
    return 'only super admin can access this route';
  }

  @Get('role-permission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrganizationUserRoles.HospitalsManager)
  @ApiOperation({ summary: 'Get Role Permission Info' })
  @ApiResponse({
    status: 200,
    description: 'Role permission info retrieved',
  })
  permission() {
    return 'only user with HospitalsManager can access this route, not even super admin can access this';
  }

  @Put('update-user')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User
  ) {    
    return this.userService.updateUser(user._id, updateUserDto);
  }

  @Get('all-users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Query('roles') roles:string
  ) {
    let allRoles = roles.split(',');
    console.log("*******************roles",roles);        
    //@ts-ignore
    return this.userService.getAllUsersByRoles(allRoles);
  }

  @Get('get-org-users-by-phNo')
  @UseGuards(JwtAuthGuard)
  async getOrgUsersByPhoneNumber(@Query('phoneNumber') phoneNumber:string
  ) {            
    return this.userService.getOrganizationUsersByPhoneNumberStartingWith(phoneNumber);
  }

  // S3 Signed URL Endpoints
  @Get('s3/presigned-url')
  @ApiOperation({ summary: 'Get Presigned URL' })
  @ApiResponse({ status: 200, description: 'Presigned URL retrieved' })
  async getPresignedUrl() {
    return this.userService.getPresignedUrl();
  }

}