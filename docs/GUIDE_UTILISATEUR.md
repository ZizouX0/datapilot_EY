# DataPilot — Guide de l'utilisateur

**Un guide pas à pas pour utiliser DataPilot, de la première configuration jusqu'au rapport de maturité final. Rédigé pour des utilisateurs métier — aucune compétence technique requise.**

> DataPilot est l'outil d'évaluation de la maturité des données d'EY pour les banques. Vos équipes répondent à un questionnaire structuré ; DataPilot calcule la maturité data de la banque, la confronte à la réglementation de la Banque Centrale de Tunisie (BCT), montre les écarts et construit une feuille de route d'amélioration exportable en PDF.

*(Une version anglaise de ce guide est disponible : [`docs/USER_GUIDE.md`](USER_GUIDE.md).)*

---

## Sommaire

1. [Vue d'ensemble : les quatre rôles](#1-vue-densemble--les-quatre-rôles)
2. [La règle d'or des invitations](#2-la-règle-dor-des-invitations)
3. [Se connecter et définir son mot de passe](#3-se-connecter-et-définir-son-mot-de-passe)
4. [Marche à suivre par rôle](#4-marche-à-suivre-par-rôle)
5. [Comment inviter quelqu'un (l'écran exact)](#5-comment-inviter-quelquun-lécran-exact)
6. [Les deux façons de réaliser une évaluation](#6-les-deux-façons-de-réaliser-une-évaluation)
7. [Remplir une évaluation](#7-remplir-une-évaluation)
8. [Lire ses résultats et exporter le rapport](#8-lire-ses-résultats-et-exporter-le-rapport)
9. [Gérer son propre compte](#9-gérer-son-propre-compte)
10. [Règles et conditions en un coup d'œil](#10-règles-et-conditions-en-un-coup-dœil)
11. [Questions fréquentes](#11-questions-fréquentes)

---

## 1. Vue d'ensemble : les quatre rôles

DataPilot compte quatre types d'utilisateurs. Ils forment une chaîne d'autorité — chaque niveau configure le niveau inférieur.

```
   EY (propriétaire) ──▶ Super Admin ──▶ Admin ──▶ Analyste
   (tout l'outil)        (une banque)    (coordinateur) (fait le travail)
```

| Rôle | Qui c'est | Ce qu'il fait |
| ---- | --------- | ------------- |
| **EY** (affiché **Admin EY**) | L'équipe de conseil EY | Pilote toute la plateforme. Invite le Super Admin de chaque banque. Voit tout, dans toutes les banques. |
| **Super Admin** | Le responsable data de la banque (ex. Chief Data Officer) | Sommet d'une banque. Crée les départements, invite les Admins, lance et finalise les évaluations. |
| **Admin** | Un coordinateur au sein de la banque | Invite les Analystes, les affecte aux départements, configure et finalise l'évaluation groupée. |
| **Analyste** | La personne qui répond aux questions | Remplit l'évaluation (seul, ou la partie de son département) et lit les résultats. |

> **Important :** les Super Admins et Admins **coordonnent** — ils configurent et vérifient. **Seuls les Analystes remplissent les évaluations.** Si vous vous connectez en tant qu'Admin, vous ne verrez pas le questionnaire, mais l'espace d'administration. C'est normal.

---

## 2. La règle d'or des invitations

**Chaque utilisateur est créé par le niveau directement au-dessus de lui — une étape à la fois.** Personne ne s'inscrit seul ; l'accès se fait uniquement sur invitation.

- EY invite les **Super Admins**.
- Un Super Admin invite des **Admins**.
- Un Admin invite des **Analystes**.

La personne invitée **ne saisit jamais ses propres informations**. Celui qui l'invite renseigne son e-mail, sa fonction, sa banque et (pour les analystes) son département. La nouvelle personne reçoit simplement un e-mail et choisit un mot de passe.

**La banque est héritée automatiquement.** Quand EY invite un Super Admin, EY fixe la banque. Ensuite, chaque Admin et Analyste que cette équipe invite appartient à la même banque — personne n'a à la ressaisir.

---

## 3. Se connecter et définir son mot de passe

**Chaque nouvel utilisateur suit le même premier parcours :**

1. Vous recevez un **e-mail d'invitation** de DataPilot.
2. Cliquez sur le lien. La page **« Définir votre mot de passe »** s'ouvre.
3. Choisissez un mot de passe (au moins 8 caractères), saisissez-le deux fois, puis validez.
4. Vous êtes dirigé vers DataPilot, déjà connecté.

Ensuite, vous vous connectez normalement sur la page de connexion :

- Ouvrez l'adresse DataPilot fournie par votre administrateur.
- Saisissez votre **e-mail** et votre **mot de passe**, cliquez sur **« Se connecter → »**.

> **Mot de passe oublié ?** Demandez à votre administrateur (ou Super Admin) de vous envoyer une réinitialisation — il dispose d'un bouton **Réinitialiser** à côté de votre nom.
>
> **Le lien est « invalide ou expiré » ?** Les liens d'invitation et de réinitialisation sont à usage unique et limités dans le temps. Demandez-en un nouveau.

---

## 4. Marche à suivre par rôle

### A. EY (propriétaire de la plateforme)

> Le **tout premier compte EY** est créé une seule fois, à l'installation, par l'équipe technique/IT (voir `docs/SETUP.md`). Tout le reste se fait dans l'application. Si vous êtes l'utilisateur EY, votre compte existe déjà — il suffit de vous connecter.

Une fois connecté en tant qu'EY, vous arrivez dans l'**espace d'administration**. Votre mission principale : intégrer chaque banque.

1. Allez dans **Admin → Utilisateurs et rôles**.
2. Ouvrez l'encadré **« Inviter un Super Admin »**.
3. Saisissez :
   - l'**e-mail** du Super Admin,
   - son **poste** (ex. *Chief Data Officer*) — facultatif,
   - le **nom de la banque** — **obligatoire** (c'est la seule fois où la banque est saisie ; tous les niveaux inférieurs en héritent).
4. Cliquez sur **Envoyer l'invitation**. Il reçoit un e-mail pour définir son mot de passe.

Voilà — le Super Admin constitue ensuite sa propre équipe. Vous pouvez aussi :
- **Consulter les évaluations** de toutes les banques (Admin → Soumissions).
- **Modifier le questionnaire maître** dont les banques partent (Admin → Questionnaire).

---

### B. Super Admin (sommet d'une banque)

Vous avez été invité par EY et appartenez à une banque. Vous construisez et pilotez l'évaluation de votre banque. Ordre recommandé :

1. **Créer vos départements** — Admin → **Départements**.
   - Cliquez sur **« ⚡ Utiliser les départements tunisiens standard »** pour ajouter les cinq départements standard en un clic, ou saisissez les vôtres.
2. **Inviter vos Admins** — Admin → **Utilisateurs et rôles** → **« Inviter un Admin »** (e-mail + poste). Vous pouvez aussi inviter des Analystes directement.
3. **Affecter les analystes aux départements** — Admin → **Départements** → *Affecter les analystes* → choisissez un département pour chaque analyste.
4. **Lancer l'évaluation groupée** — Admin → **Évaluation groupée** (voir [section 6](#6-les-deux-façons-de-réaliser-une-évaluation)).
5. **Finaliser** une fois tout le monde terminé — l'évaluation est verrouillée et classée dans **Soumissions**.

Vous pouvez aussi gérer les personnes : changer le rôle, modifier le poste (crayon ✎), envoyer une **réinitialisation de mot de passe**, ou **désactiver** un compte quand quelqu'un quitte la banque.

---

### C. Admin (le coordinateur)

Vous avez été invité par un Super Admin. Vous assurez la coordination concrète de l'évaluation :

1. **Départements** (Admin → Départements) — créez-les si besoin et **affectez chaque analyste** au département dont il connaît les sujets.
2. **Inviter des Analystes** — Admin → **Utilisateurs et rôles** → **« Inviter un Analyste »** :
   - saisissez l'**e-mail** et le **poste**,
   - choisissez un **département** (facultatif) : un département → il remplira la partie correspondante de l'évaluation groupée ; laissez vide → il fera une évaluation solo.
3. **Créer l'évaluation groupée** et **associer chaque dimension à un département** (Admin → Évaluation groupée).
4. **Suivre l'avancement et finaliser** — quand chaque département a terminé, cliquez sur **Finaliser et soumettre**.

---

### D. Analyste (remplit l'évaluation)

Vous avez été invité par un Admin ou un Super Admin. C'est vous qui répondez aux questions. À la connexion, vous arrivez sur votre page **Bienvenue**.

- Elle affiche vos **nom, e-mail, fonction, banque et date du jour** — en lecture seule (votre nom est modifiable sur votre page Compte ; votre fonction est définie par votre administrateur). Vérifiez-les et commencez.
- **Si votre département s'est vu attribuer une partie d'une évaluation partagée,** un encadré jaune **« Contribuer à l'évaluation groupée → »** apparaît — cliquez pour remplir uniquement les dimensions de votre département.
- **Sinon (ou comme entraînement personnel),** cliquez sur **« Démarrer l'évaluation → »** pour réaliser l'évaluation solo complète.

Répondez ensuite aux questions ([section 7](#7-remplir-une-évaluation)) et lisez vos résultats ([section 8](#8-lire-ses-résultats-et-exporter-le-rapport)).

---

## 5. Comment inviter quelqu'un (l'écran exact)

Toutes les invitations se font dans **Admin → Utilisateurs et rôles**. L'encadré propose toujours exactement le rôle **situé un niveau en dessous du vôtre** — impossible de sauter un niveau, et le rôle est imposé (vous ne le choisissez pas).

L'encadré s'intitule **« Inviter un [Rôle] »** et demande :

| Champ | Qui le voit | Obligatoire ? | À quoi il sert |
| ----- | ----------- | ------------- | -------------- |
| **E-mail** | Tout le monde | ✅ Oui | Identifiant de connexion et destination de l'invitation. |
| **Poste (facultatif)** | Tout le monde | Facultatif | Sa fonction (liste de rôles data courants, ou « Autre… » pour saisir). |
| **Nom de la banque (obligatoire)** | **EY uniquement** | ✅ Oui (pour EY) | La banque à laquelle le nouveau Super Admin — et tout le monde en dessous — appartiendra. |
| **Département (facultatif — laissez vide pour solo)** | Admins & Super Admins | Facultatif | Pour les analystes : le département dont il traitera les dimensions. Vide = évaluation solo. |

Cliquez ensuite sur **Envoyer l'invitation**. Vous verrez *« Invitation envoyée à [e-mail] en tant que [Rôle]. »* et la personne reçoit un e-mail.

> **Conseil — utilisez des boîtes fonctionnelles pour les rôles d'administration.** Pour les comptes Super Admin / Admin, une boîte partagée gérée par l'IT de la banque (ex. `data-governance@votrebanque.tn`) vaut mieux qu'une adresse personnelle : le compte survit si la personne change de poste. Réservez les adresses personnelles aux analystes du quotidien.

**Gérer les personnes ensuite** (même écran) : la ligne de chaque personne permet de modifier son **poste** (✎), changer son **rôle** (uniquement vers des rôles inférieurs au vôtre), envoyer une **réinitialisation de mot de passe**, ou **désactiver / activer** son compte. Vous ne pouvez jamais changer votre propre rôle, ni agir sur une personne d'un niveau supérieur ou égal.

---

## 6. Les deux façons de réaliser une évaluation

DataPilot propose deux modes. Les deux utilisent le même questionnaire à l'écran.

### Évaluation solo
Un seul analyste répond à **toutes** les questions. Idéal pour une évaluation rapide réalisée par une seule personne. L'analyste la remplit, examine les résultats, puis clique sur **Soumettre pour revue**.

### Évaluation groupée (« une évaluation partagée, plusieurs départements »)
Chaque département répond à **sa propre partie** d'une évaluation partagée. Idéal pour un diagnostic réel à l'échelle de la banque, où chaque équipe couvre son domaine :

1. **(Admin/Super Admin)** Créez les départements et affectez chaque analyste — *Admin → Départements*.
2. **(Admin/Super Admin)** *Admin → Évaluation groupée* → **Créer l'évaluation groupée**, puis **associez chaque dimension au département qui la porte**. Utilisez le **« ⚡ Affectation tunisienne suggérée »** pour faire les cinq d'un coup, puis ajustez.
3. **(Analystes)** Chaque analyste ouvre son encadré **« Contribuer à l'évaluation groupée »** et répond **uniquement aux dimensions de son département**. Les réponses sont enregistrées automatiquement — plusieurs personnes peuvent travailler en même temps.
4. **(Admin/Super Admin)** Suivez l'avancement et le score en direct, puis cliquez sur **Finaliser et soumettre**. L'évaluation se verrouille et apparaît dans **Soumissions** sous forme de rapport complet.

> Vous préférez qu'une seule personne fasse tout ? C'est possible — un analyste sans département réalise simplement une évaluation solo. Le mode groupé est facultatif.

---

## 7. Remplir une évaluation

Le questionnaire est organisé en **5 dimensions** (grands thèmes), chacune divisée en sous-dimensions, avec **47 indicateurs** (questions) au total.

Pour chaque indicateur :

1. **Lisez la question** et son indice.
2. **Attribuez une note de 1 à 5** — les niveaux sont **1 Initial · 2 Émergent · 3 Défini · 4 Géré · 5 Optimisé**. Vous hésitez ? Ouvrez **« Grille de notation de cet indicateur »** pour voir la description des cinq niveaux.
3. **Ajoutez une preuve** (recommandé) dans le champ *Référence de preuve* — une note de ce qui justifie votre score.

Trois règles à connaître :

- **Plafond de preuve :** si vous attribuez **3 ou plus sans écrire de preuve**, le score est automatiquement plafonné à **2/5**. Les scores élevés doivent être justifiés. Un avertissement s'affiche le cas échéant.
- **Ignorer un indicateur :** vous pouvez ignorer un indicateur auquel vous ne pouvez vraiment pas répondre, via le lien *« Ignorer cet indicateur »* — mais seulement un nombre limité par dimension (environ 20 % des questions de chaque dimension).
- **Les indicateurs BCT ne peuvent pas être ignorés.** Les questions marquées d'un badge **BCT** sont réglementaires et obligatoires.

Naviguez avec **← Précédent** et **Suivant →**. Un compteur indique combien des 47 vous avez traités.

**Terminer :** une fois chaque indicateur noté ou ignoré, une bannière verte **« Évaluation terminée »** apparaît avec un bouton **« Voir les résultats → »**. (Avant cela, les onglets Résultats, Analyse des écarts et Conformité restent verrouillés avec un cadenas.)

En **mode groupé**, vous ne remplissez que les dimensions de votre département ; une fois terminé, vous verrez *« Votre partie est terminée »* — votre coordinateur finalise l'ensemble.

---

## 8. Lire ses résultats et exporter le rapport

Une fois l'évaluation terminée, trois pages de rapport se débloquent :

### Résultats
Votre rapport principal. Il comprend :
- Un **résumé exécutif** rédigé automatiquement (maturité globale en %, niveau, point fort et principal écart).
- Votre **indice de maturité global** (un score sur 5, associé à un niveau d'*Initial* à *Optimisé*).
- Un **graphique radar** et les **scores par dimension**.
- Un sélecteur **« Définir le niveau de maturité cible »** (par défaut **Niveau 3 – Défini**) — il fixe l'objectif auquel l'analyse des écarts se compare.
- Des indicateurs clés : nombre d'indicateurs notés, ignorés, votre **conformité BCT** et vos **écarts critiques**.
- Boutons : **↑ Soumettre pour revue** (envoie votre évaluation solo à vos administrateurs) et **⤓ Enregistrer en PDF**.

### Analyse des écarts
Votre **feuille de route d'amélioration** : un tableau priorisé de ce qu'il faut corriger, une matrice effort/impact et un **plan en 3 phases**. Vous pouvez cliquer sur **« ✦ Générer des actions IA »** pour des recommandations sur mesure. Exportez avec **⤓ Enregistrer en PDF**.

### Conformité
Votre **statut réglementaire BCT** : votre taux de conformité, votre exposition au risque (Faible / Moyenne / Élevée) et un tableau complet de chaque indicateur réglementaire avec son statut. Exportez avec **⤓ Enregistrer en PDF** ou **Enregistrer le dossier de preuves BCT**.

> **Pour télécharger un PDF :** cliquez sur **Enregistrer en PDF** — la fenêtre d'impression de votre navigateur s'ouvre ; choisissez « Enregistrer au format PDF » comme destination.

**Où vont les évaluations soumises :** lorsqu'un analyste clique sur *Soumettre pour revue* (ou qu'un coordinateur finalise une évaluation groupée), le rapport apparaît dans **Admin → Soumissions** pour les administrateurs, et dans **Compte → Mes évaluations** de l'analyste.

---

## 9. Gérer son propre compte

Cliquez sur votre **nom** (en haut à droite) pour ouvrir **Mon compte**. Tout le monde peut :

- Modifier son **nom affiché**, sa **photo de profil** et son **numéro de téléphone**.
- Basculer la langue de l'interface entre **English** et **Français**.
- **Changer son mot de passe** (et éventuellement activer la **vérification par SMS**, qui exige un code envoyé par SMS lors d'un changement de mot de passe).

Certains champs sont **en lecture seule** car gérés par votre administrateur : votre **banque**, **département**, **e-mail de connexion**, **poste**, **rôle** et **statut**. Si l'un d'eux est erroné, demandez à la personne qui vous a invité.

---

## 10. Règles et conditions en un coup d'œil

| Règle | Détail |
| ----- | ------ |
| **Accès sur invitation uniquement** | Pas d'auto-inscription. Vous devez être invité par le niveau supérieur. |
| **Invitations à un seul niveau en dessous** | EY → Super Admin → Admin → Analyste. Impossible de sauter un niveau. |
| **La banque est fixée une fois, par EY** | Tout le monde sous un Super Admin en hérite automatiquement. |
| **Seuls les analystes remplissent** | Admins et Super Admins coordonnent et vérifient ; ils ne répondent pas. |
| **L'invité ne saisit pas ses infos** | E-mail, fonction, banque et département sont fixés par l'inviteur. |
| **Vous ne gérez que les niveaux inférieurs** | Et jamais votre propre rôle. |
| **Un score ≥ 3 exige une preuve** | Sinon il est plafonné à 2/5. |
| **Les indicateurs BCT sont obligatoires** | Ils ne peuvent pas être ignorés. |
| **Une évaluation doit être complète à 100 %** | Avant le déblocage de Résultats / Écarts / Conformité. |
| **Une évaluation groupée finalisée est verrouillée** | Elle passe en lecture seule et crée une soumission. |

---

## 11. Questions fréquentes

**Je suis connecté mais je ne vois pas le questionnaire — seulement un espace « Admin ».**
C'est normal. Vous êtes Admin ou Super Admin, et ces rôles coordonnent plutôt qu'ils ne remplissent. Seuls les Analystes voient le questionnaire.

**J'ai invité quelqu'un mais il n'a jamais reçu l'e-mail.**
Vérifiez l'adresse. Les e-mails d'invitation peuvent aussi être retardés par le filtrage. En secours, un administrateur peut renvoyer l'invitation, et la personne peut toujours être ajoutée par l'IT depuis le tableau de bord Supabase.

**Deux personnes du même département peuvent-elles travailler en même temps ?**
Oui, dans une évaluation groupée — mais coordonnez-vous sur qui répond à quoi, pour ne pas vous écraser mutuellement sur une même question.

**Nous avons finalisé l'évaluation groupée par erreur / trop tôt.**
Une évaluation finalisée est verrouillée. Un coordinateur peut **Démarrer une nouvelle évaluation** pour repartir d'un brouillon vierge ; l'ancienne soumission reste enregistrée et peut être supprimée depuis Admin → Soumissions.

**Une personne a quitté la banque. Que faire de son compte ?**
Un Super Admin (ou Admin) peut **Désactiver** le compte depuis Utilisateurs et rôles — la personne ne peut plus se connecter, mais ses contributions sont conservées. Pour un compte fonctionnel (ex. boîte CDO partagée), utilisez **Réinitialiser le mot de passe** pour le transmettre à son successeur.

**Peut-on utiliser l'outil en français ?**
Oui — toute l'interface passe en français depuis **Mon compte → Langue** (ou le sélecteur EN/FR en haut). *Remarque : les questions de l'évaluation elles-mêmes sont actuellement en anglais.*

---

*DataPilot · EY Advisory Tunisie. Pour l'installation technique et la configuration du backend, voir [`docs/SETUP.md`](SETUP.md). Pour le modèle de rôles et de permissions en détail, voir [`docs/ROLES.md`](ROLES.md).*
