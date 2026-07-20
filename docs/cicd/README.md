# Plateforme CI/CD

## État et décisions

Le produit cible un monorepo TypeScript avec backend NestJS, frontend web responsive/PWA (React/Next.js à confirmer), PostgreSQL et artefacts OCI. GitHub Actions est la CI retenue. L'hébergement cible un PaaS portable situé dans l'Union européenne, compatible avec une future exigence HDS. Aucun fournisseur ni accès de production n'est encore configuré.

Le workflow actuel est volontairement une fondation : il vérifie le dépôt, la politique de données sensibles, l'installation verrouillée, le build NestJS et les tests. Le déploiement reste fermé jusqu'à l'ajout d'une application testée, d'une image OCI et d'une cible approuvée.

## Flux de promotion

1. Une branche courte ouvre une pull request vers `main`.
2. Les contrôles obligatoires s'exécutent sans secret de production.
3. Après revue, `main` reconstruit dans un contexte propre.
4. Une seule image OCI est produite, scannée, accompagnée d'une SBOM et d'une provenance, puis poussée par digest.
5. Ce digest est déployé en développement puis promu en staging sans reconstruction.
6. La production exige l'approbation du responsable technique et du responsable produit.
7. Le déploiement rolling est arrêté automatiquement si les health checks ou smoke tests échouent.

## Environnements

| Environnement | Données                             | Déclenchement         | Rétention                    |
| ------------- | ----------------------------------- | --------------------- | ---------------------------- |
| local         | synthétiques                        | développeur           | locale                       |
| PR frontend   | synthétiques, aucun secret sensible | PR éligible           | fermeture + 24 h max         |
| développement | synthétiques                        | fusion dans `main`    | permanent, petite taille     |
| staging       | synthétiques représentatives        | promotion automatique | permanent, proche production |
| production    | réelles et minimisées               | double approbation    | selon politique juridique    |

Les comptes/projets, secrets, identités et états d'infrastructure sont séparés. La CI utilise OIDC et des droits temporaires limités au job et à l'environnement.

## Protection GitHub à configurer

Renommer la branche initiale en `main`, puis activer un ruleset :

- pull request obligatoire et branche à jour ;
- une approbation minimum, plus propriétaires de code pour les zones sensibles ;
- conversations résolues ;
- status checks `repository-policy` et, après scaffold, lint, types, tests, build, migrations et sécurité ;
- force-push et suppression interdits ;
- administrateurs soumis aux règles ;
- commits ou tags signés pour les publications lorsque l'organisation peut l'imposer.

Créer les environnements GitHub `development`, `staging` et `production`. `production` interdit l'auto-approbation, limite la branche à `main`/tags de publication et requiert les approbateurs désignés. Vérifier que le plan GitHub choisi offre ces protections pour un dépôt privé.

## Fenêtre de production

Les déploiements ordinaires ont lieu du lundi au jeudi, de 09:00 à 16:00 Europe/Paris, hors jours fériés, avec deux heures de surveillance disponibles. Cette règle doit être vérifiée par un job avant l'approbation, avec gestion explicite des jours fériés. Un correctif urgent nécessite une justification et une approbation explicite.

## SLO, sauvegardes et coûts

- objectif indicatif : disponibilité mensuelle 99,5 % ;
- RPO maximal : 1 heure ; RTO maximal : 4 heures ;
- sauvegarde complète quotidienne et restauration ponctuelle si disponible ;
- exercice de restauration trimestriel avec preuve horodatée ;
- alertes budgétaires à 70 %, 85 % et 100 % d'un plafond global de 1 000 EUR/mois.

La sauvegarde quotidienne seule ne garantit pas un RPO d'une heure : la cible PaaS devra fournir des journaux transactionnels/PITR avec une granularité d'au plus une heure.

## Rétention initiale

- logs applicatifs : 30 jours ; sécurité : 6 mois ; audit sensible : au moins 12 mois ;
- artefacts de développement : 30 jours ; production : 12 mois ou 20 dernières versions ;
- sauvegardes quotidiennes : 30 jours ; mensuelles : 12 mois sous réserve juridique.

Les journaux n'acceptent ni réponse médicale complète, ni identifiant direct, ni contenu libre utilisateur. Les événements techniques et d'audit utilisent des identifiants pseudonymes distincts et des accès séparés.

## Commandes développeur

`make ci` reproduit les contrôles disponibles. Après création des workspaces, cette commande orchestrera formatage, lint, types, tests unitaires, intégration, build, migrations et contrôles de sécurité avec les mêmes versions qu'en CI.

## Prochaines portes de décision

1. Confirmer Next.js ou un autre frontend TypeScript.
2. Choisir le PaaS et la région après matrice HDS, DPA, PITR, audit, chiffrement, coûts et exportabilité.
3. Fournir les équipes/identifiants GitHub pour remplacer le propriétaire bootstrap.
4. Sélectionner fournisseur d'identité, email, stockage objet, observabilité et gestionnaire de secrets.
5. Valider juridiquement rétention, HDS et qualification du produit.
