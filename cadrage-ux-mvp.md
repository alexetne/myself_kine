# Cadrage UX du MVP — Assistant course et trail

**Statut : ✅ Validé (MVP)**

Ce document traduit les décisions produit en contraintes de conception pour les parcours, wireframes et prototypes. Il s'appuie sur le référentiel clinique MVP et ne modifie jamais les règles de sécurité définies dans celui-ci.

---

## 1. Principe de sécurité

L'application accompagne la pratique sportive et le renforcement musculaire spécifique.

Elle :

* organise les séances ;
* guide des exercices validés ;
* adapte uniquement les paramètres d'entraînement autorisés ;
* recueille les retours du sportif.

Elle ne :

* réalise aucun diagnostic ;
* ne traite aucune pathologie ;
* ne remplace pas un médecin ou un kinésithérapeute ;
* ne déclare jamais une personne médicalement apte ;
* ne garantit jamais l'absence de risque.

Toutes les décisions d'orientation reposent exclusivement sur le référentiel clinique du produit.

✅ **Validation OK**

---

## 2. Porte d'entrée du MVP

La porte d'entrée principale est l'objectif sportif :

1. Prévenir
2. Reprendre progressivement une activité
3. Renforcer une qualité physique

Le produit ne propose jamais :

* traiter une blessure ;
* rééduquer une articulation ;
* soigner une douleur.

Une gêne déclarée déclenche uniquement l'application des niveaux d'orientation du référentiel clinique.

✅ **Validation OK**

---

## 3. Premier parcours

1. Présentation du service
2. Limites de l'application
3. Choix de l'objectif
4. Vérification des critères d'éligibilité
5. Résultat d'éligibilité
6. Création du compte
7. Consentements
8. Profil sportif
9. Questionnaire de sécurité
10. Bilan initial
11. Première semaine
12. Point du jour
13. Séance guidée
14. Déclaration éventuelle d'une gêne
15. Adaptation éventuelle
16. Bilan de séance
17. Suivi à 24 h

Une personne non éligible peut quitter l'application sans créer de compte.

✅ **Validation OK**

---

## 4. Architecture principale

Navigation :

* Aujourd'hui
* Programme
* Exercices
* Progression
* Profil

Les parcours critiques restent immersifs :

* onboarding ;
* questionnaire de sécurité ;
* séance ;
* déclaration d'une gêne ;
* orientation.

Le bouton **"Signaler une gêne"** reste toujours visible pendant une séance.

✅ **Validation OK**

---

## 5. Niveaux d'orientation

Le produit utilise les quatre niveaux du référentiel :

### Niveau 0

Accompagnement normal.

### Niveau 1

Adaptation ou surveillance.

### Niveau 2

Consultation d'un professionnel de santé recommandée.

### Niveau 3

Arrêt immédiat et orientation urgente.

Chaque écran comporte :

* un pictogramme ;
* un titre clair ;
* une explication ;
* l'action immédiate ;
* les limites de l'application.

La couleur n'est jamais le seul moyen de différencier les niveaux.

Les numéros d'urgence ne sont affichés que dans le contexte prévu par le référentiel.

✅ **Validation OK**

---

## 6. Données du profil

### Données nécessaires

* majorité ;
* objectif ;
* niveau sportif ;
* fréquence d'entraînement ;
* dernière pratique ;
* disponibilité ;
* matériel ;
* pratique route ou trail ;
* fatigue ;
* sommeil ;
* effort perçu ;
* réponses au questionnaire de sécurité.

### Données non demandées par défaut

* poids ;
* taille ;
* profession ;
* adresse ;
* photographie ;
* géolocalisation permanente.

Le produit applique le principe de minimisation des données.

✅ **Validation OK**

---

## 7. États du jour

Le produit n'affiche jamais :

* un score de santé ;
* un score de risque ;
* un score d'aptitude.

Les états autorisés sont :

* Prêt pour la séance
* Séance allégée recommandée
* Journée récupération

Chaque état explique les facteurs utilisés :

* fatigue ;
* sommeil ;
* récupération ;
* retour de la séance précédente.

Aucun état favorable ne garantit l'absence de risque.

✅ **Validation OK**

---

## 8. Personnalisation automatique

Le moteur peut uniquement :

* modifier le calendrier ;
* remplacer une séance par une variante validée ;
* diminuer la charge ;
* maintenir la charge ;
* proposer du repos.

