import { Injectable } from '@nestjs/common';

export interface AdaptationInput { fatigue: number; sleepQuality: number; discomfort?: number; urgentSignal?: boolean }
export interface AdaptationResult { action: 'maintain' | 'reduce_volume' | 'add_rest' | 'professional_review'; reasonCode: string; explanation: string; ruleCode: string; ruleVersion: number }

@Injectable()
export class AdaptationEngine {
  evaluate(input: AdaptationInput): AdaptationResult {
    if (input.urgentSignal) return { action: 'professional_review', reasonCode: 'DECLARED_URGENT_SIGNAL', explanation: 'La progression est suspendue. Demandez rapidement un avis professionnel adapté.', ruleCode: 'safety-urgent-signal', ruleVersion: 1 };
    if ((input.discomfort ?? 0) >= 7) return { action: 'add_rest', reasonCode: 'HIGH_DISCOMFORT', explanation: 'Une gêne importante a été déclarée. La prochaine charge est suspendue sans interprétation diagnostique.', ruleCode: 'recovery-high-discomfort', ruleVersion: 1 };
    if (input.fatigue >= 8 || input.sleepQuality <= 2) return { action: 'reduce_volume', reasonCode: 'RECOVERY_LIMITED', explanation: 'Le volume proposé est réduit car la récupération déclarée est limitée.', ruleCode: 'recovery-volume', ruleVersion: 1 };
    return { action: 'maintain', reasonCode: 'RECOVERY_ACCEPTABLE', explanation: 'La séance est maintenue car les indicateurs déclarés restent dans le périmètre prévu.', ruleCode: 'recovery-maintain', ruleVersion: 1 };
  }
}
