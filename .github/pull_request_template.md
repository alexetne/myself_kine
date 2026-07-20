## Objet

Décrire le changement et sa justification.

## Risque

- [ ] Aucun impact infrastructure, sécurité, migration ou contenu clinique
- [ ] Infrastructure
- [ ] Sécurité ou confidentialité
- [ ] Migration de données
- [ ] Règle ou contenu clinique

## Vérifications

- [ ] `make ci` réussit localement
- [ ] Les tests utilisent uniquement des données synthétiques
- [ ] Aucun secret ni donnée personnelle ou de santé n'apparaît dans les changements ou journaux
- [ ] Le changement est rétrocompatible avec la version actuellement déployée
- [ ] Le rollback ou le feature flag est documenté si nécessaire

## Déploiement

Version/migration/feature flag/observabilité à surveiller :

