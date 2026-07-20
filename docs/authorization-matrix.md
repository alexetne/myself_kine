# Matrice des autorisations

Rôles : `user`, `content_author`, `content_reviewer`, `admin`, `system_worker`. Le rôle professionnel est hors MVP.

`Own` signifie que `user_id` est dérivé du jeton et correspond à la ressource. L'administration ne confère aucun accès implicite aux données de santé.

| Ressource/action                               |                     User |              Author |                      Reviewer |                       Admin |                                  Worker |
| ---------------------------------------------- | -----------------------: | ------------------: | ----------------------------: | --------------------------: | --------------------------------------: |
| Lire/modifier son profil                       |                      Own |                 Own |                           Own |               Own seulement |                                     non |
| Lire/enregistrer ses consentements             |                      Own |                 Own |                           Own |               Own seulement |       conséquences techniques minimales |
| Lire un questionnaire publié                   |                      oui |                 oui |                           oui |                         oui |                                     non |
| Soumettre/récupérer ses réponses               |                      Own |                 Own |                           Own |                         non |                        traitement ciblé |
| Créer/modifier un questionnaire brouillon      |                      non |                 oui |                       lecture |         gestion du workflow |                                     non |
| Valider/publier un questionnaire               |                      non |                 non | oui, si différent de l'auteur |       désactivation urgente |                                     non |
| Lire un exercice publié                        |                      oui |                 oui |                           oui |                         oui |                                     non |
| Rédiger un exercice                            |                      non |                 oui |                       lecture |         gestion du workflow |                                     non |
| Valider/publier un exercice                    |                      non |                 non | oui, si différent de l'auteur |       désactivation urgente |                                     non |
| Lire son programme et ses décisions            |                      Own |                 Own |                           Own |                         non |                            tâche ciblée |
| Démarrer/compléter sa séance                   |                      Own |                 Own |                           Own |                         non |                                     non |
| Envoyer un événement de séance                 |                      Own |                 Own |                           Own |                         non |                                     non |
| Lire les données d'un autre sportif            |                      non |                 non |                           non |                         non | uniquement tâche explicitement mandatée |
| Modifier les données personnelles d'un sportif |                      non |                 non |                           non |                         non |                                     non |
| Simuler une règle sur données synthétiques     |                      non |                 non |                           oui |                         oui |                                     non |
| Publier un jeu de règles                       |                      non |                 non | oui avec validation distincte |       désactivation urgente |                                     non |
| Demander son export/suppression                | Own + réauthentification |                 Own |                           Own |               Own seulement |                        exécution ciblée |
| Consulter l'audit clinique                     |                      non | ses propres actions |           oui selon périmètre | métadonnées selon périmètre |                          écriture seule |

## Contrôles obligatoires

- Authentification, rôle, propriété, état de ressource et consentement sont vérifiés séparément.
- Toute route propriétaire est testée avec deux utilisateurs synthétiques.
- Un réviseur ne valide pas sa propre version.
- Un administrateur peut désactiver un contenu, pas réécrire la version publiée.
- Les accès du worker portent un type de tâche et un identifiant de ressource ; ils ne disposent pas d'une lecture générale.
