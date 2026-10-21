# For New Friends (FNF)

**Une application sociale qui permet de rencontrer de nouvelles personnes près de chez soi, de participer à des événements et de créer de véritables amitiés grâce à une carte interactive et à des expériences partagées.**

## 1. Utilisateur cible

FNF s’adresse aux personnes qui souhaitent élargir leur cercle social, rencontrer de nouvelles personnes et participer à des activités près de chez elles.

### Besoins des utilisateurs
- Rencontrer des personnes qui partagent leurs centres d’intérêt.
- Découvrir des événements et des activités à proximité.
- Trouver facilement des sorties auxquelles participer.
- Créer des amitiés grâce à des expériences vécues ensemble.
- Garder des souvenirs de leurs rencontres et de leurs événements.
- Utiliser une application simple, conviviale et sécurisée.

### Difficultés rencontrées
- Il peut être difficile de rencontrer de nouvelles personnes en dehors de son cercle habituel.
- Les événements sont dispersés sur différentes plateformes.
- Les applications sociales ne facilitent pas toujours les rencontres dans la vie réelle.
- Certains utilisateurs peuvent appréhender les premières rencontres.
- La sécurité et la confidentialité doivent être prises en compte lors des interactions avec des inconnus.

## 2. Fonctionnalités

### 2.1. Indispensable — Must Have

**Création de compte et profil utilisateur**
- Inscription et connexion.
- Création d’un profil avec photo, prénom ou pseudonyme, biographie et centres d’intérêt.
- Modification des informations personnelles.
- Gestion des préférences de confidentialité.

**Carte interactive**
- Affichage des événements et des lieux d’intérêt.
- Consultation des informations d’un événement depuis la carte.
- Possibilité d’autoriser ou de refuser l’accès à la localisation.
- Affichage des événements à proximité selon la position ou la zone recherchée.

**Événements**
- Création et publication d’événements.
- Ajout d’un titre, d’une description, d’une date, d’une heure, d’un lieu et d’une image.
- Consultation des événements disponibles.
- Inscription et désinscription à un événement.
- Affichage des participants, selon les paramètres de confidentialité.

**Système d’amitié**
- Envoi d’une demande d’amitié.
- Acceptation ou refus d’une demande.
- Création d’une amitié uniquement lorsque la demande est acceptée.
- Consultation de la liste de ses amis.
- Suppression d’un ami.

**Sécurité et confidentialité**
- Blocage d’un utilisateur.
- Signalement d’un profil ou d’un contenu.
- Contrôle de la visibilité des informations personnelles.
- Possibilité de masquer sa position exacte.
- Gestion des autorisations liées à la localisation.

**Navigation**
- Interface adaptée aux mobiles.
- Navigation claire entre la carte, les événements, les amis et le profil.
- Affichage des informations essentielles sans complexité inutile.

### 2.2. Important — Should Have

**Messagerie**
- Conversation privée entre amis.
- Envoi de messages textuels.
- Liste des conversations.
- Possibilité de bloquer ou de signaler un utilisateur depuis une conversation.

**Publications et souvenirs**
- Publication de photos et de textes.
- Partage de souvenirs liés à des événements.
- Consultation des publications des amis.
- Suppression de ses propres publications.

**Progression et niveaux**
- Attribution de points d’expérience (XP) pour certaines actions.
- Progression à travers différents niveaux.
- Récompenses symboliques liées à la participation aux événements et à l’activité sur l’application.

**Ajout d’amis par QR code ou NFC**
- Création d’un QR code associé au profil.
- Possibilité de scanner le QR code d’un autre utilisateur.
- Ajout simplifié de contacts lors d’une rencontre physique.
- Utilisation du NFC si les appareils et les conditions techniques le permettent.

**Avis et évaluations**
- Possibilité de laisser un avis après un événement.
- Évaluation de l’expérience vécue.
- Modération des avis abusifs.

### 2.3. Optionnel — Could Have

**Billetterie**
- Réservation de places pour certains événements.
- Gestion des capacités maximales.
- Paiement en ligne si nécessaire.
- Gestion des annulations et remboursements selon les conditions définies.

**Abonnements premium**
- Fonctionnalités supplémentaires pour les utilisateurs abonnés.
- Options de personnalisation avancées.
- Avantages éventuels sur certains événements.

**Partenariats**
- Collaboration avec des lieux, associations, organisateurs et commerces.
- Mise en avant d’événements partenaires.
- Possibilité de proposer des offres spéciales.

**Recommandations personnalisées**
- Suggestions d’événements selon les centres d’intérêt.
- Recommandations basées sur les préférences et les participations précédentes.
- Découverte de nouvelles activités.

**Défis et badges**
- Défis liés à la participation à des événements.
- Badges obtenus en fonction des actions réalisées.
- Récompenses symboliques pour encourager les rencontres.

## 3. Modèle de données

Les données seront structurées pour permettre la gestion des utilisateurs, des événements, des amitiés et des interactions sociales.

### User — Utilisateur
- `id` : identifiant unique.
- `username` : pseudonyme.
- `name` : nom ou prénom affiché.
- `photoURL` : photo de profil.
- `bio` : biographie.
- `interests` : centres d’intérêt.
- `location` : localisation facultative.
- `level` : niveau de progression.
- `xp` : points d’expérience.
- `createdAt` : date de création du compte.

### Friendship — Amitié
- `id` : identifiant de la relation.
- `requesterId` : utilisateur à l’origine de la demande.
- `receiverId` : destinataire de la demande.
- `status` : en attente, acceptée ou refusée.
- `createdAt` : date de création de la demande.

