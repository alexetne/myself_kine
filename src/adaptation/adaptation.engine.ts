import { Injectable } from "@nestjs/common";

export interface AdaptationInput {
  checkinId?: string;
  sessionRunId?: string;
  questionnaireSubmissionId?: string;
}

export interface AdaptationResult {
  status: "not_evaluated";
  action: "none";
  reasonCode: "CLINICAL_REFERENCE_NOT_PUBLISHED";
  explanation: string;
  ruleVersionId: null;
}

/**
 * Safe default until a clinically validated rule set has been reviewed and
 * published. This component deliberately contains no thresholds or medical
 * interpretation. A future evaluator must receive an immutable published
 * RuleSetVersion and persist both its inputs and result.
 */
@Injectable()
export class AdaptationEngine {
  evaluate(_input: AdaptationInput): AdaptationResult {
    return {
      status: "not_evaluated",
      action: "none",
      reasonCode: "CLINICAL_REFERENCE_NOT_PUBLISHED",
      explanation:
        "Aucune adaptation automatique n’est appliquée tant que le référentiel clinique validé n’est pas publié.",
      ruleVersionId: null,
    };
  }
}
