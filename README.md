# Myself Kine API

Socle backend du compagnon de renforcement et de reprise de course. Le produit accompagne et oriente ; il ne pose aucun diagnostic médical.

## Prérequis

- Node.js 22
- Docker avec Compose, ou PostgreSQL 17
- un fournisseur OIDC configuré pour les essais authentifiés

## Démarrage local

```bash
cp .env.example .env
docker compose up -d postgres
npm install
set -a; source .env; set +a
npm run db:migrate
npm run start:dev
```

- API : `http://localhost:3000/api/v1`
- OpenAPI : `http://localhost:3000/api/docs`
- disponibilité : `GET /health/ready`

Ne placez aucun secret réel dans `.env.example`, les fixtures ou les logs. Les données de test doivent être synthétiques.

## Vérifications

```bash
npm test
npm run build
npm run openapi:generate
```

## Structure

- `src/identity` : validation OIDC et autorisation.
- `src/profile` : profil sportif propriétaire.
- `src/catalog` : versions publiées du catalogue.
- `src/tracking` : suivi quotidien idempotent.
- `src/adaptation` : règles déterministes explicables.
- `src/infrastructure` : PostgreSQL et futurs adaptateurs externes.
- `migrations` : migrations SQL en expansion/contraction.
- `docs` : décisions, sécurité, données et conventions.

## Migrations

Les migrations sont appliquées dans l'ordre lexical et enregistrées dans `schema_migration`. En production, elles sont exécutées par une tâche dédiée avant le déploiement applicatif. Une migration destructive suit trois livraisons : expansion, bascule du code et contraction après vérification. Aucun retour arrière ne doit supposer qu'une suppression de données est réversible.

## Sauvegarde et restauration

Le PostgreSQL managé devra activer sauvegardes automatiques et restauration à un instant donné. Avant lancement, une restauration doit être réalisée dans un environnement isolé avec chronométrage et contrôles d'intégrité. Les objectifs RPO/RTO et la rétention restent à valider. Le stockage objet doit utiliser versionnement, chiffrement et règles de cycle de vie cohérentes avec les demandes de suppression.

## Limites actuelles

Le fournisseur OIDC, l'hébergeur, les règles cliniques publiables, les durées de conservation et les objectifs RPO/RTO ne sont pas encore arrêtés. Le premier socle n'inclut pas encore l'administration UI, les notifications effectives, les exports finalisés ni l'intégralité de la séance guidée.