### Event — Événement
- `id` : identifiant unique.
- `title` : titre.
- `description` : description.
- `imageURL` : image principale.
- `organizerId` : organisateur.
- `date` : date et heure.
- `location` : adresse ou lieu.
- `latitude` et `longitude` : coordonnées géographiques.
- `capacity` : capacité maximale.
- `visibility` : visibilité de l’événement.
- `createdAt` : date de publication.

### Participation — Participation à un événement
- `id` : identifiant.
- `eventId` : événement concerné.
- `userId` : participant.
- `status` : inscrit, en attente ou annulé.
- `createdAt` : date d’inscription.

### Message — Messagerie
- `id` : identifiant du message.
- `conversationId` : conversation concernée.
- `senderId` : expéditeur.
- `content` : contenu textuel.
- `createdAt` : date d’envoi.
- `readAt` : date de lecture, si disponible.

### Post — Publication
- `id` : identifiant.
- `authorId` : auteur.
- `content` : texte.
- `mediaURL` : média associé, si présent.
- `eventId` : événement associé, si applicable.
- `createdAt` : date de publication.

### Review — Avis
- `id` : identifiant.
- `eventId` : événement concerné.
- `authorId` : auteur.
- `rating` : note.
- `comment` : commentaire.
- `createdAt` : date de publication.

### Report — Signalement
- `id` : identifiant.
- `reporterId` : auteur du signalement.
- `reportedUserId` : utilisateur concerné, si applicable.
- `contentId` : contenu concerné, si applicable.
- `reason` : motif.
- `status` : état du traitement.
- `createdAt` : date du signalement.

### Progression
- `userId` : utilisateur concerné.
- `xp` : total d’expérience.
- `level` : niveau actuel.
- `badges` : badges obtenus.

## 4. Stack technique

### Outils et technologies utilisés

**Chunk**
- Outil utilisé dans le processus de développement du projet.
- Son rôle précis sera défini selon l’usage retenu dans l’architecture.

**Firebase**
- Gestion de l’authentification.
- Base de données pour les profils, événements, amitiés et interactions.
- Stockage des photos et médias.
- Services complémentaires selon les besoins de l’application.

**Google Stitch**
- Conception et génération d’interfaces utilisateur.
- Exploration de différentes propositions visuelles.
- Préparation des interfaces avant leur intégration.

**Figma**
- Création des maquettes UI/UX.
- Prototypage des parcours utilisateurs.
- Organisation et amélioration du design.
- Préparation des références visuelles pour le développement.

**Claude**
- Assistance à la programmation.
- Aide à la génération, à la compréhension et à la correction du code.
- Aide à la résolution de problèmes techniques.

**CARTO**
- Cartographie et visualisation des informations géographiques.
- Affichage des lieux et des événements sur une carte.
- Exploration des possibilités de représentation géographique des données.

**ChatGPT**
- Structuration du projet et du cahier des charges.
- Aide à la conception des fonctionnalités.
- Assistance à la programmation, à la rédaction et à la résolution de problèmes.

**Vercel**
- Déploiement de l’application.
- Hébergement du frontend et des éléments compatibles avec la plateforme.
- Gestion des déploiements et des versions en ligne.

### Architecture envisagée

- **Interface utilisateur :** application web responsive.
- **Données et authentification :** Firebase.
- **Cartographie :** CARTO.
- **Conception des interfaces :** Stitch et Figma.
- **Assistance au développement :** Claude et ChatGPT.
- **Déploiement :** Vercel.

Les intégrations exactes dépendront de la manière dont les services seront configurés et connectés. Les règles de sécurité devront notamment limiter l’accès aux données privées, aux messages et aux informations de localisation.

## 5. Design

**Outils de conception :** Google Stitch et Figma.

Le design devra être moderne, convivial, intuitif et adapté aux appareils mobiles.

Les principes de conception sont :
- Navigation simple et compréhensible.
- Carte interactive facile à utiliser.
- Événements présentés de manière attractive.
- Profils clairs et personnalisables.
- Mise en avant des rencontres et des expériences partagées.
- Respect de la confidentialité et des préférences de chaque utilisateur.

**Lien Figma :** à ajouter.

## 6. Démo en ligne

**Plateforme de déploiement :** Vercel.

**URL de la démonstration :** à ajouter après le premier déploiement.

## 7. Objectif de la première version

La première version de FNF devra permettre à un utilisateur de :
1. Créer un compte et compléter son profil.
2. Découvrir des événements sur une carte.
3. Consulter les détails d’un événement.
4. S’inscrire à un événement.
5. Envoyer et accepter des demandes d’amitié.
6. Gérer ses paramètres de confidentialité.
7. Signaler ou bloquer un utilisateur.

La messagerie, les souvenirs, les niveaux XP, les QR codes, la billetterie et les abonnements pourront être développés progressivement après validation de cette première version.

## 8. Priorités de développement

1. Concevoir les interfaces principales dans Stitch et Figma.
2. Mettre en place l’authentification et la structure des données dans Firebase.
3. Développer les profils utilisateurs et le système d’amitié.
4. Intégrer la carte CARTO et les événements.
5. Ajouter les inscriptions aux événements.
6. Mettre en place les règles de sécurité et les outils de signalement.
7. Déployer une première version sur Vercel.
8. Tester l’application avec un petit groupe d’utilisateurs.
9. Améliorer l’application à partir des retours avant d’ajouter les fonctionnalités secondaires.
