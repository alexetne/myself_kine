# Paramètres GitHub à appliquer

## Ruleset de `main`

Après fusion des fichiers CI sur la branche principale, appliquer la configuration avec un compte administrateur :

```bash
./scripts/github/configure-repository.sh
```

Le script est idempotent et configure les règles suivantes :

> Sur un dépôt privé GitHub Free, GitHub refuse actuellement la protection de branche. Il faut passer le dépôt à GitHub Pro/Team ou le rendre public. Ne rendez pas ce dépôt de santé public uniquement pour contourner cette limite. Les environnements vides restent créables sans règle de protection payante.

- interdire les push directs et suppressions ;
- pull request obligatoire avec au moins une approbation ;
- approbation des propriétaires de code obligatoire ;
- invalider les approbations après nouveau commit ;
- résoudre toutes les conversations ;
- imposer une branche à jour ;
- contrôles requis : `repository-policy`, `secrets`, `quality`, `dependencies`, `dependency-review` et `reproducible-build` ;
- appliquer les règles aux administrateurs et interdire le force-push.

## Environnements

Créer `development` et `staging` sans secret cloud. Les jobs associés vérifient seulement l'artefact produit sur `main`. Les secrets futurs sont ajoutés au niveau de l'environnement, jamais au dépôt, avec des noms distincts et une identité OIDC temporaire. Aucun environnement `production` ni workflow de production n'est créé à ce stade.

## Variables et secrets

Les valeurs non sensibles peuvent être des variables GitHub d'environnement. Les secrets sont limités au job de déploiement concerné, masqués, rotatifs et absents des pull requests. Ne jamais placer un secret dans `.env.example`, une sortie de test, un artefact ou un commentaire de pull request.
