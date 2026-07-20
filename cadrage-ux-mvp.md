# Cadrage UX du MVP — Assistant course et trail

Statut : structure produit validée, règles cliniques en attente de validation.

Ce document transforme les décisions produit en contraintes de conception pour les parcours, wireframes et prototypes. Il ne constitue pas une validation clinique.

## 1. Principe de sécurité

L'application accompagne l'organisation d'une pratique sportive, guide des contenus prévalidés et recueille les retours de l'utilisateur. Elle ne pose pas de diagnostic, ne déclare jamais une personne « apte » et ne promet ni traitement ni absence de risque.

Tant que les règles cliniques ne sont pas validées, le prototype peut représenter les écrans et embranchements de sécurité, mais il ne doit pas associer une réponse concrète à une décision présentée comme approuvée.

### Éléments cliniques non validés

- liste officielle des signaux d'alerte ;
- niveau d'urgence associé à chaque signal ;
- formulation exacte des messages critiques ;
- tests fonctionnels autorisés ;
- contre-indications ;
- critères d'arrêt ;
- seuils de gêne ;
- règles de reprise ;
- durée d'évolution défavorable avant orientation ;
- matrice de progression, maintien et allègement.

Dans les prototypes et spécifications, ces éléments portent le marqueur :

> **CONTENU CLINIQUE À VALIDER — aucune logique de décision approuvée à ce stade.**

## 2. Porte d'entrée du MVP

La porte d'entrée principale est l'objectif sportif :

1. Prévenir
2. Reprendre
3. Renforcer

Le MVP ne propose aucune entrée « traiter ma pathologie ». La déclaration d'une gêne déclenche un contrôle de sécurité et, selon une règle future validée, une surveillance, une adaptation, une suspension ou une orientation.

## 3. Ordre du premier parcours

1. Présentation de la promesse
2. Présentation des limites
3. Choix de l'objectif sportif
4. Préqualification très courte, sans conservation de données sensibles
5. Résultat d'éligibilité structurel
6. Création du compte
7. Consentements distincts
8. Profil sportif
9. Questionnaire de sécurité
10. Déclaration éventuelle d'une gêne
11. Bilan initial
12. Première semaine
13. Point du jour
14. Séance guidée
15. Signalement d'une gêne pendant la séance
16. Variante, pause ou arrêt selon un embranchement simulé
17. Bilan de séance
18. Suivi à 24 heures
19. Adaptation suivante expliquée

Une personne que le produit ne peut pas accompagner ne doit pas être obligée de créer un compte.

## 4. Architecture principale

La navigation persistante comprend :

- Aujourd'hui
- Programme
- Progression
- Exercices
- Profil

Les parcours immersifs masquent cette navigation : onboarding, questionnaire de sécurité, bilan initial, séance guidée, signalement d'une gêne et orientation critique.

Pendant une séance, l'action « Signaler une gêne » reste visible et accessible en une interaction.

## 5. Niveaux d'orientation à prévoir dans l'interface

La structure UI prévoit quatre résultats, sans figer leurs déclencheurs :

1. Continuer avec surveillance
2. Suspendre ou adapter la séance
3. Consulter un kinésithérapeute ou un médecin
4. Contacter les services d'urgence

Chaque niveau comporte obligatoirement :

- un pictogramme distinct ;
- un titre explicite ;
- une consigne immédiate ;
- l'action principale disponible ;
- ce qu'il ne faut pas faire ;
- un accès aux limites de l'application.

La couleur ne transmet jamais seule le niveau. Les numéros 15 et 112 ne peuvent apparaître dans un écran final qu'après validation du contenu et du contexte pour la France.

L'association entre réponses et niveaux doit être administrable, versionnée, datée et validée cliniquement.

## 6. Données du profil

### Requises

- tranche d'âge confirmant la majorité ;
- objectif ;
- niveau de pratique ;
- fréquence et volume approximatif ;
- date de dernière pratique régulière ;
- disponibilités ;
- matériel ;
- contexte route ou trail ;
- fatigue, sommeil et effort perçu ;
- réponses strictement nécessaires au questionnaire de sécurité.

### Facultatives ou exclues par défaut

- poids ;
- taille ;
- adresse complète ;
- photo ;
- date de naissance exacte ;
- profession ;
- contacts personnels ;
- localisation permanente.

La taille et le poids ne sont demandés que si un parcours validé démontre leur utilité. Le professionnel référent et le partage avec un professionnel sont hors MVP fonctionnel.

## 7. États du jour

Aucun score pseudo-précis de récupération, santé ou aptitude n'est affiché.

Les catégories autorisées sont :

- Prêt pour la séance prévue
- Séance allégée recommandée
- Récupération supplémentaire conseillée

Chaque catégorie est accompagnée des facteurs utilisés, par exemple fatigue déclarée, sommeil, effort précédent ou retour à 24 heures. Un état favorable ne garantit jamais l'absence de risque.

## 8. Personnalisation automatique

