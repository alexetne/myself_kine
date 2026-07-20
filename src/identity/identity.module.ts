import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { MeController } from './me.controller';

@Module({ controllers: [MeController], providers: [AuthGuard] })
export class IdentityModule {}
