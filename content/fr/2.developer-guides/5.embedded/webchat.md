---
title: Web Chat
description: Ajoutez la bulle de chat Digishare sur n'importe quel site avec un seul code. Les visiteurs discutent avec vos agents ou votre bot IA, sans connexion.
---

Le Web Chat ajoute une bulle de chat sur votre site. N'importe quel visiteur peut l'ouvrir et vous écrire, sans compte ni connexion. Les messages arrivent dans votre boîte Livechat comme une conversation WhatsApp ou Telegram, et vos agents ou votre ChatBot répondent en temps réel.

::note
**Web Chat ou Chat intégré ?** Utilisez le **Web Chat** pour les visiteurs publics d'un site (boutique, restaurant, landing page). Utilisez le [Chat intégré](/fr/developer-guides/embedded/embedded_chat_docs) quand vos propres utilisateurs connectés discutent depuis votre application.
::

## Fonctionnement

1. Un visiteur ouvre une page de votre site et la bulle se charge.
2. La bulle vérifie auprès de Digishare que ce site est autorisé.
3. Le visiteur écrit ; le message ouvre une conversation dans votre boîte Livechat.
4. Un agent ou votre ChatBot répond, et la réponse s'affiche dans la bulle en temps réel.

- La session du visiteur reste dans son navigateur pendant 30 jours : la conversation survit au rechargement de la page.
- Les visiteurs peuvent envoyer du texte, des fichiers (PDF, Word, Excel, images, jusqu'à 15 Mo) et des notes vocales.
- La bulle ne fonctionne que sur les sites que vous autorisez. Tout autre site est refusé.

## 1. Créer le canal Web Chat

Dans le tableau de bord Digishare, ouvrez **Providers**, ajoutez un provider **Web Chat** et remplissez :

| Champ | Quoi mettre |
| --- | --- |
| **Allowed Domains** | Chaque adresse de site où la bulle apparaîtra, ex. `https://example.com`. Jusqu'à 50. |
| **Welcome Message** | Le premier message que voit le visiteur, ex. « Bonjour ! Comment pouvons-nous vous aider ? » |
| **Language** | `fr`, `en` ou `ar`. |
| **Primary Color** | La couleur de votre marque, ex. `#4f46e5`. |
| **Widget Position** | Coin `right` (droite) ou `left` (gauche). |
| **Logo URL** / **Avatar URL** | Images facultatives affichées dans la fenêtre de chat. |

Enregistrez. La page du provider affiche alors le bloc **Web Chat Installation** avec votre **Channel ID** et un code prêt à copier.

::warning
Les domaines autorisés doivent correspondre exactement. `https://example.com` et `https://www.example.com` sont deux sites différents : ajoutez les deux si votre site répond sur les deux. Pas de chemin ni de slash final.
::

## 2. Ajouter le code sur votre site

Collez ce code juste avant la balise `</body>` de chaque page où la bulle doit apparaître, avec votre propre channel ID :

```html
<script src="https://rfs-ui.digishare.ma/cdn/chatbox/webchat.js"></script>
<script>
  DigishareWebChat.init({
    channelId: "VOTRE_CHANNEL_ID",
    locale: "fr",
    position: "right",
  });
</script>
```

| Option | Description |
| --- | --- |
| `channelId` | Votre Channel ID depuis la page du provider. Obligatoire. |
| `locale` | Langue du widget : `fr`, `en` ou `ar`. |
| `position` | `right` ou `left`. |

Les couleurs, le logo, l'avatar et le message d'accueil viennent des réglages du provider. Modifiez-les dans le tableau de bord, sans retoucher le site.

## 3. Répondre automatiquement avec un ChatBot

Les conversations vont dans le pôle / modèle de salon choisi dans la section **Provider Poles** de la page du provider. Pour qu'un bot IA réponde aux visiteurs, attachez un ChatBot à ce modèle dans la page **Chat Bots**.

Sans modèle, les messages arrivent quand même dans Livechat, mais seuls vos agents peuvent répondre.

## Piloter le widget depuis votre site

Vos propres scripts peuvent contrôler la bulle :

| Méthode | Description |
| --- | --- |
| `DigishareWebChat.open()` / `close()` / `toggle()` | Ouvre ou ferme la fenêtre de chat. |
| `DigishareWebChat.show()` / `hide()` | Affiche ou masque la bulle elle-même. |
| `DigishareWebChat.identify(visitorId)` | Lie la session à votre propre identifiant utilisateur, ex. après connexion. |
| `DigishareWebChat.reset()` | Efface la session et démarre une nouvelle conversation. |

Exemple : ouvrir le chat depuis votre propre bouton « Contactez-nous ».

```html
<button onclick="DigishareWebChat.open()">Contactez-nous</button>
```

## Pour les agences et plateformes

Si vous créez des sites pour plusieurs clients (restaurants, boutiques), deux options :

- **Un canal par client** : chaque client a son propre provider Web Chat, sa marque et son ChatBot. Idéal quand chaque client répond à ses propres visiteurs.
- **Un canal partagé** : listez tous les sites clients dans **Allowed Domains** (jusqu'à 50). Toutes les conversations arrivent dans la même boîte et le même ChatBot répond.
