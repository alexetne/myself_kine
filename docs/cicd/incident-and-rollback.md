# Incident et rollback

Le responsable technique commande l'incident ; le responsable produit décide de l'impact fonctionnel et de la communication ; l'ingénieur backend prend en charge les migrations ; le responsable clinique traite tout risque lié aux règles ou contenus cliniques.

Déclencher l'arrêt de promotion pour échec de health check ou smoke test, hausse soutenue du taux d'erreur, latence dépassant le SLO, erreur d'intégrité ou comportement clinique inattendu. Commencer par figer les déploiements, préserver les preuves sans données sensibles, puis choisir :

- **feature flag** pour isoler une fonction lorsque le socle reste sain ;
- **rollback applicatif** vers le digest précédent si les schémas sont compatibles ;
- **roll-forward** si une migration rend le rollback dangereux ;
- restauration de données uniquement sur décision d'incident, après analyse de la perte induite.

Après rétablissement, consigner chronologie, impact, détection, décisions, actions et propriétaires. La revue est sans recherche de culpabilité. Un exercice trimestriel teste alternativement restauration et rollback.
