import { Button, Card } from "@/components/ui";

export type StatusKind =
  | "loading"
  | "error"
  | "offline"
  | "session_expired"
  | "consent_missing"
  | "questionnaire_unavailable";

const content: Record<
  Exclude<StatusKind, "loading">,
  { title: string; message: string; action: string }
> = {
  error: {
    title: "Une erreur est survenue",
    message: "Tes informations n’ont pas été perdues. Tu peux réessayer.",
    action: "Réessayer",
  },
  offline: {
    title: "Connexion indisponible",
    message:
      "Aucune nouvelle orientation ne peut être calculée hors connexion. Les informations de sécurité restent accessibles.",
    action: "Réessayer la connexion",
  },
  session_expired: {
    title: "Ta session a expiré",
    message:
      "Reconnecte-toi avant de poursuivre. Tes réponses locales sont conservées sur cet appareil.",
    action: "Se reconnecter",
  },
  consent_missing: {
    title: "Consentement nécessaire",
    message:
      "Le questionnaire utilise des données sensibles. Ton accord est nécessaire pour poursuivre, mais tu peux quitter sans les enregistrer.",
    action: "Revoir les consentements",
  },
  questionnaire_unavailable: {
    title: "Questionnaire indisponible",
    message:
      "Nous ne pouvons pas fournir d’orientation sans la version publiée du questionnaire.",
    action: "Réessayer plus tard",
  },
};

export function StatusScreen({
  kind,
  onRetry,
}: {
  kind: StatusKind;
  onRetry?: () => void;
}) {
  if (kind === "loading") {
    return (
      <section className="screen" aria-busy="true" aria-live="polite">
        <span className="eyebrow">Chargement</span>
        <div className="skeleton" style={{ height: 44 }} />
        <div className="skeleton" style={{ height: 120 }} />
        <span className="sr-only">Chargement en cours</span>
      </section>
    );
  }
  const item = content[kind];
  return (
    <section className="screen" role="alert">
      <div className="screen-copy">
        <span className="eyebrow">Parcours interrompu</span>
        <h1>{item.title}</h1>
        <p className="muted">{item.message}</p>
      </div>
      <Card className="card-flat">
        <h2>Sortie sûre</h2>
        <p>
          Tu peux toujours consulter les limites de l’application et interrompre
          ce parcours.
        </p>
      </Card>
      <div className="actions">
        <Button block onClick={onRetry}>
          {item.action}
        </Button>
      </div>
    </section>
  );
}
