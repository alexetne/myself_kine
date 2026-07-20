import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  subject: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  requestId: string;
  user: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
