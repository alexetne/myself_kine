# Frontend Terrain

Application Next.js, React et TypeScript du parcours de qualification initiale.

## Démarrage

```bash
cp .env.example .env.local
npm install
npm run openapi:generate
npm run dev
```

Le mode par défaut utilise `MockQualificationApi`. Le scénario d'orientation peut être sélectionné pour les tests manuels avec :

- `/?scenario=possible`
- `/?scenario=monitor`
- `/?scenario=consult`
- `/?scenario=urgent`

Les états techniques peuvent être vérifiés avec `/?state=offline`, `session_expired`, `consent_missing`, `questionnaire_unavailable`, `loading` ou `error`.

## Contrat API

`npm run openapi:generate` génère `src/api/schema.d.ts` depuis `../openapi/first-journey.yaml`.

Les écrans dépendent de `QualificationApi`. `MockQualificationApi` et `HttpQualificationApi` implémentent la même interface et manipulent les types générés. Le résultat d'orientation est lu depuis `QuestionnaireSubmission.evaluation.action` ; aucune règle clinique n'est recalculée dans le navigateur.

L'authentification reste simulée car elle relève du fournisseur OIDC, hors du contrat REST du premier parcours.

## Vérifications

```bash
npm run check
npm run test:e2e:install
npm run test:e2e
```

Les tests Playwright exécutent le parcours mobile pour les quatre orientations et un audit Axe. Les tests Vitest couvrent aussi les quatre résultats et l'accessibilité structurelle de leur composant.
