---
navigation:
  title: Vue d'ensemble
title: Pièces jointes
description: Envoyez des images, vidéos, fichiers audio et documents dans une conversation avec l'API d'événements, par lien ou comme fichier.
icon: i-mdi-paperclip
---

Les images, vidéos, fichiers audio et documents sont envoyés avec l'[API d'événements](/fr/developer-guides/livechat/conversation/send-message-conversation) : `POST https://api-app.digishare.ma/v1/event/conversation_message`. Il y a deux façons de joindre un fichier.

|                                       | **Par lien**                                                       | **Comme fichier (base64)**                            |
| :------------------------------------ | :----------------------------------------------------------------- | :---------------------------------------------------- |
| **Vous envoyez**                      | Un lien HTTPS public dans `body.link`                              | Le fichier lui-même, encodé en base64, dans `file.base64` |
| **Traitement**                        | File d'attente : `202` aussitôt                                    | File d'attente : `202` aussitôt                       |
| **Digishare conserve le fichier**     | Non                                                                | Oui                                                   |
| **Visible dans l'inbox Digishare**    | Non : les agents voient une bulle vide                             | Oui                                                   |
| **Types de fournisseur**              | WhatsApp uniquement (`whatsapp`, `centrelatio`, `whatsapp_web`)    | Tous                                                  |
| **`type` du message**                 | Vous le définissez                                                 | Détecté à partir du fichier                           |
| **Légende (texte avec le fichier)**   | `body.caption`                                                     | `file.caption`                                        |
| **Limite de taille**                  | Aucune côté Digishare : WhatsApp récupère le fichier et applique ses propres limites | Environ 700 Ko (1 Mo par événement)   |

::tip
Utilisez un **lien** pour les gros fichiers, les envois à fort volume, ou quand vos fichiers sont déjà hébergés et que les agents n'ont pas besoin de les voir dans l'inbox. Envoyez un **fichier** quand les agents doivent le voir dans l'inbox, ou quand il est petit (moins de 700 Ko environ) et hébergé nulle part.
::

## Envoi par lien

Placez un lien HTTPS public dans `body` et définissez le `type` de la pièce jointe. Digishare ne télécharge ni ne conserve le fichier : il transmet le lien à WhatsApp, qui récupère lui-même le fichier.

**Point de terminaison** : `POST https://api-app.digishare.ma/v1/event/conversation_message`

| Champ                    | Type    | Requis    | Description                                                                                                  |
| :----------------------- | :------ | :-------- | :----------------------------------------------------------------------------------------------------------- |
| `type`                   | String  | **Oui**   | `image`, `video`, `audio`, `document` ou `sticker`. Digishare n'inspecte pas le lien : il doit correspondre au fichier. |
| `body.link`              | String  | **Oui**   | Lien HTTPS public vers le fichier. WhatsApp doit pouvoir y accéder sans connexion.                           |
| `body.filename`          | String  | Non       | Documents uniquement. Le nom que voit le client, extension comprise (`facture.pdf`).                         |
| `body.caption`           | String  | Non       | Texte affiché sous le fichier, dans le même message. Images, vidéos et documents uniquement. Voir [Texte avec une pièce jointe](#texte-avec-une-pièce-jointe). |
| `conversation_id`        | String  | **Oui**\* | La conversation. Voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation) pour l'alternative avec `recipient_id`.                   |
| `send_to_third`          | Boolean | Non       | `true` par défaut.                                                                                           |

\* Ou `recipient_id` + `channel` (+ `api_provider_instance_id`), comme décrit sur [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation).

::api-playground
---
method: POST
url: "https://api-app.digishare.ma/v1/event/conversation_message"
headers:
  Authorization: "Bearer VOTRE_TOKEN"
  Content-Type: "application/json"
body:
  event_type: "conversation_message"
  conversation_id: "CONV_123"
  send_to_third: true
  type: "document"
  body:
    link: "https://example.com/files/facture-2026-001.pdf"
    filename: "facture-2026-001.pdf"
