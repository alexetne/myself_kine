"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  type OrientationKind,
  type QuestionnaireVersion,
  type SportProfileInput,
} from "@/api/types";
import {
  MockQualificationApi,
  mockConsentDefinitionId,
} from "@/api/mock-adapter";
import {
  Button,
  Card,
  ChoiceGroup,
  ClinicalProvisional,
  Field,
  MobileNavigation,
  Progress,
} from "@/components/ui";
import { OrientationScreen } from "./orientation-screen";
import { StatusScreen, type StatusKind } from "./status-screen";

type Goal = "prevention" | "return_after_break" | "strength";
type Practice = "road" | "trail";
type Level = "beginner" | "regular" | "experienced";
type Step =
  | "promise"
  | "limits"
  | "goal"
  | "prequal"
  | "auth"
  | "consents"
  | "profile"
  | "questionnaire"
  | "orientation";

const steps: Step[] = [
  "promise",
  "limits",
  "goal",
  "prequal",
  "auth",
  "consents",
  "profile",
  "questionnaire",
  "orientation",
];
const forcedStates = [
  "loading",
  "error",
  "offline",
  "session_expired",
  "consent_missing",
  "questionnaire_unavailable",
] as const;

export function QualificationJourney({
  scenarioOverride,
  initialState,
}: {
  scenarioOverride?: OrientationKind;
  initialState?: string;
}) {
  const forcedError =
    forcedStates.includes(initialState as (typeof forcedStates)[number]) &&
    initialState !== "loading" &&
    initialState !== "error"
      ? (initialState as ApiError["code"])
      : undefined;
  const api = useMemo(
    () =>
      new MockQualificationApi(
        scenarioOverride ??
          (process.env.NEXT_PUBLIC_MOCK_SCENARIO as OrientationKind) ??
          "possible",
        forcedError,
      ),
    [scenarioOverride, forcedError],
  );
  const [step, setStep] = useState<Step>("promise");
  const [goal, setGoal] = useState<Goal>();
  const [practice, setPractice] = useState<Practice>();
  const [level, setLevel] = useState<Level>();
  const [adult, setAdult] = useState<boolean>();
  const [autonomous, setAutonomous] = useState<boolean>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [birthYear, setBirthYear] = useState(1990);
  const [frequency, setFrequency] = useState("2");
  const [equipment, setEquipment] = useState("none");
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireVersion>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [orientation, setOrientation] = useState<OrientationKind>();
  const [status, setStatus] = useState<StatusKind | null>(
    initialState === "loading"
      ? "loading"
      : initialState === "error"
        ? "error"
        : null,
  );
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const current = steps.indexOf(step) + 1;
  const go = (next: Step) => {
    setStatus(null);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleError = (error: unknown) =>
    setStatus(
      error instanceof ApiError && error.code !== "unknown"
        ? error.code
        : "error",
    );

  async function submitAuth() {
    setStatus("loading");
    try {
      await api.authenticate({ mode: "create", email, password });
      go("consents");
    } catch (error) {
      handleError(error);
    }
  }

  async function submitConsent() {
    if (!consent) {
      setStatus("consent_missing");
      return;
    }
    setStatus("loading");
    try {
      await api.recordConsent({
        definition_version_id: mockConsentDefinitionId,
        decision: "granted",
      });
      go("profile");
    } catch (error) {
      handleError(error);
    }
  }

  async function submitProfile() {
    if (!goal || !practice || !level) return;
    const profile: SportProfileInput = {
      birth_year: birthYear,
      practices: [practice],
      level,
      goal,
      weekly_availability: { sessions: Number(frequency) },
      equipment: [equipment],
    };
    setStatus("loading");
    try {
      await api.putSportProfile(profile);
      const loaded = await api.getInitialSafetyQuestionnaire();
      setQuestionnaire(loaded);
      go("questionnaire");
    } catch (error) {
      handleError(error);
    }
  }

  async function answerQuestion(value: string) {
    if (!questionnaire) return;
    const question = questionnaire.questions[questionIndex];
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    if (questionIndex < questionnaire.questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    setStatus("loading");
    try {
      const submission = await api.submitInitialSafetyQuestionnaire(
        questionnaire.version_id,
        {
          answers: questionnaire.questions.map((item) => ({
            question_id: item.id,
            value: nextAnswers[item.id],
          })),
        },
      );
      const action = submission.evaluation.action;
      if (!["possible", "monitor", "consult", "urgent"].includes(action))
        throw new ApiError("unknown", "Orientation inconnue");
      setOrientation(action as OrientationKind);
      go("orientation");
    } catch (error) {
      handleError(error);
    }
  }

  if (status)
    return (
      <Shell online={online}>
        <StatusScreen kind={status} onRetry={() => setStatus(null)} />
      </Shell>
    );

  return (
    <Shell online={online}>
      {step !== "promise" ? (
        <Progress
          current={current}
          total={steps.length}
          label="Qualification initiale"
        />
      ) : null}
      {step === "promise" ? (
        <PromiseScreen onContinue={() => go("limits")} />
      ) : null}
      {step === "limits" ? (
        <LimitsScreen
          onBack={() => go("promise")}
          onContinue={() => go("goal")}
        />
      ) : null}
      {step === "goal" ? (
        <GoalScreen
          value={goal}
          onChange={setGoal}
          onBack={() => go("limits")}
          onContinue={() => goal && go("prequal")}
        />
      ) : null}
      {step === "prequal" ? (
        <Prequalification
          adult={adult}
          autonomous={autonomous}
          onAdult={setAdult}
          onAutonomous={setAutonomous}
          onBack={() => go("goal")}
          onContinue={() => adult && autonomous && go("auth")}
        />
      ) : null}
      {step === "auth" ? (
        <AuthScreen
          email={email}
          password={password}
          onEmail={setEmail}
          onPassword={setPassword}
          onBack={() => go("prequal")}
          onSubmit={submitAuth}
        />
      ) : null}
      {step === "consents" ? (
        <ConsentScreen
          checked={consent}
          onChange={setConsent}
          onBack={() => go("auth")}
          onSubmit={submitConsent}
        />
      ) : null}
      {step === "profile" ? (
        <ProfileScreen
          {...{ practice, level, birthYear, frequency, equipment }}
          onPractice={setPractice}
          onLevel={setLevel}
          onBirthYear={setBirthYear}
          onFrequency={setFrequency}
          onEquipment={setEquipment}
          onBack={() => go("consents")}
          onSubmit={submitProfile}
        />
      ) : null}
      {step === "questionnaire" && questionnaire ? (
        <QuestionnaireScreen
          questionnaire={questionnaire}
          index={questionIndex}
          onAnswer={answerQuestion}
          onBack={() =>
            questionIndex > 0
              ? setQuestionIndex((index) => index - 1)
              : go("profile")
          }
        />
      ) : null}
      {step === "orientation" && orientation ? (
        <OrientationScreen kind={orientation} />
      ) : null}
    </Shell>
  );
}

function Shell({
  children,
  online,
}: {
  children: React.ReactNode;
  online: boolean;
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          <span>Terrain</span>
        </div>
        <span className={`online-state ${online ? "" : "offline"}`}>
          {online ? "En ligne" : "Hors connexion"}
        </span>
      </header>
      <main id="main-content" className="journey-main">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}

function PromiseScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Course · Trail · Renforcement</span>
        <h1>Avance à ton rythme, avec des repères clairs.</h1>
        <p className="muted">
          Un programme de préparation physique adapté à ton objectif, à ta
          pratique et à tes retours.
        </p>
      </div>
      <Card>
        <h2>Ta progression reste compréhensible</h2>
        <p>
          Chaque séance et chaque adaptation expliquent les facteurs utilisés.
        </p>
      </Card>
      <div className="actions">
        <Button block onClick={onContinue}>
          Découvrir le fonctionnement
        </Button>
      </div>
    </section>
  );
}

function LimitsScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Avant de commencer</span>
        <h1>Un accompagnement sportif, pas un diagnostic</h1>
        <p className="muted">
          L’application ne remplace pas un médecin ou un kinésithérapeute.
        </p>
      </div>
      <div className="stack">
        <Card className="card-flat">
          <h2>Elle peut</h2>
          <p>
            Organiser une progression, guider des exercices de préparation
            physique et recueillir ton ressenti.
          </p>
        </Card>
        <Card className="card-flat">
          <h2>Elle ne peut pas</h2>
          <p>
            Diagnostiquer, traiter une blessure, garantir une absence de risque
            ou contourner une contre-indication.
          </p>
        </Card>
      </div>
      <ClinicalProvisional>
        Périmètre, exclusions et messages de sécurité du référentiel 0.1.
      </ClinicalProvisional>
      <div className="actions">
        <Button variant="secondary" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onContinue}>J’ai compris</Button>
      </div>
    </section>
  );
}

