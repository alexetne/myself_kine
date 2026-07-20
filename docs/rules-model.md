# Structure des règles et de leurs résultats

Ce document définit le moteur, pas le référentiel clinique.

## Agrégats

`RuleSet` représente un objectif stable, par exemple sécurité initiale ou adaptation. `RuleSetVersion` est une version immuable contenant des références de règles ordonnées. `RuleVersion` décrit une règle unique.

Une version de règle contient :

- identifiant opaque, code stable et numéro de version ;
- type de règle et périmètre autorisé ;
- priorité entière sans égalité au sein d'un jeu ;
- schéma des entrées acceptées ;
- expression déclarative dans une grammaire fermée ;
- action issue d'une liste autorisée ;
- code de motif stable et gabarit d'explication ;
- statut, auteur, réviseur, validateur et empreinte ;
- dates d'effet, retrait et désactivation urgente.

La grammaire n'autorise ni code arbitraire, ni appel réseau, ni requête SQL. Les champs accessibles sont inscrits dans une liste blanche. Les valeurs et seuils seront fournis exclusivement par le référentiel clinique validé.

## Résultat d'évaluation

```json
{
  "decision_id": "00000000-0000-7000-8000-000000000901",
  "status": "matched",
  "rule_set_version_id": "00000000-0000-7000-8000-000000000801",
  "matched_rule_version_ids": ["00000000-0000-7000-8000-000000000802"],
  "action": "configured_action",
  "reason_code": "SYNTHETIC_REASON",
  "explanation": "Explication fictive issue du gabarit versionné.",
  "input_references": [
    { "type": "submission", "id": "00000000-0000-7000-8000-000000000701" }
  ],
  "evaluated_at": "2030-01-01T10:00:00Z"
}
```

Valeurs de `status` :

- `matched` : une règle publiée a produit une action ;
- `no_match` : le jeu publié a été évalué sans correspondance ;
- `not_evaluated` : aucun jeu compatible publié ;
- `blocked` : entrée invalide, version retirée ou incohérence de configuration ;
- `simulation` : résultat non applicable produit dans l'administration.

## Publication

1. Création en brouillon.
2. Validation syntaxique et détection des règles inatteignables ou priorités dupliquées.
3. Tests synthétiques attachés à la version.
4. Revue clinique distincte de l'auteur.
5. Approbation et signature logique de l'empreinte.
6. Publication atomique du jeu complet.
7. Audit sans recopier les données de santé.

Une désactivation urgente empêche les nouvelles évaluations, crée un événement d'audit et fait revenir le moteur à `not_evaluated`. Elle ne supprime aucune décision passée.

## Explicabilité et rejeu

La décision conserve les références exactes des entrées, du jeu et des règles, ainsi que l'action et le motif rendus. Le rejeu est une opération de simulation : il crée un nouveau résultat lié à la décision d'origine et ne modifie jamais l'historique.
