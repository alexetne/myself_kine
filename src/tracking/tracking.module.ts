import { Module } from '@nestjs/common';
import { AdaptationEngine } from '../adaptation/adaptation.engine';
import { AuthGuard } from '../identity/auth.guard';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({ controllers: [CheckinController], providers: [CheckinService, AdaptationEngine, AuthGuard] })
export class TrackingModule {}
