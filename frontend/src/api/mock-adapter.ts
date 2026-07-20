import type { components } from "./schema";
import {
  ApiError,
  type AuthInput,
  type AuthSession,
  type ConsentInput,
  type ConsentRecord,
  type OrientationKind,
  type QualificationApi,
  type QuestionnaireSubmissionInput,
  type QuestionnaireVersion,
  type SportProfile,
  type SportProfileInput,
} from "./types";

const ids = {
  consent: "00000000-0000-7000-8000-000000000101",
  consentRecord: "00000000-0000-7000-8000-000000000102",
  questionnaire: "00000000-0000-7000-8000-000000000201",
  submission: "00000000-0000-7000-8000-000000000202",
  rules: "00000000-0000-7000-8000-000000000203",
};

const questionnaire: QuestionnaireVersion = {
  version_id: ids.questionnaire,
  code: "synthetic-safety-demo",
  version: 1,
  title: "Questionnaire de sécurité — contenu clinique provisoire",
  content_hash: "a".repeat(64),
  disclaimer:
    "Brouillon 0.1 non validé. Ce questionnaire ne pose aucun diagnostic.",
  questions: [
    {
      id: "movement-limitation",
      type: "boolean",
      label:
        "As-tu actuellement une douleur importante qui t’empêche de réaliser tes mouvements habituels ?",
      required: true,
      options: ["yes", "no", "unknown"],
    },
    {
      id: "recent-event",
      type: "boolean",
      label: "As-tu subi une opération ou une blessure importante récemment ?",
      required: true,
      options: ["yes", "no", "unknown"],
    },
    {
      id: "sport-prohibition",
      type: "boolean",
      label:
        "Un professionnel de santé t’a-t-il interdit temporairement le sport ?",
      required: true,
      options: ["yes", "no", "unknown"],
    },
    {
      id: "urgent-signs",
      type: "boolean",
      label:
        "Ressens-tu aujourd’hui une douleur thoracique, un malaise ou un essoufflement inhabituel ?",
      required: true,
      options: ["yes", "no", "unknown"],
    },
    {
      id: "limiting-condition",
      type: "boolean",
      label:
        "Prends-tu un traitement ou as-tu une maladie pouvant limiter tes efforts physiques ?",
      required: true,
      options: ["yes", "no", "unknown"],
    },
  ],
};

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockQualificationApi implements QualificationApi {
  constructor(
    private readonly scenario: OrientationKind = "possible",
    private readonly forcedError?: ApiError["code"],
  ) {}

  private async ready() {
    await delay();
    if (this.forcedError)
      throw new ApiError(this.forcedError, this.forcedError);
  }

  async authenticate(input: AuthInput): Promise<AuthSession> {
    await this.ready();
    if (!input.email || !input.password)
      throw new ApiError("unknown", "Identifiants incomplets");
    return {
      accessToken: "mock-access-token",
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    };
  }

  async recordConsent(input: ConsentInput): Promise<ConsentRecord> {
    await this.ready();
    if (input.decision !== "granted")
      throw new ApiError("consent_missing", "Consentement requis");
    return {
      ...input,
      id: ids.consentRecord,
      recorded_at: new Date().toISOString(),
    };
  }

  async putSportProfile(input: SportProfileInput): Promise<SportProfile> {
    await this.ready();
    return { ...input, version: 1, updated_at: new Date().toISOString() };
  }

  async getInitialSafetyQuestionnaire(): Promise<QuestionnaireVersion> {
    await this.ready();
    return questionnaire;
  }

  async submitInitialSafetyQuestionnaire(
    versionId: string,
    input: QuestionnaireSubmissionInput,
  ) {
    await this.ready();
    void input;
    const evaluation: components["schemas"]["RuleResult"] = {
      status: "simulation",
      action: this.scenario,
      reason_code: `SYNTHETIC_${this.scenario.toUpperCase()}`,
      explanation: "Décision synthétique fournie par l’adaptateur API simulé.",
      rule_set_version_id: ids.rules,
      matched_rule_version_ids: [],
    };
    return {
      id: ids.submission,
      questionnaire_version_id: versionId,
      submitted_at: new Date().toISOString(),
      evaluation,
    };
  }
}

export const mockConsentDefinitionId = ids.consent;