responseSample:
  event_id: "2633736349319958528"
  status: "accepted"
  timestamp: "2026-10-02T20:55:33.894921622Z"
---
::

::warning
**Choisissez le bon `type`.** Avec un lien, il n'y a pas de détection du type. Un sticker WebP doit être envoyé avec `type: "sticker"`, et un PDF avec `type: "document"`. Si le `type` ne correspond pas au fichier, WhatsApp le rejette.
::

::warning
**Non visible dans l'inbox.** Le message est livré au client, mais l'inbox Digishare n'a aucun fichier à prévisualiser : les agents voient donc une bulle vide. Envoyez-le comme fichier quand les agents doivent le voir.
::

## Envoyer un fichier (base64)

Placez le fichier dans `file` au lieu d'un lien dans `body`. Digishare le conserve, l'affiche dans l'inbox et détecte son type.

**Endpoint** : `POST https://api-app.digishare.ma/v1/event/conversation_message`

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "body": "",
  "file": {
    "base64": "JVBERi0xLjQK...",
    "file_name": "facture-2026-001.pdf",
    "caption": "Votre facture d'octobre, merci !"
  }
}
```

Chaque champ, la limite de taille, les types de fichiers autorisés, ce qui arrive à un fichier refusé et un exemple curl complet se trouvent sur [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation#envoyer-un-fichier-base64).

## Types pris en charge

| Type         | Formats                                   | Référence                                                                             |
| :----------- | :---------------------------------------- | :------------------------------------------------------------------------------------ |
| **Image**    | JPEG, PNG                                 | [Message Image](/fr/developer-guides/livechat/outgoing-messages/attachments/image_message)       |
| **Vidéo**    | MP4, 3GPP (vidéo H.264, audio AAC)        | [Message Vidéo](/fr/developer-guides/livechat/outgoing-messages/attachments/video_message)        |
| **Audio**    | AAC, AMR, MP3, M4A, OGG (Opus)            | [Message Audio](/fr/developer-guides/livechat/outgoing-messages/attachments/audio_message)        |
| **Document** | PDF, DOCX, XLSX, PPTX, TXT, CSV, ZIP, ... | [Message Document](/fr/developer-guides/livechat/outgoing-messages/attachments/document_message)  |
| **Sticker**  | WebP                                      | Voir [Détection du type](#détection-du-type)                                          |

::note
**Comme fichier**, Digishare accepte les PDF ; les images JPEG, PNG, WebP et GIF ; les vidéos MP4 et 3GP ; l'audio OGG, MP3, M4A, AAC et AMR ; DOC, DOCX, XLS, XLSX, PPT et PPTX ; TXT et CSV. C'est le contenu qui décide, pas le nom, et tout autre type est refusé. **Par lien**, Digishare ne vérifie rien : c'est WhatsApp qui décide.
::

## Limites de taille des fichiers

Pour un **fichier**, la limite de l'événement s'applique d'abord (1 Mo par événement, soit environ 700 Ko de fichier), puis celle du type de fournisseur derrière la conversation : la **plus basse** l'emporte. Pour un **lien**, Digishare ne télécharge rien : seules les limites du fournisseur s'appliquent, car WhatsApp récupère lui-même le fichier et refuse celui qui est trop volumineux.

### Limites par type de fournisseur

Le type de fournisseur est le type de l'instance de fournisseur d'API à laquelle appartient la conversation : l'`api_provider_instant_id` de la conversation, listé sous **Paramètres Avancés > API Provider** dans le tableau de bord.

| Type de fournisseur                | Code           | Image  | Vidéo  | Audio  | Document | Sticker                          |
| :--------------------------------- | :------------- | :----- | :----- | :----- | :------- | :------------------------------- |
| **API WhatsApp**              | `whatsapp`     | 5 Mo   | 16 Mo  | 16 Mo  | 100 Mo   | 100 Ko statique, 500 Ko animé    |
| **API WhatsApp** (numéro partagé)        | `centrelatio`  | 5 Mo   | 16 Mo  | 16 Mo  | 100 Mo   | 100 Ko statique, 500 Ko animé    |
| **WhatsApp Business** ou **Messenger** (lié par QR)      | `whatsapp_web` | 100 Mo* | 100 Mo* | 100 Mo* | 100 Mo*   | 100 Mo*                           |
| **Telegram**                       | `telegram`     | 10 Mo  | 50 Mo  | 50 Mo  | 50 Mo    | Règles des stickers Telegram     |
| **Messenger**                      | `messenger`    | 25 Mo  | 25 Mo  | 25 Mo  | 25 Mo    | Non pris en charge               |
| **Web Chat**                       | `web_chat`     | 100 Mo | 100 Mo | 100 Mo | 100 Mo   | 100 Mo                           |

- **API WhatsApp et numéro partagé** : Digishare vérifie la taille avant l'envoi et rejette un fichier trop volumineux au lieu de l'envoyer.
- **WhatsApp Business et Messenger (liés par QR)** : aucun des plafonds par type de l'API WhatsApp ne s'applique. Les 100 Mo* sont la limite de Digishare (aussi celle de la passerelle), pas une promesse que WhatsApp livrera le fichier : WhatsApp peut refuser de très gros médias.
- **Telegram et Messenger** : ce sont les limites propres au fournisseur (API Bot Telegram, Meta). Digishare ne les vérifie pas au préalable : un fichier trop volumineux est accepté par Digishare puis refusé par le fournisseur.
- **Web Chat** : aucune limite de fournisseur ne s'applique quand vous écrivez à un visiteur ; pour un fichier, la limite de l'événement s'applique toujours. Les fichiers qu'un visiteur envoie depuis le widget sont limités à 15 Mo par défaut.

## Détection du type

Pour un fichier envoyé en base64, vous ne déclarez jamais le type de la pièce jointe. Digishare inspecte son contenu et choisit à la fois son mode de livraison et le `type` enregistré sur le message.

| Fichier                                      | Livré sur WhatsApp comme | `type` dans les réponses et webhooks |
| :------------------------------------------- | :----------------------- | :----------------------------------- |
| JPEG, PNG                                    | Image                    | `image`                              |
| WebP                                         | **Sticker**              | `webp`                               |
| MP4, 3GPP                                    | Vidéo                    | `video`                              |
| OGG, MP3, M4A, AAC, AMR                      | Audio                    | `audio`                              |
| PDF                                          | Document                 | `pdf`                                |
| Tout le reste (DOCX, XLSX, TXT, CSV, ...)   | Document                 | `other`                              |

::warning
Une **image WebP est livrée comme sticker**, pas comme photo, et les stickers ont une limite de taille bien plus basse. Convertissez en JPEG ou PNG pour obtenir une image classique.
::

## Texte avec une pièce jointe

Ajoutez une **légende** à une image, une vidéo ou un document et elle arrive dans le **même message**, sous le fichier.

| Façon d'envoyer | Champ                                                                     |
| :-------------- | :------------------------------------------------------------------------ |
| Par lien        | `body.caption`                                                            |
| Comme fichier   | `file.caption`, ou un `body` non vide quand `file.caption` est absent     |

Par lien :

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "send_to_third": true,
  "type": "document",
  "body": {
    "link": "https://example.com/files/facture-2026-001.pdf",
    "filename": "facture-2026-001.pdf",
    "caption": "Votre facture d'octobre, merci !"
  }
}
```

