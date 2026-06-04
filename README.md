# 🎫 TicketVerif

Site de vérification de tickets de recharge (Transcash, PCS, Neosurf, Paysafecard...).

## Fonctionnalités

- Soumission de tickets via formulaire (opérateur, montant, code)
- Notification email automatique à l'utilisateur à la soumission
- Panel admin pour valider ou refuser les tickets
- Notification email du résultat à l'utilisateur
- Suivi de demande par référence

## Installation locale

```bash
npm install
cp .env.example .env
# Remplissez les variables dans .env
node server.js
```

## Déploiement sur Render

1. Pushez ce dépôt sur GitHub
2. Créez un Web Service sur [render.com](https://render.com)
3. Build Command : `npm install`
4. Start Command : `node server.js`
5. Ajoutez les variables d'environnement (voir `.env.example`)

## Variables d'environnement requises

Voir le fichier `.env.example` pour la liste complète.

## Panel Admin

Accessible sur `/` puis cliquer sur Admin, ou directement `/#admin`.
