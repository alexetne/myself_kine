import { AdaptationEngine } from "./adaptation.engine";

describe("AdaptationEngine safe default", () => {
  const engine = new AdaptationEngine();

  it("does not make a clinical decision without a published reference", () => {
    expect(engine.evaluate({ checkinId: "synthetic-checkin" })).toEqual({
      status: "not_evaluated",
      action: "none",
      reasonCode: "CLINICAL_REFERENCE_NOT_PUBLISHED",
      explanation:
        "Aucune adaptation automatique n’est appliquée tant que le référentiel clinique validé n’est pas publié.",
      ruleVersionId: null,
    });
  });
});
