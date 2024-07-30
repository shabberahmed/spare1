import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from 'src/models-dto-type-definitions/1.types/user.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Users => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
