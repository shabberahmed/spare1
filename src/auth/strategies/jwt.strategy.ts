import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: false,
    });
    console.log('came here line 20 of jwtstartegy');
  }

  async validate(payload: any) {
    // console.log("*******request.user*******",request.headers);
    console.log('*********request.sub*****', payload._id);
    return this.usersService.findById(payload._id);
  }
}

// super({
//   jwtFromRequest: ExtractJwt.fromExtractors([
//     (request: any) =>
//       request?.cookies?.Authentication ||
//       request?.Authentication ||
//       request?.headers.Authentication,
//   ]),
//   secretOrKey: configService.get('JWT_SECRET'),
// });
