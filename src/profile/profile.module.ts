import { Module } from '@nestjs/common';
import { AuthGuard } from '../identity/auth.guard';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({ controllers: [ProfileController], providers: [ProfileService, AuthGuard] })
export class ProfileModule {}
