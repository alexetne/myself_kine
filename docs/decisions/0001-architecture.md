# ADR 0001 — Architecture du MVP

Statut : accepté le 20 juillet 2026.

## Décision

Le backend est un monolithe modulaire TypeScript/NestJS exposant une API REST documentée avec OpenAPI. PostgreSQL managé est la source de vérité. Les accès sont réalisés par SQL paramétré et migrations SQL versionnées. Une file est réservée aux notifications et traitements différés. Les médias sont placés dans un stockage objet privé.

L'identité est déléguée à un fournisseur OIDC/OAuth 2.1 compatible avec les exigences européennes. Le backend valide les jetons via JWKS et conserve seulement le lien entre le `sub` externe et l'utilisateur applicatif.

## Conséquences

- Les modules métier ne dépendent ni de HTTP ni du fournisseur d'identité.
- Les versions cliniques publiées sont immuables.
- Les règles d'adaptation sont déterministes, versionnées et auditables.
- Aucun cache, microservice, réseau social, paiement ou intégration sportive dans le MVP.
- L'administration clinique minimale ne peut pas modifier les données personnelles d'un utilisateur.
