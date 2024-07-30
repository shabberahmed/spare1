import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '@app/common';
import { Request, Response } from 'express';
import { TwilioService } from '@app/common/twilio/twilio.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Users } from '../models-dto-type-definitions/1.types/user.type';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import jwt from 'jsonwebtoken';
import { SuperAdminGuard } from './guard/super-admin.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twilioService: TwilioService,
  ) {}
  Opt: string;
  generateOTP() {
    // Generate a random 4-digit number
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(user, response);
    response.send(token);
  }
  // send opt
  @Post('otp')
  async sendOTP(@Body() body: { to: string }) {
    const { to } = body;
    const otp = this.twilioService.generateOTP();
    const message = `Your OTP is: ${otp}`;

    // Send message using TwilioService
    this.twilioService.sendSMS(to, message);

    return { message: 'OTP sent successfully' };
  }
  @Post('verify')
  async checkOtp(
    // @CurrentUser() users: Users,
    @Body() body: { token: string,id:any },
    @Res() res: Response,
  ) {
    const { token,id } = body;

    if (this.twilioService.verifyOTP(token)) {
      console.log('OTP verified successfully');
      const user = id;
      const jwtToken = await this.authService.login(user, res); // Generate JWT token and send it
      return res.json({ token: jwtToken, message: 'success' });
    } else {
      console.log('Invalid OTP');
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  }

  @UseGuards(JwtAuthGuard)
  async authenticate(data: any) {
    return data.user;
  }

  // views
  // @UseGuards(LocalAuthGuard)
  // @Get('/connect')
  // async connect(
  //   @CurrentUser() user: Users,
  //   @Req() request: Request,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   if (!request.cookies || !request.cookies.otp) {
  //     console.log('Cookie "otp" not found');
  //     throw new UnauthorizedException('OTP status cookie not found');
  //   }

  //   if (request.cookies.otp !== 'true') {
  //     console.log('OTP not verified');
  //     throw new UnauthorizedException('OTP not verified');
  //   }

  //   console.log('OTP verified, sending JWT token');
  //   const token = await this.authService.login(user, response);
  //   if (token) {
  //     return token;
  //   } else {
  //     throw new UnauthorizedException('Failed to generate JWT token');
  //   }
  // }

  @Get('/logout')
  // @Redirect('/auth')
  logout(@Req() request, @Res() response: Response) {
    response.clearCookie('Authentication');
    return response.json({ status: true });
  }

  @Get('superadmin')
  @UseGuards(JwtAuthGuard,SuperAdminGuard)
  getSuperAdminInfo() {
    console.log("came here");
    return "only super admin can access this route";
  }

  // @Get('/signin')
  // // @Render('auth/login')
  // signin() {
  //   const viewData = {};
  //   return {
  //     viewData,
  //   };
  // }
}