function GoalScreen({
  value,
  onChange,
  onBack,
  onContinue,
}: {
  value?: Goal;
  onChange: (goal: Goal) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Ton objectif</span>
        <h1>Que veux-tu construire en priorité ?</h1>
      </div>
      <ChoiceGroup
        label="Choisis un objectif"
        value={value}
        onChange={onChange}
        options={[
          {
            value: "prevention",
            label: "Prévenir",
            description: "Préparation générale",
          },
          {
            value: "return_after_break",
            label: "Reprendre",
            description: "Après une interruption",
          },
          {
            value: "strength",
            label: "Renforcer",
            description: "Force et stabilité",
          },
        ]}
      />
      <p className="hint">
        Le MVP ne propose pas de parcours « traiter ma pathologie ».
      </p>
      <div className="actions">
        <Button variant="secondary" onClick={onBack}>
          Retour
        </Button>
        <Button disabled={!value} onClick={onContinue}>
          Continuer
        </Button>
      </div>
    </section>
  );
}

function Prequalification({
  adult,
  autonomous,
  onAdult,
  onAutonomous,
  onBack,
  onContinue,
}: {
  adult?: boolean;
  autonomous?: boolean;
  onAdult: (value: boolean) => void;
  onAutonomous: (value: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Préqualification</span>
        <h1>Vérifions si ce parcours correspond à ta situation</h1>
        <p className="muted">
          Ces réponses ne sont pas enregistrées avant la création du compte.
        </p>
      </div>
      <ChoiceGroup
        label="As-tu 18 ans ou plus ?"
        value={
          adult === undefined ? undefined : (String(adult) as "true" | "false")
        }
        onChange={(value) => onAdult(value === "true")}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
      />
      <ChoiceGroup
        label="Es-tu autonome dans tes déplacements ?"
        value={
          autonomous === undefined
            ? undefined
            : (String(autonomous) as "true" | "false")
        }
        onChange={(value) => onAutonomous(value === "true")}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
      />
      <ClinicalProvisional>
        Public autorisé, exclusions et conséquences exactes des réponses.
      </ClinicalProvisional>
      <div className="actions">
        <Button variant="secondary" onClick={onBack}>
          Retour
        </Button>
        <Button
          disabled={adult !== true || autonomous !== true}
          onClick={onContinue}
        >
          Continuer
        </Button>
      </div>
    </section>
  );
}

function AuthScreen({
  email,
  password,
  onEmail,
  onPassword,
  onBack,
  onSubmit,
}: {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Compte simulé</span>
        <h1>Sauvegarde ton parcours</h1>
      </div>
      <div className="stack">
        <Field
          id="email"
          label="Adresse email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
        />
        <Field
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          hint="8 caractères minimum pour cette simulation."
        />
      </div>
      <div className="actions">
        <Button variant="secondary" onClick={onBack}>
          Retour
        </Button>
        <Button
          disabled={!email.includes("@") || password.length < 8}
          onClick={onSubmit}
        >
          Créer mon compte
        </Button>
      </div>
      <Button
        variant="ghost"
        block
        onClick={onSubmit}
        disabled={!email.includes("@") || password.length < 8}
      >
        Me connecter avec ces identifiants
      </Button>
    </section>
  );
}

function ConsentScreen({
  checked,
  onChange,
  onBack,
  onSubmit,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Tes données</span>
        <h1>Choisis ce que tu acceptes de partager</h1>
        <p className="muted">
          Les réponses de sécurité sont des données sensibles. Elles servent
          uniquement à afficher le parcours et l’orientation renvoyés par le
          service.
        </p>
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          <strong>J’accepte le traitement de mes réponses de sécurité</strong>
          <small className="muted" style={{ display: "block" }}>
            Consentement requis pour poursuivre. Retirable depuis le profil.
          </small>
        </span>
      </label>
      <Card className="card-flat">
        <h2>Ce que nous ne faisons pas</h2>
        <p>
          Aucune publicité ciblée à partir de tes données personnelles ou de
          santé.
        </p>
      </Card>
      <div className="actions">
        <Button variant="secondary" onClick={onBack}>
          Retour
        </Button>
        <Button disabled={!checked} onClick={onSubmit}>
          Enregistrer mon choix
        </Button>
      </div>
    </section>
  );
}

type ProfileProps = {
  practice?: Practice;
  level?: Level;
  birthYear: number;
  frequency: string;
  equipment: string;
  onPractice: (v: Practice) => void;
  onLevel: (v: Level) => void;
  onBirthYear: (v: number) => void;
  onFrequency: (v: string) => void;
  onEquipment: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};
function ProfileScreen(props: ProfileProps) {
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Profil sportif</span>
        <h1>Ta pratique actuelle</h1>
        <p className="muted">
          Ces informations servent à organiser le programme, pas à déterminer
          une aptitude médicale.
        </p>
      </div>
      <ChoiceGroup
        label="Terrain principal"
        value={props.practice}
        onChange={props.onPractice}
        options={[
          { value: "road", label: "Route" },
          { value: "trail", label: "Trail" },
        ]}
      />
      <ChoiceGroup
        label="Niveau de pratique"
        value={props.level}
        onChange={props.onLevel}
        options={[
          { value: "beginner", label: "Débutant" },
          { value: "regular", label: "Régulier" },
          { value: "experienced", label: "Confirmé" },
        ]}
      />
      <div className="field">
        <label htmlFor="birth-year">Année de naissance</label>
        <input
          className="input"
          id="birth-year"
          type="number"
          value={props.birthYear}
          onChange={(event) => props.onBirthYear(Number(event.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="frequency">Séances disponibles par semaine</label>
        <select
          className="select"
          id="frequency"
          value={props.frequency}
          onChange={(event) => props.onFrequency(event.target.value)}
        >
          <option value="1">1 séance</option>
          <option value="2">2 séances</option>
          <option value="3">3 séances</option>
          <option value="4">4 séances</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="equipment">Matériel principal</label>
        <select
          className="select"
          id="equipment"
          value={props.equipment}
          onChange={(event) => props.onEquipment(event.target.value)}
        >
          <option value="none">Sans matériel</option>
          <option value="bands">Élastiques</option>
          <option value="dumbbells">Haltères</option>
        </select>
      </div>
      <div className="actions">
        <Button variant="secondary" onClick={props.onBack}>
          Retour
        </Button>
        <Button
          disabled={!props.practice || !props.level}
          onClick={props.onSubmit}
        >
          Enregistrer et continuer
        </Button>
      </div>
    </section>
  );
}

function QuestionnaireScreen({
  questionnaire,
  index,
  onAnswer,
  onBack,
}: {
  questionnaire: QuestionnaireVersion;
  index: number;
  onAnswer: (answer: string) => void;
  onBack: () => void;
}) {
  const question = questionnaire.questions[index];
  return (
    <section className="screen">
      <div className="screen-copy">
        <span className="eyebrow">Questionnaire de sécurité</span>
        <h1>{question.label}</h1>
        <p className="muted">
          Une question par écran. Tu peux revenir en arrière avant l’envoi.
        </p>
      </div>
      <Progress
        current={index + 1}
        total={questionnaire.questions.length}
        label="Questions de sécurité"
      />
      <ClinicalProvisional>
        {questionnaire.disclaimer} Formulation, réponses et conséquences à
        valider.
      </ClinicalProvisional>
      <div className="stack-sm">
        <Button block onClick={() => onAnswer("no")}>
          Non
        </Button>
        <Button variant="secondary" block onClick={() => onAnswer("yes")}>
          Oui
        </Button>
        <Button variant="ghost" block onClick={() => onAnswer("unknown")}>
          Je ne sais pas
        </Button>
      </div>
      <Button variant="ghost" onClick={onBack}>
        Retour
      </Button>
    </section>
  );
}
