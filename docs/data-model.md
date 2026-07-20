# Modèle de données du premier parcours

Statut : modèle logique proposé. Les tables du référentiel clinique ne doivent recevoir aucune valeur réelle avant validation.

## Conventions

- UUID non séquentiels exposés publiquement ; clés techniques internes non exposées si nécessaires.
- `timestamptz` pour les instants, date locale et fuseau IANA conservés lorsque le jour utilisateur compte.
- `created_at` partout ; `updated_at` uniquement sur les brouillons et projections modifiables.
- Versions publiées immuables ; archivage ou retrait plutôt que suppression.
- Pas de `ON DELETE CASCADE` sur les données métier, décisions, validations ou audits.
- Données dérivées toujours reliées aux entrées et versions qui les expliquent.

## Identité, profil et consentements

| Entité                       | Relations et contraintes                      | Sensibilité           | Suppression/rétention                   | Index                             |
| ---------------------------- | --------------------------------------------- | --------------------- | --------------------------------------- | --------------------------------- |
| `app_user`                   | racine applicative, statut contrôlé           | personnelle indirecte | pseudonymisation/suppression coordonnée | statut, date de suppression       |
| `external_identity`          | unique `(issuer, subject)`, N:1 utilisateur   | identité              | suppression coordonnée IdP              | unique issuer/sub                 |
| `sport_profile`              | 1:1 utilisateur, version optimiste            | sportive              | supprimable                             | PK user                           |
| `consent_definition`         | code stable                                   | non sensible          | jamais réécrit                          | unique code                       |
| `consent_definition_version` | N:1 définition, pays/langue/version/empreinte | juridique             | conservation des textes présentés       | unique définition/version         |
| `consent_record`             | N:1 utilisateur et version, append-only       | personnelle           | politique juridique à valider           | utilisateur/date, définition/date |
| `consent_withdrawal`         | 1:1 accord retiré                             | personnelle           | même politique que le consentement      | record/date                       |

## Questionnaires et sécurité

| Entité                      | Relations et contraintes                                       | Sensibilité    | Suppression/rétention                  | Index                          |
| --------------------------- | -------------------------------------------------------------- | -------------- | -------------------------------------- | ------------------------------ |
| `questionnaire`             | code logique stable                                            | non sensible   | conservé                               | unique code                    |
| `questionnaire_version`     | N:1 questionnaire, version et empreinte uniques, état contrôlé | clinique       | version publiée archivée               | code/version, statut/période   |
| `question_version`          | N:1 version, ordre unique, schéma fermé                        | clinique       | immuable avec sa version               | questionnaire/position         |
| `question_option_version`   | N:1 question, code unique                                      | clinique       | immuable                               | question/code                  |
| `display_condition_version` | références limitées à la même version                          | clinique       | immuable                               | question cible                 |
| `questionnaire_submission`  | N:1 utilisateur et version exacte, idempotence                 | santé déclarée | durée à valider                        | utilisateur/date, version/date |
| `questionnaire_answer`      | N:1 soumission, une réponse par question                       | santé déclarée | supprimable selon politique            | soumission/question            |
| `safety_decision`           | N:1 soumission et jeu de règles exact                          | très sensible  | historique explicable, durée à valider | utilisateur/date, soumission   |

Les réponses peuvent être stockées en JSON validé pour le premier incrément, mais la version du schéma et les identifiants de questions restent obligatoires. La normalisation est préférable si des requêtes transverses sont autorisées ultérieurement.

## Référentiel de règles

| Entité                | Relations et contraintes                             | Sensibilité       | Suppression/rétention      | Index                       |
| --------------------- | ---------------------------------------------------- | ----------------- | -------------------------- | --------------------------- |
| `rule_set`            | code et type stables                                 | clinique          | conservé                   | unique code                 |
| `rule_set_version`    | N:1 jeu, version/empreinte uniques                   | clinique sensible | publiée immuable           | jeu/version, statut/période |
| `rule_version`        | version d'expression et d'action                     | clinique sensible | immuable                   | code/version                |
| `rule_set_member`     | lie règles et jeu, priorité unique                   | clinique          | immuable                   | jeu/priorité                |
| `rule_test_case`      | données exclusivement synthétiques, résultat attendu | non personnelle   | conservé avec la version   | jeu/version                 |
| `clinical_validation` | auteur, réviseur, validateur et empreinte            | professionnelle   | audit long terme à définir | ressource/date              |
| `rule_evaluation`     | références d'entrée, résultat et versions            | très sensible     | durée santé à valider      | utilisateur/date, version   |

