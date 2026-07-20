# Versionnement des questionnaires

## Cycle de vie

`draft → in_review → validated → published → retired`

- Une version `draft` est modifiable mais inutilisable par un sportif.
- La soumission en révision fige son contenu par empreinte SHA-256 canonique.
- La validation conserve l'identité professionnelle interne du validateur, la date et l'empreinte.
- La publication rend la version immuable et lui attribue une période d'effet.
- Le retrait empêche de nouvelles soumissions sans modifier l'historique.

Une correction, même typographique si elle peut influencer la compréhension, crée une nouvelle version. Une version publiée n'est jamais mise à jour sur place.

## Structure d'une version

- `questionnaire_id`, `version_id`, numéro lisible et identifiant opaque ;
- langue et pays d'application ;
- titre, introduction et rappel de non-diagnostic ;
- questions avec identifiants stables dans la version ;
- type, contraintes de forme et options ;
- conditions d'affichage déclaratives ;
- référence éventuelle au jeu de règles compatible ;
- statut, empreinte, auteur, réviseur, validateur et dates.

La soumission conserve `questionnaire_version_id`, les réponses brutes validées selon le schéma de cette version, l'instant serveur et le fuseau utile. L'interprétation est stockée séparément dans `safety_decision`.

## Compatibilité

- Une version est servie avec un `ETag` correspondant à son empreinte.
- La soumission exige le `version_id`; un identifiant logique seul est refusé.
- Une application mobile ancienne peut soumettre une version encore dans sa fenêtre d'acceptation.
- Après retrait urgent, une réponse `409 QUESTIONNAIRE_VERSION_RETIRED` oblige le client à récupérer la version active.
- Une réinterprétation historique, si autorisée ultérieurement, produit une nouvelle décision et ne remplace jamais la décision initiale.

## Exemple fictif non clinique

```json
{
  "code": "synthetic-safety-demo",
  "version": 1,
  "status": "draft",
  "questions": [
    {
      "id": "synthetic-q-001",
      "type": "single_choice",
      "label": "Question fictive réservée aux tests de contrat",
      "options": ["synthetic-a", "synthetic-b"]
    }
  ]
}
```

Cet exemple ne peut pas être publié et ne porte aucune signification clinique.
