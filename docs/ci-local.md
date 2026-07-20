# Exécuter localement les contrôles CI

## Prérequis

- Node.js 22 et npm 10 ;
- Docker Compose pour PostgreSQL local ;
- aucune donnée réelle ni aucun secret de production.

Installez exactement les dépendances verrouillées :

```bash
npm ci --ignore-scripts --no-audit --no-fund
```

Exécutez ensuite tous les contrôles équivalents à la CI :

```bash
make ci
```

Cette commande vérifie successivement la politique du dépôt, le formatage, ESLint, les types TypeScript, les tests, le build NestJS et les vulnérabilités npm de gravité haute ou critique. Les étapes peuvent aussi être lancées séparément avec `make format`, `make lint`, `make typecheck`, `make test`, `make build` et `make security`.

Pour produire le même paquet immuable que GitHub Actions :

```bash
make artifact
shasum -a 256 artifacts/*
```

Le paquet est généré depuis `package-lock.json` et ne contient que `dist/` et `migrations/`. La CI construit cet artefact une seule fois puis vérifie son empreinte dans les environnements GitHub `development` et `staging`. Aucun déploiement cloud n'est configuré.

## Environnement de développement

```bash
cp .env.example .env
make dev
set -a; source .env; set +a
npm run db:migrate
npm run start:dev
```

Arrêt :

```bash
make dev-down
```

`.env` est ignoré par Git. Les secrets partagés doivent être conservés dans un gestionnaire de secrets et exposés uniquement au job ou à l'environnement qui en a besoin. Les workflows de pull request ne reçoivent aucun secret d'environnement.
