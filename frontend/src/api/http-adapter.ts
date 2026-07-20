import type { paths } from "./schema";
import {
  ApiError,
  type AuthInput,
  type AuthSession,
  type ConsentInput,
  type QualificationApi,
  type QuestionnaireSubmissionInput,
  type SportProfileInput,
} from "./types";

type ProfileResponse =
  paths["/me/profile"]["put"]["responses"]["200"]["content"]["application/json"];
type ConsentResponse =
  paths["/me/consents"]["post"]["responses"]["201"]["content"]["application/json"];
type QuestionnaireList =
  paths["/questionnaires"]["get"]["responses"]["200"]["content"]["application/json"];
type QuestionnaireResponse =
  paths["/questionnaires/{version_id}"]["get"]["responses"]["200"]["content"]["application/json"];
type SubmissionResponse =
  paths["/questionnaires/{version_id}/submissions"]["post"]["responses"]["201"]["content"]["application/json"];

export class HttpQualificationApi implements QualificationApi {
  constructor(
    private readonly baseUrl: string,
    private session?: AuthSession,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthSession> {
    void input;
    throw new ApiError(
      "unknown",
      "L’authentification OIDC réelle sera branchée séparément.",
    );
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!navigator.onLine)
      throw new ApiError("offline", "Connexion indisponible");
    if (!this.session || new Date(this.session.expiresAt) <= new Date())
      throw new ApiError("session_expired", "Session expirée");
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.session.accessToken}`,
        ...init?.headers,
      },
    });
    if (response.status === 401)
      throw new ApiError("session_expired", "Session expirée");
    if (!response.ok) throw new ApiError("unknown", "Erreur API");
    return response.json() as Promise<T>;
  }

  recordConsent(input: ConsentInput) {
    return this.request<ConsentResponse>("/me/consents", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(input),
    });
  }

  putSportProfile(input: SportProfileInput) {
    return this.request<ProfileResponse>("/me/profile", {
      method: "PUT",
      headers: { "If-Match": "*" },
      body: JSON.stringify(input),
    });
  }

  async getInitialSafetyQuestionnaire(): Promise<QuestionnaireResponse> {
    const list = await this.request<QuestionnaireList>(
      "/questionnaires?purpose=initial_safety",
    );
    const first = list.items[0];
    if (!first)
      throw new ApiError(
        "questionnaire_unavailable",
        "Questionnaire indisponible",
      );
    return this.request<QuestionnaireResponse>(
      `/questionnaires/${first.version_id}`,
    );
  }

  async submitInitialSafetyQuestionnaire(
    versionId: string,
    input: QuestionnaireSubmissionInput,
  ) {
    return this.request<SubmissionResponse>(
      `/questionnaires/${versionId}/submissions`,
      {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(input),
      },
    );
  }
}
