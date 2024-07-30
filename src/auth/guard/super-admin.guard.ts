import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserService } from '../users/users.service'; // Adjust this import based on your service setup+
// import * as cookieParser from 'cookie-parser';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UserService,
  ) {
    console.log("called")
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    try
    {
        const request = context.switchToHttp().getResponse();
        console.log();
        console.log("SuperAdminGuard request.user",request.req.user);
        console.log("SuperAdminGuard request.user.id",request.req.user.id);
        console.log("SuperAdminGuard request.user._id",request.req.user._id);
        // const user = request.cookie('token'); 
        // console.log(user.token)
        return this.usersService.findIfSuperAdmin(request.req.user._id);
    }
    catch(e)
    {
        console.log("caught exception",e);
    }
    
  }
}