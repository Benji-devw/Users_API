# Vallena Users API

API pour la gestion des utilisateurs du projet Vallena, construite avec Bun, Fastify, et Mongoose.

## Stack Technique

-   **Runtime:** [Bun](https://bun.sh/)
-   **Framework Web:** [Fastify](https://www.fastify.io/)
-   **Base de données:** [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/)
-   **Langage:** TypeScript (pour `index.ts`) et JavaScript

## Prérequis

-   [Bun](https://bun.sh/docs/installation) installé globalement.

## Installation

1.  Clonez le dépôt (si applicable) ou assurez-vous d'avoir les fichiers du projet.
2.  Installez les dépendances :

```bash
  bun install
```

## Configuration

Créez un fichier `.env` à la racine du projet et ajoutez les variables d'environnement nécessaires.

Exemple de fichier `.env`:

```env
# Chaîne de connexion MongoDB (adaptez selon votre configuration locale ou Atlas)
DATABASE_URL=mongodb://localhost:27017/vallena_users_db

# Clé secrète pour la génération des tokens JWT
JWT_SECRET=votre_super_secret_jwt_a_changer_en_production
```

## Lancer l'application

-   **Mode développement (avec watch) :**

    ```bash
    bun run dev
    ```

    L'API sera généralement accessible sur `http://localhost:8805`.

-   **Mode production :**
    ```bash
    bun run start
    ```

## Endpoints API

Toutes les routes sont préfixées par `/api`.

-   `POST /api/signup` : Créer un nouvel utilisateur.
-   `POST /api/login` : Connecter un utilisateur existant.
-   `GET /api/users` : Récupérer la liste de tous les utilisateurs.
-   `DELETE /api/user/:id` : Supprimer un utilisateur.

## Schémas de Données

-   Le schéma utilisateur principal utilisé par ces routes est défini dans `schema/schemaUser.js`.

## À Faire / Améliorations Potentielles

-   Harmoniser la route de suppression d'utilisateur (`DELETE /api/user`) pour utiliser un paramètre d'URL (ex: `/api/user/:id`) de manière cohérente avec le contrôleur.
-   Finaliser l'intégration de `models/userModel.js` et `controllers/userController.js` ou les supprimer s'ils ne sont plus pertinents par rapport à `schema/schemaUser.js` et `controllers/account/lib.js`.
-   Implémenter une validation plus robuste des entrées (par exemple avec les schémas de validation de Fastify).
-   Ajouter des tests.