Une expression n'accède qu'à des champs inscrits dans un catalogue. Les valeurs du référentiel sont des données administrées, jamais des constantes du code.

## Bilans, contenus et programmes

| Entité                          | Relations et contraintes                          | Sensibilité              | Suppression/rétention        | Index                   |
| ------------------------------- | ------------------------------------------------- | ------------------------ | ---------------------------- | ----------------------- |
| `assessment_definition_version` | définition publiée immuable                       | clinique                 | archivage                    | code/version            |
| `assessment_run`                | utilisateur + version exacte                      | santé/sportive           | durée à valider              | utilisateur/date        |
| `assessment_result`             | résultat déclaré/mesuré + origine                 | santé/sportive           | avec le bilan                | run/type                |
| `exercise`                      | identité stable                                   | non sensible             | conservé                     | slug unique             |
| `exercise_version`              | version publiée validée                           | clinique                 | archivage/retrait            | exercice/version/statut |
| `exercise_media`                | version + objet privé + empreinte                 | potentiellement sensible | cycle de vie objet coordonné | version/type            |
| `program`                       | N:1 utilisateur, un courant maximum               | sportive/santé dérivée   | durée à valider              | utilisateur/statut      |
| `program_version`               | origine, raison et décision source                | santé dérivée            | immuable                     | programme/version       |
| `program_week`                  | N:1 version                                       | sportive                 | avec programme               | version/position        |
| `planned_session`               | propriétaire, jour local, prescription versionnée | sportive/santé dérivée   | historique                   | utilisateur/date        |
| `planned_session_item`          | référence une version exacte d'exercice           | sportive                 | historique                   | séance/position         |

## Exécution, suivi et adaptation

| Entité                | Relations et contraintes                              | Sensibilité    | Suppression/rétention | Index                    |
| --------------------- | ----------------------------------------------------- | -------------- | --------------------- | ------------------------ |
| `session_run`         | propriétaire + séance ; unicité métier ; état/version | santé/sportive | durée à valider       | utilisateur/date, séance |
| `session_event`       | unique `(run, client_event_id)`                       | santé/sportive | avec la séance        | run/ordre                |
| `discomfort_report`   | run/item, intensité déclarée, motif d'arrêt           | santé déclarée | durée santé           | utilisateur/date         |
| `session_summary`     | 1:1 run terminé                                       | santé/sportive | avec la séance        | run                      |
| `daily_checkin`       | unique utilisateur/jour local                         | santé déclarée | durée santé           | utilisateur/date         |
| `follow_up`           | référence run, délai et fuseau                        | santé déclarée | durée santé           | run/date                 |
| `adaptation_decision` | règle, entrées, ancien/nouveau, motif                 | santé dérivée  | immuable              | utilisateur/date, séance |

## Exploitation et confidentialité

| Entité                     | Contraintes                                      | Données autorisées                                 | Rétention                            |
| -------------------------- | ------------------------------------------------ | -------------------------------------------------- | ------------------------------------ |
| `idempotency_record`       | unique utilisateur/opération/clé ; hash du corps | réponse minimale                                   | courte, durée technique              |
| `outbox_message`           | état, tentatives, disponibilité                  | identifiants opaques, aucune réponse médicale      | jusqu'au succès + diagnostic limité  |
| `audit_event`              | append-only et privilèges dédiés                 | acteur, action, type/id ressource, résultat, motif | politique d'audit à valider          |
| `data_export_request`      | propriétaire, état, objet privé expirant         | aucune URL durable                                 | courte après récupération            |
| `account_deletion_request` | propriétaire, délai et état                      | métadonnées minimales                              | preuve pseudonymisée selon politique |

## Matrice de sensibilité

| Classe                     | Exemples                            | Logs                           | Accès                          |
| -------------------------- | ----------------------------------- | ------------------------------ | ------------------------------ |
| S0 public                  | exercice publié                     | possible, sans corps complet   | utilisateurs authentifiés      |
| S1 interne                 | configuration technique non secrète | métadonnées                    | équipe autorisée               |
| S2 personnelle/sportive    | profil et programme                 | identifiants opaques seulement | propriétaire et tâche ciblée   |
| S3 santé déclarée/dérivée  | réponses, gêne, décisions           | jamais le contenu              | propriétaire et moteur mandaté |
| S4 secret/authentification | jetons, clés, URL d'export          | jamais                         | composants minimaux            |

## Évolution du schéma

Les migrations utilisent expansion/contraction : ajout nullable ou nouvelle table, double lecture/écriture si nécessaire, reprise idempotente, bascule, puis suppression lors d'une livraison ultérieure. Une migration ne réécrit jamais une version clinique publiée.
