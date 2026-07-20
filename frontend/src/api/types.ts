import type { components } from "./schema";

export type SportProfileInput = components["schemas"]["SportProfileInput"];
export type SportProfile = components["schemas"]["SportProfile"];
export type ConsentInput = components["schemas"]["ConsentInput"];
export type ConsentRecord = components["schemas"]["ConsentRecord"];
export type QuestionnaireVersion =
  components["schemas"]["QuestionnaireVersion"];
export type QuestionnaireSubmissionInput =
  components["schemas"]["QuestionnaireSubmissionInput"];
export type QuestionnaireSubmission =
  components["schemas"]["QuestionnaireSubmission"];

export type OrientationKind = "possible" | "monitor" | "consult" | "urgent";

export type Orientation = {
  kind: OrientationKind;
  title: string;
  message: string;
  actionLabel: string;
  explanation: string;
  provisional: true;
};

export type AuthInput = {
  mode: "create" | "login";
  email: string;
  password: string;
};
export type AuthSession = { accessToken: string; expiresAt: string };

export interface QualificationApi {
  authenticate(input: AuthInput): Promise<AuthSession>;
  recordConsent(input: ConsentInput): Promise<ConsentRecord>;
  putSportProfile(input: SportProfileInput): Promise<SportProfile>;
  getInitialSafetyQuestionnaire(): Promise<QuestionnaireVersion>;
  submitInitialSafetyQuestionnaire(
    versionId: string,
    input: QuestionnaireSubmissionInput,
  ): Promise<QuestionnaireSubmission>;
}

export class ApiError extends Error {
  constructor(
    public readonly code:
      | "offline"
      | "session_expired"
      | "consent_missing"
      | "questionnaire_unavailable"
      | "unknown",
    message: string,
  ) {
    super(message);
  }
}
