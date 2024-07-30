import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    console.log('first err');
    // const user = await this.userService.verifyUser(email, password);
    // if (!user) throw new UnauthorizedException('Invalid User, Not Found.');
    // return user;
  }
}
