import type { OrientationKind } from "@/api/types";
import { Button, Card, ClinicalProvisional } from "@/components/ui";

const orientationContent: Record<
  OrientationKind,
  {
    icon: string;
    title: string;
    message: string;
    action: string;
    explanation: string;
  }
> = {
  possible: {
    icon: "✓",
    title: "Accompagnement possible",
    message:
      "Tes réponses permettent de poursuivre ce parcours de préparation physique.",
    action: "Terminer la qualification",
    explanation:
      "Ce résultat ne confirme pas une aptitude médicale et ne garantit pas l’absence de risque.",
  },
  monitor: {
    icon: "!",
    title: "Adaptation ou surveillance",
    message:
      "Le parcours peut nécessiter une adaptation ou une surveillance avant de poursuivre.",
    action: "Voir les précautions",
    explanation:
      "Le niveau et la formulation proviennent du référentiel clinique provisoire 0.1.",
  },
  consult: {
    icon: "i",
    title: "Consultation recommandée",
    message:
      "Tes réponses suggèrent de demander l’avis d’un professionnel avant de poursuivre ce parcours.",
    action: "Voir l’orientation",
    explanation:
      "L’application ne peut pas déterminer la cause de ce que tu ressens.",
  },
  urgent: {
    icon: "×",
    title: "Arrêt et orientation urgente",
    message:
      "Interromps l’activité et consulte les consignes d’orientation affichées.",
    action: "Afficher les consignes",
    explanation:
      "Destination et message définitifs à valider cliniquement et juridiquement.",
  },
};

export function OrientationScreen({ kind }: { kind: OrientationKind }) {
  const content = orientationContent[kind];
  return (
    <section className="screen" aria-labelledby="orientation-title">
      <span className="eyebrow">Résultat du questionnaire</span>
      <Card className={`orientation orientation-${kind}`}>
        <div className="orientation-heading">
          <span className="orientation-icon" aria-hidden="true">
            {content.icon}
          </span>
          <h1 id="orientation-title">{content.title}</h1>
        </div>
        <p>{content.message}</p>
      </Card>
      <ClinicalProvisional>
        Critères, niveau, formulation et destination issus du référentiel 0.1
        non validé.
      </ClinicalProvisional>
      <Card className="card-flat">
        <h2>Pourquoi ce résultat ?</h2>
        <p>{content.explanation}</p>
        <p className="hint">
          Le niveau a été fourni par l’API simulée. Aucun calcul clinique n’a
          été réalisé dans ton navigateur.
        </p>
      </Card>
      <div className="actions critical-actions">
        <Button variant={kind === "urgent" ? "danger" : "primary"} block>
          {content.action}
        </Button>
      </div>
    </section>
  );
}