Comme fichier :

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "body": "",
  "file": {
    "base64": "JVBERi0xLjQK...",
    "file_name": "facture-2026-001.pdf",
    "caption": "Votre facture d'octobre, merci !"
  }
}
```

- **Quels fichiers :** images, vidéos et documents (PDF et autres fichiers). Les fichiers audio et les stickers n'acceptent pas de légende : elle est ignorée et le fichier est livré sans elle.
- **Longueur :** jusqu'à 1024 caractères ; un texte plus long est coupé. Les espaces au début et à la fin sont retirés. Les emojis et le texte arabe sont acceptés.
- **Optionnel :** un message sans `caption` est envoyé exactement comme avant.
- **Fournisseurs :** vérifié sur les numéros WhatsApp Business et Messenger (liés par QR), où le fichier et la légende arrivent dans un seul message. L'API WhatsApp prend les légendes en charge nativement et reçoit le même champ, mais nous ne l'avons pas encore testé. Sur les autres types de fournisseur, envoyez le texte dans un second message.

### Avec des boutons de réponse

Pour envoyer un fichier, du texte et au moins un bouton de réponse dans un seul message, utilisez un message interactif qui porte le média en en-tête et votre texte en corps.

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "send_to_third": true,
  "type": "interactive",
  "body": {
    "type": "button",
    "header": { "type": "image", "image": { "link": "https://example.com/images/promo.jpg" } },
    "body": { "text": "Votre texte ici" },
    "action": {
      "buttons": [ { "type": "reply", "reply": { "id": "ok", "title": "OK" } } ]
    }
  }
}
```

