---
navigation:
  title: Vue d'ensemble
title: Pièces jointes
description: Envoyez des images, vidéos, fichiers audio et documents dans une conversation avec l'objet file.
icon: i-mdi-paperclip
---

Les images, vidéos, fichiers audio et documents s'envoient tous de la même façon : appelez `POST /v1/messages` et passez un objet **`file`** à la place d'un `body` texte. Digishare enregistre le fichier, détecte son type et le livre sur le canal du client.

::warning
**Prérequis** : Vous devez disposer d'un ID de conversation actif. Voir [Intégration LiveChat](/fr/developer-guides/livechat/integration).
::

**Point de terminaison** : `POST https://api.digishare.ma/v1/messages`

## Corps de la Requête

| Paramètre         | Type    | Requis  | Description                                                                                              |
| :---------------- | :------ | :------ | :------------------------------------------------------------------------------------------------------- |
| `conversation_id` | String  | **Oui** | ID provenant de l'événement webhook.                                                                     |
| `send_to_third`   | Boolean | **Oui** | Mettre à `true` pour livrer le fichier à la plateforme de l'utilisateur (par ex. WhatsApp).              |
| `file`            | Object  | **Oui** | La pièce jointe. Voir [L'objet file](#lobjet-file). Remplace `body`.                                     |
| `reply_to`        | String  | Non     | ID d'un message de la même conversation à citer.                                                         |
| `type`            | String  | Non     | Inutile. Le type du message est détecté à partir du fichier (voir [Détection du type](#détection-du-type)). |

## L'objet file

Fournissez **une** source, soit `url`, soit `base64`.

| Champ       | Type    | Requis | Description                                                                                                                                      |
| :---------- | :------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | String  | L'un   | Lien `http(s)` public vers le fichier. Digishare le télécharge, il doit donc être accessible depuis Internet.                                    |
| `base64`    | String  | L'autre | Le fichier sous forme de data URI, par ex. `data:image/jpeg;base64,/9j/4AAQ...`. À utiliser quand le fichier n'est pas hébergé publiquement.   |
| `file_name` | String  | Non    | Nom du fichier. Pour les documents, c'est le nom que voit le client : incluez l'extension (`facture.pdf`).                                       |
| `extension` | String  | Non    | Ajoutée à `file_name`. Ne la renseignez pas si `file_name` se termine déjà par l'extension, sinon vous obtiendrez `facture.pdf.pdf`.             |
| `voice`     | Boolean | Non    | Audio uniquement. Envoie le fichier comme message vocal WhatsApp. Voir [Message Audio](/fr/developer-guides/livechat/outgoing-messages/attachments/audio_message). |
| `duration`  | Number  | Non    | Audio uniquement. Durée en secondes, enregistrée avec le message.                                                                                |

### Envoyer un fichier depuis une URL

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

### Envoyer un fichier en base64

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

Deux limites s'appliquent à chaque pièce jointe : celle de Digishare, et celle du type de fournisseur derrière la conversation. La **plus basse** l'emporte.

### Limite Digishare

**100 Mo par fichier**, pour tous les types de fournisseur et tous les types de fichier. L'API refuse un corps de requête de plus de 100 Mo avec un HTTP `413`.

- Avec `url`, Digishare télécharge le fichier pendant le traitement de votre requête : hébergez-le sur un serveur rapide et fiable. Un fichier de plus de 100 Mo n'est pas enregistré : le message revient sous la forme de l'espace réservé `unsupported file type` décrit dans [À savoir](#à-savoir).
- Avec `base64`, le fichier entier est décodé en mémoire sur le serveur de l'API, et le base64 ajoute environ un tiers à la requête. Les grosses requêtes base64 peuvent donc échouer bien en dessous de 100 Mo. Réservez `base64` aux petits fichiers (moins de 10 Mo) et utilisez `url` au-delà.

::tip
En cas de doute, hébergez le fichier et utilisez `url`.
::

::note
**API d'événements.** Les points de terminaison d'événements sur `api-app.digishare.ma` (voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation)) ne transportent pas de fichiers, et chaque événement est limité à **1 Mo**. Les événements plus gros sont rejetés avec `413 payload_too_large`.
::

### Limites par type de fournisseur

Le type de fournisseur est le type de l'instance de fournisseur d'API à laquelle appartient la conversation : l'`api_provider_instant_id` de la conversation, listé sous **Paramètres Avancés > API Provider** dans le tableau de bord.

| Type de fournisseur                | Code           | Image  | Vidéo  | Audio  | Document | Sticker                          |
| :--------------------------------- | :------------- | :----- | :----- | :----- | :------- | :------------------------------- |
| **WhatsApp Business**              | `whatsapp`     | 5 Mo   | 16 Mo  | 16 Mo  | 100 Mo   | 100 Ko statique, 500 Ko animé    |
| **Numéro WhatsApp partagé**        | `centrelatio`  | 5 Mo   | 16 Mo  | 16 Mo  | 100 Mo   | 100 Ko statique, 500 Ko animé    |
| **WhatsApp Web** (lié par QR)      | `whatsapp_web` | 100 Mo | 100 Mo | 100 Mo | 100 Mo   | 100 Mo                           |
| **Telegram**                       | `telegram`     | 10 Mo  | 50 Mo  | 50 Mo  | 50 Mo    | Règles des stickers Telegram     |
| **Messenger**                      | `messenger`    | 25 Mo  | 25 Mo  | 25 Mo  | 25 Mo    | Non pris en charge               |
| **Web Chat**                       | `web_chat`     | 100 Mo | 100 Mo | 100 Mo | 100 Mo   | 100 Mo                           |

- **WhatsApp Business et numéro partagé** : Digishare vérifie la taille avant l'envoi et rejette un fichier trop volumineux au lieu de l'envoyer.
- **WhatsApp Web** : aucun des plafonds par type de WhatsApp Business ne s'applique ; seule la limite Digishare de 100 Mo (aussi celle de la passerelle) joue. WhatsApp peut tout de même refuser de très gros médias.
- **Telegram et Messenger** : ce sont les limites propres au fournisseur (API Bot Telegram, Meta). Digishare ne les vérifie pas au préalable : un fichier trop volumineux est accepté par Digishare puis refusé par le fournisseur.
- **Web Chat** : seule la limite Digishare s'applique quand vous écrivez à un visiteur. Les fichiers qu'un visiteur envoie depuis le widget sont limités à 15 Mo par défaut.

## Détection du type

Vous ne déclarez jamais le type de la pièce jointe. Digishare inspecte le fichier et choisit à la fois son mode de livraison et le `type` enregistré sur le message.

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

## À savoir

::warning
**Pas de légende sur WhatsApp.** Le champ `body` est ignoré lorsqu'un `file` est présent, et les messages WhatsApp sont livrés sans légende. Pour ajouter du texte, envoyez un [Message Texte](/fr/developer-guides/livechat/outgoing-messages/text_message) juste après le fichier.
::

::warning
**Vérifiez le `type` dans la réponse.** Si Digishare ne peut pas télécharger ou décoder votre fichier (`url` inaccessible, `base64` malformé), l'appel renvoie tout de même `200`, mais le message revient avec `type: "text"` et un `body.name` valant `unsupported file type <file_name>` au lieu d'une pièce jointe. Une pièce jointe réussie renvoie toujours un `type` valant `image`, `video`, `audio`, `pdf`, `webp` ou `other`.
::

::note
**`status: "sent"` ne signifie pas livré.** La réponse indique `sent` dès que Digishare a accepté le message (`delivery_timeline` vaut alors `null`), y compris pour l'espace réservé ci-dessus. Cela ne signifie pas que le téléphone du client l'a reçu.
::

::note
**Fenêtre de 24 heures.** Comme tout message libre, une pièce jointe envoyée plus de 24 heures après le dernier message du client peut être restreinte par votre fournisseur. Voir [Envoyer un Message](/fr/developer-guides/livechat/conversation/send-message-conversation).
::
