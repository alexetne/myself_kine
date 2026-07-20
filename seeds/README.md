# Données initiales cliniques

`clinical-v1.0.draft.sql` décrit la forme attendue du questionnaire et du jeu de règles 1.0 avec des valeurs exclusivement synthétiques.

Le fichier est volontairement entouré d'une transaction terminée par `ROLLBACK` et toutes les versions sont en statut `draft`. Il ne constitue pas une migration et ne doit pas être exécuté au déploiement.

Avant toute activation :

1. remplacer les contenus synthétiques par le référentiel approuvé ;
2. joindre les validations clinique et juridique ainsi que l'empreinte du contenu ;
3. exécuter les tests de référence approuvés ;
4. faire approuver la version par une personne différente de son auteur ;
5. publier le questionnaire et le jeu de règles dans une transaction atomique ;
6. vérifier l'événement d'audit et simuler les quatre orientations ;
7. conserver le fichier validé dans le mécanisme sécurisé de contenu, sans donnée utilisateur.

Le moteur refuse toute évaluation tant qu'il ne trouve pas exactement un jeu Safety publié et actif.
