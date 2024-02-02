import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetUserId = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.user.userId;
});

export const GetUserProviderId = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.user.providerId;
});

export const GetUserToken = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers['authorization']?.slice(7);
});
