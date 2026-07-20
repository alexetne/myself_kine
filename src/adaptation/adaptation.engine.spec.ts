import { AdaptationEngine } from "./adaptation.engine";

describe("AdaptationEngine", () => {
  const engine = new AdaptationEngine();

  it("prioritizes an urgent declared signal", () => {
    expect(
      engine.evaluate({ fatigue: 1, sleepQuality: 10, urgentSignal: true }),
    ).toMatchObject({
      action: "professional_review",
      reasonCode: "DECLARED_URGENT_SIGNAL",
    });
  });
  it("adds rest for high discomfort without diagnosing", () => {
    const result = engine.evaluate({
      fatigue: 2,
      sleepQuality: 8,
      discomfort: 8,
    });
    expect(result.action).toBe("add_rest");
    expect(result.explanation).toContain("sans interprétation diagnostique");
  });
  it("reduces volume when recovery is limited", () => {
    expect(engine.evaluate({ fatigue: 8, sleepQuality: 7 }).action).toBe(
      "reduce_volume",
    );
    expect(engine.evaluate({ fatigue: 2, sleepQuality: 2 }).action).toBe(
      "reduce_volume",
    );
  });
  it("maintains only when no higher priority rule applies", () => {
    expect(
      engine.evaluate({ fatigue: 4, sleepQuality: 6, discomfort: 2 }).action,
    ).toBe("maintain");
  });
});
