import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { OrientationKind } from "@/api/types";
import { OrientationScreen } from "./orientation-screen";

const cases: Array<[OrientationKind, string]> = [
  ["possible", "Accompagnement possible"],
  ["monitor", "Adaptation ou surveillance"],
  ["consult", "Consultation recommandée"],
  ["urgent", "Arrêt et orientation urgente"],
];

describe("OrientationScreen", () => {
  it.each(cases)(
    "affiche le résultat %s renvoyé par l’API",
    async (kind, title) => {
      const { container } = render(<OrientationScreen kind={kind} />);
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(
        screen.getByText("Contenu clinique provisoire"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Aucun calcul clinique/)).toBeInTheDocument();
      const results = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    },
  );

  it("ne présente qu’une action sur l’écran urgent", () => {
    render(<OrientationScreen kind="urgent" />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
