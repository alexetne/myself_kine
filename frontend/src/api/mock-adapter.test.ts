import { describe, expect, it } from "vitest";
import type { OrientationKind } from "./types";
import { MockQualificationApi } from "./mock-adapter";

describe("MockQualificationApi", () => {
  it.each<OrientationKind>(["possible", "monitor", "consult", "urgent"])(
    "retourne %s uniquement dans RuleResult.action",
    async (scenario) => {
      const api = new MockQualificationApi(scenario);
      const submission = await api.submitInitialSafetyQuestionnaire(
        "00000000-0000-7000-8000-000000000201",
        { answers: [] },
      );
      expect(submission.evaluation.action).toBe(scenario);
      expect(submission.evaluation.status).toBe("simulation");
      expect(submission.questionnaire_version_id).toBe(
        "00000000-0000-7000-8000-000000000201",
      );
    },
  );
});