Il ne peut jamais :

* diagnostiquer ;
* interpréter une pathologie ;
* décider d'une reprise médicale ;
* créer un protocole thérapeutique.

Chaque adaptation précise :

* ce qui change ;
* pourquoi ;
* la prochaine étape.

✅ **Validation OK**

---

## 9. Suivi à 24 heures

Le suivi prévoit :

* notification ;
* rappel facultatif ;
* heure configurable ;
* bannière persistante.

L'absence de réponse signifie uniquement :

> Suivi non renseigné.

Elle n'est jamais interprétée.

Le suivi recueille :

* évolution ressentie ;
* fatigue inhabituelle ;
* impact sur les activités quotidiennes.

Les adaptations suivent exclusivement le référentiel clinique.

✅ **Validation OK**

---

## 10. Fonctionnement hors connexion

Disponible hors connexion :

* séance déjà téléchargée ;
* chronomètre ;
* progression locale.

Les données sont synchronisées lors du retour du réseau.

Aucune nouvelle décision de sécurité n'est calculée hors connexion.

L'écran des consignes de sécurité reste toujours disponible.

✅ **Validation OK**

---

## 11. Terminologie

### Autorisée

* gêne ;
* douleur (si déclarée par l'utilisateur) ;
* symptôme ;
* adaptation ;
* progression ;
* récupération ;
* signal d'alerte.

### Interdite

* diagnostic ;
* traitement ;
* guérison ;
* sans risque ;
* médicalement apte.

Le vocabulaire reste compatible avec le référentiel clinique.

✅ **Validation OK**

---

## 12. Confidentialité

Le questionnaire de sécurité reste gratuit.

Aucune information de sécurité n'est placée derrière un abonnement.

Les données personnelles restent exportables.

La suppression du compte reste accessible.

Les modalités exactes de conservation sont définies dans la politique de confidentialité.

⚠️ **Validation fonctionnelle OK — validation juridique à prévoir.**

---

## 13. Design system

Respect obligatoire :

* cibles tactiles ≥ 48 × 48 px ;
* texte ≥ 16 px ;
* contraste WCAG AA ;
* états visibles sans couleur ;
* focus accessibles ;
* sous-titres des vidéos ;
* actions critiques uniques ;
* utilisation possible à une main.

✅ **Validation OK**

---

## 14. Critères de validation UX

Les tests vérifient notamment :

* compréhension des limites de l'application ;
* distinction entre accompagnement sportif et prise en charge médicale ;
* compréhension du suivi à 24 h ;
* déclaration d'une gêne en moins de 15 s ;
* compréhension des niveaux d'orientation ;
* compréhension des adaptations proposées ;
* absence d'incitation à poursuivre malgré un signal d'arrêt.

Les tests sont réalisés avec :

* débutants ;
* coureurs réguliers ;
* traileurs ;
* sportifs en reprise ;
* utilisateurs de différents niveaux numériques.

Les scénarios reproduisent :

* fatigue ;
* lumière extérieure ;
* mains humides ;
* petit écran ;
* connexion instable ;
* utilisation à une main.

✅ **Validation OK**

---

## 15. Livrables autorisés

Peuvent être produits :

* architecture de l'information ;
* parcours utilisateurs ;
* wireframes ;
* design system ;
* composants UI ;
* prototypes interactifs ;
* fiches d'exercices ;
* questionnaires de sécurité conformes au référentiel clinique ;
* documentation fonctionnelle.

Ne peuvent pas être produits sans nouvelle validation :

* fonctionnalités de diagnostic ;
* protocoles de rééducation ;
* nouvelles règles d'orientation non prévues par le référentiel ;
* recommandations thérapeutiques.

✅ **Validation OK**

---

### Statut global

**Validation UX : ✅ OK**

Ce document est désormais cohérent avec le référentiel clinique MVP. Il peut être considéré comme la spécification UX de référence d'un produit de **préparation physique et d'accompagnement sportif**, à condition de conserver le périmètre défini : pas de diagnostic, pas de traitement, pas de rééducation, et orientation systématique vers un professionnel de santé en cas de doute ou de situation exclue. Le seul point restant hors de ce référentiel est la conformité juridique (RGPD, conservation des données, CGU), qui devra être validée séparément.