La façon dont le message interactif arrive dépend du type de fournisseur :

| Type de fournisseur                                | Ce que reçoit le client                                                                                                                                       |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API WhatsApp** (`whatsapp`, `centrelatio`)       | Un seul message : le média, votre texte et les boutons.                                                                                                       |
| **WhatsApp Business / Messenger** (`whatsapp_web`) | **Deux messages** : d'abord le média, puis votre texte avec les boutons sous forme de menu numéroté (« Reply with a number »). Les boutons sont émulés sur les numéros liés par QR. |
| Autres types de fournisseur                        | Envoyez plutôt deux messages.                                                                                                                                 |

::note
L'en-tête peut être une `image`, une `video` ou un `document` ; les fichiers audio et les stickers ne peuvent pas être un en-tête. Seuls les messages à boutons de réponse conservent un en-tête média : les menus liste le suppriment. Sur l'API WhatsApp, un message interactif est soumis à la fenêtre de 24 heures.
::

## À savoir

::note
**`202` signifie mis en file d'attente.** L'API d'événements répond dès que l'événement est accepté, pas quand le message est créé ou livré. Utilisez l'`event_id` pour retrouver le message ensuite : voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation#réponse).
::

::warning
**Un fichier refusé ne crée aucun message.** Un fichier est vérifié après le `202` : si son type n'est pas autorisé, si le base64 est invalide ou s'il est trop volumineux, vous ne recevez aucune erreur et rien n'est envoyé. Vérifiez le fichier de votre côté avant l'envoi.
::

::note
**Fenêtre de 24 heures.** Sur l'API WhatsApp, une pièce jointe envoyée plus de 24 heures après le dernier message du client peut être restreinte. Les numéros WhatsApp Business et Messenger (liés par QR) n'ont pas cette fenêtre. Voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation).
::

::warning
**Les numéros liés par QR sont limités en débit.** Les numéros WhatsApp Business et Messenger envoient via une passerelle qui protège le numéro. Par défaut, elle accepte une rafale de 5 messages, puis environ 12 par minute, avec une courte pause aléatoire entre les messages, et un plafond quotidien qui grandit avec l'ancienneté du lien (30 messages par jour les 3 premiers jours, 100 jusqu'au 7e jour, puis 500). Un message au-delà d'une limite n'est pas envoyé immédiatement mais réessayé plus tard : une rafale de pièces jointes peut donc arriver avec plusieurs minutes de retard. Ce sont des valeurs par défaut et votre configuration peut différer.
::