### Autorisée

- organiser le calendrier ;
- sélectionner une variante prévalidée ;
- maintenir ou réduire simplement la charge ;
- proposer du repos ;
- remplacer une séance par une séance équivalente prévalidée.

### Interdite sans validation supplémentaire

- augmenter fortement la charge ;
- interpréter un symptôme ;
- produire un diagnostic ;
- décider d'une reprise après une alerte ;
- contourner une contre-indication ;
- créer librement un protocole clinique.

Toute adaptation affichée précise : ce qui change, les facteurs utilisés, ce qui est proposé maintenant et le prochain point d'observation.

## 9. Suivi à 24 heures

Le MVP prévoit :

- un rappel dans l'application ;
- un email facultatif ;
- une heure configurable ;
- une bannière persistante à la prochaine ouverture.

L'absence de réponse produit un état « suivi non renseigné ». Elle n'est jamais interprétée comme une absence de gêne.

Le suivi recueille au minimum l'évolution déclarée, une fatigue inhabituelle et l'impact sur la marche ou les activités quotidiennes. La décision résultante reste soumise à la matrice clinique à valider.

## 10. Fonctionnement hors connexion

Une séance déjà ouverte reste consultable. Le chronomètre et la progression locale continuent. Les réponses sont conservées localement de manière protégée, puis synchronisées avec prévention des doublons au retour du réseau.

Aucune nouvelle recommandation sensible n'est calculée hors connexion. L'écran d'urgence et les informations de sécurité restent accessibles.

États spécifiques à concevoir :

- séance disponible hors connexion ;
- réponses en attente de synchronisation ;
- synchronisation réussie ;
- conflit ou doublon évité ;
- recommandation indisponible avant reconnexion.

## 11. Terminologie éditoriale

### Termes retenus

- **Gêne** : ressenti léger ou non encore caractérisé.
- **Douleur** : terme utilisé lorsque l'utilisateur le choisit explicitement.
- **Symptôme** : réservé aux questionnaires et contenus encadrés.
- **Précaution** : information demandant de l'attention.
- **Adaptation** : modification du programme.
- **Signal d'alerte** : information imposant une suspension ou une orientation.

### Termes interdits

- blessure détectée ;
- diagnostic ;
- guéri ;
- sans risque ;
- apte médicalement.

## 12. Confidentialité, export et modèle économique

Le questionnaire de sécurité, les alertes, l'orientation et l'accès aux données personnelles restent gratuits. Aucun paywall ne bloque une information de sécurité. Le MVP de test est gratuit et aucune publicité ciblée n'utilise des données personnelles ou de santé.

L'export initial comprend :

- un fichier JSON structuré ;
- un résumé PDF lisible ;
- un lien temporaire et protégé.

La suppression est accessible depuis le profil. L'interface distingue la suppression du compte, le délai de traitement et une éventuelle conservation obligatoire. Les durées exactes restent à confirmer juridiquement.

## 13. Contraintes du design system

- Cibles tactiles minimales de 48 × 48 px, renforcées pendant une séance.
- Corps de texte courant de 16 px minimum.
- Contraste WCAG AA au minimum.
- Aucun état transmis uniquement par la couleur.
- Rouge réservé aux alertes critiques et actions destructives.
- Jauges accompagnées d'une valeur et d'un libellé verbal.
- États de focus visibles.
- Vidéos sous-titrées avec alternative textuelle.
- Contrôles essentiels atteignables à une main.
- Les écrans critiques utilisent une action principale unique et une formulation directe.

## 14. Critères de validation du prototype

Le prototype doit permettre de mesurer :

- la distinction entre accompagnement et diagnostic ;
- la compréhension du suivi à 24 heures ;
- un signalement de gêne en moins de 15 secondes ;
- la compréhension de « variante », « pause » et « arrêt » ;
- la réaction à une alerte de prudence ;
- la compréhension de la justification d'une adaptation ;
- la représentation du terrain et du dénivelé pour le trail ;
- l'absence d'incitation à poursuivre lors d'un signal d'arrêt.

Les tests incluent des coureurs débutants, réguliers, traileurs, personnes en reprise et différents niveaux d'aisance numérique.

Les conditions à reproduire sont : après un effort, mains humides, lumière extérieure, attention réduite, connexion instable, petit écran, fatigue et utilisation à une main.

## 15. Livrables autorisés avant validation clinique

Peuvent être produits :

- architecture de l'information ;
- parcours et embranchements génériques ;
- wireframes basse fidélité ;
- composants et états de sécurité ;
- prototype structurel utilisant des données fictives explicitement marquées ;
- protocole de test utilisateur.

Ne peuvent pas être présentés comme finalisés :

- questionnaire de sécurité réel ;
- messages critiques définitifs ;
- tests fonctionnels prescrits ;
- seuils d'arrêt ou de progression ;
- recommandations de reprise ;
- logique associant une réponse utilisateur à une orientation clinique.
