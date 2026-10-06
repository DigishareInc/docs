---
navigation:
  title: Vue d'ensemble
title: Pièces jointes
description: Envoyez des images, vidéos, fichiers audio et documents dans une conversation, par lien ou par upload.
icon: i-mdi-paperclip
---

Les images, vidéos, fichiers audio et documents peuvent être envoyés de deux façons.

|                                       | **Par lien** (API d'événements, recommandé)                       | **Par upload** (API Messages)                         |
| :------------------------------------ | :---------------------------------------------------------------- | :---------------------------------------------------- |
| **Endpoint**                          | `POST https://api-app.digishare.ma/v1/event/conversation_message` | `POST https://api.digishare.ma/v1/messages`           |
| **Vous envoyez**                      | Un lien HTTPS public dans `body`                                  | Le fichier lui-même (`url` ou `base64`) dans `file`   |
| **Traitement**                        | File d'attente : `202` aussitôt                                   | Synchrone : renvoie le message créé                   |
| **Digishare conserve le fichier**     | Non                                                               | Oui                                                   |
| **Visible dans l'inbox Digishare**    | Non : les agents voient une bulle vide                            | Oui                                                   |
| **Types de fournisseur**              | WhatsApp uniquement (`whatsapp`, `centrelatio`, `whatsapp_web`)   | Tous                                                  |
| **`type` du message**                 | Vous le définissez                                                | Détecté à partir du fichier                           |
| **Légende (texte avec le fichier)**   | `body.caption`                                                    | `file.caption`                                        |
| **Messages vocaux (API WhatsApp) et `reply_to`** | Non                                                    | Oui                                                   |
| **Limite de taille Digishare**        | Aucune : WhatsApp récupère le fichier et applique ses propres limites | 100 Mo                                            |

::tip
Utilisez un **lien** pour les envois à fort volume, ou quand vos fichiers sont déjà hébergés et que les agents n'ont pas besoin de les voir dans l'inbox. Utilisez un **upload** quand les agents doivent voir le fichier dans l'inbox, que vous n'avez que les octets du fichier, que vous avez besoin d'un message vocal (API WhatsApp uniquement), ou que le fournisseur est Telegram ou Messenger.
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
**Non visible dans l'inbox.** Le message est livré au client, mais l'inbox Digishare n'a aucun fichier à prévisualiser : les agents voient donc une bulle vide. Utilisez un upload quand les agents doivent voir le fichier.
::

## Envoi par upload

::warning
**Prérequis** : `conversation_id` est requis sur ce point de terminaison. Voir [Intégration LiveChat](/fr/developer-guides/livechat/integration).
::

Passez un objet **`file`** à la place d'un `body` texte. Digishare enregistre le fichier, détecte son type et le livre sur le canal du client.

**Point de terminaison** : `POST https://api.digishare.ma/v1/messages`

### Corps de la Requête

| Paramètre         | Type    | Requis  | Description                                                                                              |
| :---------------- | :------ | :------ | :------------------------------------------------------------------------------------------------------- |
| `conversation_id` | String  | **Oui** | ID de la conversation : issu de l'événement webhook, ou de [Créer une conversation](/fr/developer-guides/livechat/conversation/create-conversation).             |
| `send_to_third`   | Boolean | **Oui** | Mettre à `true` pour livrer le fichier à la plateforme de l'utilisateur (par ex. WhatsApp).              |
| `file`            | Object  | **Oui** | La pièce jointe. Voir [L'objet file](#lobjet-file). Remplace `body`.                                     |
| `reply_to`        | String  | Non     | ID d'un message de la même conversation à citer.                                                         |
| `type`            | String  | Non     | Inutile. Le type du message est détecté à partir du fichier (voir [Détection du type](#détection-du-type)). |

::tip
**Pas encore d'ID de conversation ?** Appelez [Créer une conversation](/fr/developer-guides/livechat/conversation/create-conversation) avec votre instance de fournisseur et le numéro du destinataire, puis utilisez l'`id` renvoyé. Par défaut, cet appel archive d'abord la conversation active du client ; passez `archive_active_conversation: false` pour la réutiliser.
::

### L'objet file

Fournissez **une** source, soit `url`, soit `base64`.

| Champ       | Type    | Requis | Description                                                                                                                                      |
| :---------- | :------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | String  | L'un   | Lien `http(s)` public vers le fichier. Digishare le télécharge, il doit donc être accessible depuis Internet.                                    |
| `base64`    | String  | L'autre | Le fichier sous forme de data URI, par ex. `data:image/jpeg;base64,/9j/4AAQ...`. À utiliser quand le fichier n'est pas hébergé publiquement.   |
| `file_name` | String  | Non    | Nom du fichier. Pour les documents, c'est le nom que voit le client : incluez l'extension (`facture.pdf`).                                       |
| `extension` | String  | Non    | Ajoutée à `file_name`. Ne la renseignez pas si `file_name` se termine déjà par l'extension, sinon vous obtiendrez `facture.pdf.pdf`.             |
| `caption`   | String  | Non    | Texte affiché sous le fichier, dans le même message. Images, vidéos et documents uniquement. Voir [Texte avec une pièce jointe](#texte-avec-une-pièce-jointe). |
| `voice`     | Boolean | Non    | Audio uniquement. Demande un message vocal WhatsApp. Fonctionne uniquement sur l'API WhatsApp : voir [Message Audio](/fr/developer-guides/livechat/outgoing-messages/attachments/audio_message). |
| `duration`  | Number  | Non    | Audio uniquement. Durée en secondes, enregistrée avec le message.                                                                                |

#### Envoyer un fichier depuis une URL

::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/messages"
headers:
  Authorization: "Bearer VOTRE_TOKEN"
  Content-Type: "application/json"
body:
  send_to_third: true
  conversation_id: "CONV_123"
  file:
    url: "https://example.com/files/facture-2026-001.pdf"
    file_name: "facture-2026-001.pdf"
responseSample:
  data:
    object: "Message"
    id: "MSG_ID"
    conversation_id: "CONV_123"
    type: "pdf"
    body:
      id: 48213
      name: "facture-2026-001"
      file_name: "facture-2026-001.pdf"
      mime_type: "application/pdf"
      extension: "pdf"
      size: 91204
      type: "pdf"
      url: "companies/public/message/48213/facture-2026-001.pdf"
      path: "companies/public/message/48213/facture-2026-001.pdf"
    send_to_third: true
    system: false
    status: "sent"
---
::

#### Envoyer un fichier en base64

```json
{
  "send_to_third": true,
  "conversation_id": "CONV_123",
  "file": {
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "file_name": "photo.jpg"
  }
}
```

::tip
Le base64 alourdit la requête d'environ un tiers. Pour les fichiers de plus de quelques mégaoctets, hébergez le fichier et utilisez `url`.
::

## Types pris en charge

| Type         | Formats                                   | Référence                                                                             |
| :----------- | :---------------------------------------- | :------------------------------------------------------------------------------------ |
| **Image**    | JPEG, PNG                                 | [Message Image](/fr/developer-guides/livechat/outgoing-messages/attachments/image_message)       |
| **Vidéo**    | MP4, 3GPP (vidéo H.264, audio AAC)        | [Message Vidéo](/fr/developer-guides/livechat/outgoing-messages/attachments/video_message)        |
| **Audio**    | AAC, AMR, MP3, M4A, OGG (Opus)            | [Message Audio](/fr/developer-guides/livechat/outgoing-messages/attachments/audio_message)        |
| **Document** | PDF, DOCX, XLSX, PPTX, TXT, CSV, ZIP, ... | [Message Document](/fr/developer-guides/livechat/outgoing-messages/attachments/document_message)  |
| **Sticker**  | WebP                                      | Voir [Détection du type](#détection-du-type)                                          |

## Limites de taille des fichiers

Pour un **upload**, deux limites s'appliquent : celle de Digishare, et celle du type de fournisseur derrière la conversation. La **plus basse** l'emporte. Pour un **lien**, Digishare ne télécharge rien : seules les limites du fournisseur s'appliquent, car WhatsApp récupère lui-même le fichier et rejette un fichier trop volumineux.

### Limite Digishare

**100 Mo par fichier**, pour tous les types de fournisseur et tous les types de fichier. L'API refuse un corps de requête de plus de 100 Mo avec un HTTP `413` (une page d'erreur HTML de la passerelle, pas du JSON).

- Avec `url`, Digishare télécharge le fichier pendant le traitement de votre requête : hébergez-le sur un serveur rapide et fiable. Les fichiers jusqu'à 104 857 600 octets (100 Mio) sont acceptés. Un fichier de plus de 100 Mo n'est pas enregistré : le message revient sous la forme de l'espace réservé `unsupported file type` décrit dans [À savoir](#à-savoir).
- Avec `base64`, le fichier entier est décodé en mémoire sur le serveur de l'API, et le base64 ajoute environ un tiers à la requête. Lors de nos tests, un fichier de 25 Mo a été accepté, tandis qu'un fichier de 40 Mo a échoué avec un HTTP `500` en laissant un message vide dans la conversation. Utilisez `base64` pour les fichiers jusqu'à 25 Mo et `url` au-delà.

::tip
En cas de doute, hébergez le fichier et utilisez `url`.
::

::note
**API d'événements.** Le point de terminaison d'événements sur `api-app.digishare.ma` n'accepte pas d'uploads : il transporte des liens (voir [Envoi par lien](#envoi-par-lien)). Chaque événement est limité à **1 Mo** ; un événement plus gros est rejeté avec `413 payload_too_large`.
::

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
- **Web Chat** : seule la limite Digishare s'applique quand vous écrivez à un visiteur. Les fichiers qu'un visiteur envoie depuis le widget sont limités à 15 Mo par défaut.

## Détection du type

Pour un upload, vous ne déclarez jamais le type de la pièce jointe. Digishare inspecte le fichier et choisit à la fois son mode de livraison et le `type` enregistré sur le message.

| Fichier                                      | Livré sur WhatsApp comme | `type` dans les réponses et webhooks |
| :------------------------------------------- | :----------------------- | :----------------------------------- |
| JPEG, PNG                                    | Image                    | `image`                              |
| WebP                                         | **Sticker**              | `webp`                               |
| MP4, 3GPP                                    | Vidéo                    | `video`                              |
| OGG, MP3, M4A, AAC, AMR                      | Audio                    | `audio`                              |
| PDF                                          | Document                 | `pdf`                                |
| Tout le reste (DOCX, XLSX, CSV, ZIP, ...)    | Document                 | `other`                              |

::warning
Une **image WebP est livrée comme sticker**, pas comme photo, et les stickers ont une limite de taille bien plus basse. Convertissez en JPEG ou PNG pour obtenir une image classique.
::

## Texte avec une pièce jointe

Ajoutez une **légende** à une image, une vidéo ou un document et elle arrive dans le **même message**, sous le fichier.

| Façon d'envoyer              | Champ          |
| :--------------------------- | :------------- |
| Par lien (API d'événements)  | `body.caption` |
| Par upload (API Messages)    | `file.caption` |

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

Par upload :

```json
{
  "conversation_id": "CONV_123",
  "send_to_third": true,
  "file": {
    "url": "https://example.com/files/facture-2026-001.pdf",
    "file_name": "facture-2026-001.pdf",
    "caption": "Votre facture d'octobre, merci !"
  }
}
```

- **Quels fichiers :** images, vidéos et documents (PDF et autres fichiers). Les fichiers audio et les stickers n'acceptent pas de légende : elle est ignorée et le fichier est livré sans elle.
- **Longueur :** jusqu'à 1024 caractères ; un texte plus long est coupé. Les espaces au début et à la fin sont retirés. Les emojis et le texte arabe sont acceptés.
- **Optionnel :** un message sans `caption` est envoyé exactement comme avant. Pour un upload, `body` reste ignoré quand `file` est présent : utilisez `file.caption`.
- **Fournisseurs :** vérifié sur les numéros WhatsApp Business et Messenger (liés par QR), où le fichier et la légende arrivent dans un seul message. L'API WhatsApp prend les légendes en charge nativement et reçoit le même champ, mais nous ne l'avons pas encore testé. Sur les autres types de fournisseur, envoyez le texte dans un second message.

::note
Dans l'inbox Digishare, la légende s'affiche sous les PDF et les autres documents. Les bulles d'image et de vidéo affichent encore un libellé générique (Photo, Vidéo) à la place de la légende. Le client reçoit la légende dans tous les cas.
::

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
**`body` n'est pas une légende.** Pour un upload, `body` est ignoré quand un `file` est présent. Placez la légende dans `file.caption` : voir [Texte avec une pièce jointe](#texte-avec-une-pièce-jointe).
::

::warning
**Uploads : vérifiez le `type` dans la réponse.** Si Digishare ne peut pas télécharger ou décoder votre fichier (`url` inaccessible, `base64` malformé), l'appel renvoie tout de même `200`, mais le message revient avec `type: "text"` et un `body.name` valant `unsupported file type <file_name>` au lieu d'une pièce jointe. Une pièce jointe réussie renvoie toujours un `type` valant `image`, `video`, `audio`, `pdf`, `webp` ou `other`.
::

::note
**`status: "sent"` ne signifie pas livré.** Sur l'API Messages, la réponse indique `sent` dès que Digishare a accepté le message (`delivery_timeline` vaut alors `null`), y compris pour l'espace réservé ci-dessus. Cela ne signifie pas que le téléphone du client l'a reçu.
::

::note
**Fenêtre de 24 heures.** Sur l'API WhatsApp, une pièce jointe envoyée plus de 24 heures après le dernier message du client peut être restreinte. Les numéros WhatsApp Business et Messenger (liés par QR) n'ont pas cette fenêtre. Voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation).
::

::warning
**Les numéros liés par QR sont limités en débit.** Les numéros WhatsApp Business et Messenger envoient via une passerelle qui protège le numéro. Par défaut, elle accepte une rafale de 5 messages, puis environ 12 par minute, avec une courte pause aléatoire entre les messages, et un plafond quotidien qui grandit avec l'ancienneté du lien (30 messages par jour les 3 premiers jours, 100 jusqu'au 7e jour, puis 500). Un message au-delà d'une limite n'est pas envoyé immédiatement mais réessayé plus tard : une rafale de pièces jointes peut donc arriver avec plusieurs minutes de retard. Ce sont des valeurs par défaut et votre configuration peut différer.
::
