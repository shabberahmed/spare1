import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Users } from '../../models-dto-type-definitions/1.types/user.type';
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.verbose(`With in canActivate`);
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('roles', roles);
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    request.user as Users;

    let rolesLength = 0;
    roles.forEach((ele) => {      
      if (request.user.roles.find((requestRole) => requestRole == ele)) {
        rolesLength++;
      }
    });
    if (rolesLength > 0) {
        return true;
    } else
    { 
      return false
    };    
  }
}
