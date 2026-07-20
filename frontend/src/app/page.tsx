import { QualificationJourney } from "@/features/qualification/qualification-journey";
import type { OrientationKind } from "@/api/types";

const scenarios: OrientationKind[] = [
  "possible",
  "monitor",
  "consult",
  "urgent",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; state?: string }>;
}) {
  const params = await searchParams;
  const scenario = scenarios.includes(params.scenario as OrientationKind)
    ? (params.scenario as OrientationKind)
    : undefined;

  return (
    <QualificationJourney
      scenarioOverride={scenario}
      initialState={params.state}
    />
  );
}
