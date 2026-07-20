# Modèle de menace initial

## Actifs

Identités, déclarations de santé, réponses aux questionnaires, programmes, événements de séance, exports, règles cliniques et journal d'audit.

## Frontières de confiance

Client non fiable → API ; fournisseur OIDC → API ; API → PostgreSQL ; worker → fournisseurs externes ; API/worker → stockage objet.

## Menaces et contrôles

| Menace                             | Contrôle MVP                                                                    | Vérification                          |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| IDOR/BOLA                          | propriétaire dérivé du jeton, requêtes filtrées par `user_id`                   | tests avec deux utilisateurs          |
| Jeton falsifié ou rejoué           | validation issuer/audience/signature/expiration, sessions révocables chez l'IdP | tests auth et procédure de révocation |
| Double soumission                  | `Idempotency-Key`, hash de requête, contrainte unique et transaction            | tests répétition/conflit              |
| Écrasement concurrent              | colonne `version`, `If-Match`, mise à jour conditionnelle                       | test de concurrence                   |
| Injection SQL                      | paramètres `pg`, aucun identifiant SQL issu du client                           | revue et tests                        |
| Fuite par logs/erreurs             | journalisation structurée avec liste blanche, filtre d'erreur commun            | tests de contrat                      |
| Publication clinique non autorisée | rôle + workflow de validation + audit                                           | tests d'autorisation                  |
| Export volé                        | réauthentification, objet privé, URL courte durée, audit                        | test E2E futur                        |
| Suppression incomplète             | workflow coordonné IdP/base/objets/sauvegardes                                  | exercice opérationnel                 |
| Dépendance compromise              | lockfile, audit CI, analyse de secrets                                          | pipeline CI                           |

## Limites

La qualification réglementaire française, l'analyse d'impact, les durées de conservation et les règles cliniques doivent être validées par les responsables compétents avant ouverture publique.
