import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/models-dto-type-definitions/3.models/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: any, response: Response) {
    const tokenPayload = { name:"ahmed" };

    const token = this.jwtService.sign(tokenPayload);
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() +
        parseInt(this.configService.get('JWT_EXPIRATION'), 10),
    );
    //response.cookie('Authentication', token, { httpOnly: true, expires });
    return {accessToken:token};
  }
}
