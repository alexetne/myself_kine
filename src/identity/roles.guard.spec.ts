import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('rejects a user without an administrative role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    const context = { getHandler: jest.fn(), getClass: jest.fn(), switchToHttp: () => ({ getRequest: () => ({ user: { roles: ['user'] } }) }) } as unknown as ExecutionContext;
    expect(() => new RolesGuard(reflector).canActivate(context)).toThrow(ForbiddenException);
  });
});
