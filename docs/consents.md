# Gestion des consentements

Les consentements ne sont pas des préférences ordinaires et ne sont jamais écrasés.

## Modèle

- `ConsentDefinition` : code stable et finalité.
- `ConsentDefinitionVersion` : texte présenté, langue, pays, caractère requis ou facultatif, période d'effet et empreinte.
- `ConsentRecord` : utilisateur, version exacte, décision `granted` ou `refused`, date serveur, canal et version client.
- `ConsentWithdrawal` : révocation rattachée au consentement accordé, date et conséquence déclenchée.

Le dernier événement applicable donne l'état courant ; l'historique reste append-only. Le journal d'audit conserve seulement le code, la version, l'action et l'acteur, jamais les autres réponses utilisateur.

## Consentements envisagés

| Code provisoire             | Finalité                                                 |                     MVP | Effet d'un refus/retrait                                                 |
| --------------------------- | -------------------------------------------------------- | ----------------------: | ------------------------------------------------------------------------ |
| `terms_of_service`          | acceptation contractuelle                                |                  requis | compte non activable                                                     |
| `sensitive_data_processing` | traitement des données déclarées nécessaires au parcours | requis pour le parcours | arrêt de la collecte et procédure de suppression selon politique validée |
| `reminder_notifications`    | rappels facultatifs                                      |              facultatif | aucun nouvel envoi                                                       |
| `product_analytics`         | mesures produit minimisées                               |              facultatif | aucun événement facultatif                                               |

Les textes, durées et fondements juridiques doivent être validés pour la France avant publication. Le tableau ne constitue pas un avis juridique.

## API

- `GET /me/consents` restitue définitions actives et état courant.
- `POST /me/consents` enregistre une décision idempotente pour une version exacte.
- `POST /me/consents/{record_id}/withdrawal` retire un consentement facultatif ou lance le workflow approprié pour un consentement nécessaire au service.

Un retrait prend effet côté autorisation métier avant l'exécution des traitements asynchrones associés.
