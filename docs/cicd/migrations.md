# Migrations PostgreSQL

Toute migration suit expansion–migration–contraction et doit rester compatible avec les versions N et N-1 pendant un déploiement rolling.

1. Ajouter les structures nullable ou avec valeur par défaut sûre, sans suppression ni renommage direct.
2. Déployer le code capable de lire et écrire les deux représentations.
3. Migrer les données par lots, de façon reprenable et observable.
4. Vérifier volumes, durée, verrous et intégrité en staging.
5. Basculer les lectures avec un feature flag lorsque pertinent.
6. Supprimer l'ancien schéma dans une publication ultérieure après preuve de non-utilisation.

Un verrou applicatif empêche deux exécutions concurrentes. Les opérations bloquantes ou destructrices exigent estimation, sauvegarde/PITR vérifié, approbation backend et technique et procédure d'échec. Le rollback applicatif ne doit jamais tenter d'annuler aveuglément une migration de données ; il revient vers un binaire compatible ou désactive la fonction.
