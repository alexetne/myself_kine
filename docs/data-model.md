# Modèle de données MVP

Les identifiants exposés sont des UUID. Les instants sont stockés en `timestamptz`; les dates quotidiennes conservent aussi le fuseau IANA. Les données dérivées référencent toujours la version exacte de leur règle ou contenu.

| Domaine | Tables principales | Suppression et conservation |
|---|---|---|
| Identité | `app_user`, `external_identity` | suppression coordonnée avec l'IdP ; identifiant d'audit pseudonymisé selon politique |
| Profil | `sport_profile`, `consent_record` | effacement à la clôture hors obligation validée |
| Sécurité | `questionnaire_version`, `questionnaire_submission`, `safety_decision` | versions archivées ; soumissions effacées selon politique santé |
| Contenu | `exercise`, `exercise_version` | archivage, jamais de réécriture d'une version publiée |
| Programme | `program`, `program_version`, `planned_session` | historique nécessaire à l'explication, durée à valider |
| Exécution | `session_run`, `session_event`, `daily_checkin`, `follow_up` | données santé/sportives exportables et supprimables |
| Adaptation | `rule_version`, `adaptation_decision` | entrées minimisées et version de règle conservée |
| Exploitation | `idempotency_record`, `outbox_message`, `audit_event` | rétentions techniques distinctes |

Les index couvrent les recherches par propriétaire et date, les programmes courants, les événements ordonnés, les tâches prêtes et les clés d'idempotence. Les clés étrangères n'utilisent pas de cascade dangereuse.
