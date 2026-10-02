---
navigation:
  title: Overview
title: Attachments
description: Send images, videos, audio and documents to a conversation, by link or by upload.
icon: i-mdi-paperclip
---

Images, videos, audio files and documents can be sent in two ways.

|                                  | **By link** (Event API, recommended)                              | **By upload** (Messages API)                         |
| :------------------------------- | :---------------------------------------------------------------- | :--------------------------------------------------- |
| **Endpoint**                     | `POST https://api-app.digishare.ma/v1/event/conversation_message` | `POST https://api.digishare.ma/v1/messages`          |
| **You send**                     | A public HTTPS link in `body`                                     | The file itself (`url` or `base64`) in `file`        |
| **Processing**                   | Queued: `202` at once                                             | Synchronous: returns the created message             |
| **Digishare stores the file**    | No                                                                | Yes                                                  |
| **Shown in the Digishare inbox** | No: agents see an empty bubble                                    | Yes                                                  |
| **Provider types**               | WhatsApp only (`whatsapp`, `centrelatio`, `whatsapp_web`)         | All                                                  |
| **Message `type`**               | You set it                                                        | Detected from the file                               |
| **Voice notes and `reply_to`**   | No                                                                | Yes                                                  |
| **Digishare size limit**         | None: WhatsApp fetches the file and applies its own limits        | 100 MB                                               |

::tip
Use a **link** for high-volume sends, or when your files are already hosted and agents do not need to see them in the inbox. Use an **upload** when agents must see the file in the inbox, you only have the file's bytes, you need a voice note, or the provider is Telegram or Messenger.
::

## Send by link

Put a public HTTPS link in `body` and set the attachment `type`. Digishare does not download or store the file: it hands the link to WhatsApp, which fetches the file itself.

**Endpoint**: `POST https://api-app.digishare.ma/v1/event/conversation_message`

| Field                    | Type   | Required | Description                                                                                                  |
| :----------------------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------- |
| `type`                   | String | **Yes**  | `image`, `video`, `audio`, `document` or `sticker`. Digishare does not inspect the link, so it must match the file. |
| `body.link`              | String | **Yes**  | Public HTTPS link to the file. WhatsApp must be able to reach it without logging in.                          |
| `body.filename`          | String | No       | Documents only. The name the customer sees, including the extension (`invoice.pdf`).                          |
| `conversation_id`        | String | **Yes**\* | The conversation. See [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation) for the alternative with `recipient_id`. |
| `send_to_third`          | Boolean | No      | Defaults to `true`.                                                                                          |

\* Or `recipient_id` + `channel` (+ `api_provider_instance_id`), as described on [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation).

::api-playground
---
method: POST
url: "https://api-app.digishare.ma/v1/event/conversation_message"
headers:
  Authorization: "Bearer YOUR_TOKEN"
  Content-Type: "application/json"
body:
  event_type: "conversation_message"
  conversation_id: "CONV_123"
  send_to_third: true
  type: "document"
  body:
    link: "https://example.com/files/invoice-2026-001.pdf"
    filename: "invoice-2026-001.pdf"
responseSample:
  event_id: "2633736349319958528"
  status: "accepted"
  timestamp: "2026-10-02T20:55:33.894921622Z"
---
::

::warning
**Choose the right `type`.** With a link there is no type detection. A WebP sticker must be sent as `type: "sticker"`, and a PDF as `type: "document"`. If the `type` does not match the file, WhatsApp rejects it.
::

::warning
**Not shown in the inbox.** The message is delivered to the customer, but the Digishare inbox has no file to preview, so agents see an empty bubble. Use an upload when agents need to see the file.
::

## Send by upload

::warning
**Prerequisite**: `conversation_id` is required on this endpoint. See [LiveChat Integration](/developer-guides/livechat/integration).
::

Pass a **`file`** object instead of a text `body`. Digishare stores the file, detects its type and delivers it on the customer's channel.

**Endpoint**: `POST https://api.digishare.ma/v1/messages`

### Request Body

| Parameter         | Type    | Required | Description                                                                                   |
| :---------------- | :------ | :------- | :-------------------------------------------------------------------------------------------- |
| `conversation_id` | String  | **Yes**  | ID of the conversation: from the webhook event, or from [Create Conversation](/developer-guides/livechat/conversation/create-conversation).      |
| `send_to_third`   | Boolean | **Yes**  | Set `true` to deliver the file to the user's platform (e.g., WhatsApp).                       |
| `file`            | Object  | **Yes**  | The attachment. See [The file object](#the-file-object). Replaces `body`.                     |
| `reply_to`        | String  | No       | ID of a message in the same conversation to quote.                                            |
| `type`            | String  | No       | Not needed. The message type is detected from the file (see [Type detection](#type-detection)). |

::tip
**No conversation ID yet?** Call [Create Conversation](/developer-guides/livechat/conversation/create-conversation) with your provider instance and the recipient's number, then use the `id` it returns. By default that call archives the customer's active conversation first; pass `archive_active_conversation: false` to reuse it instead.
::

### The file object

Provide **one** source, either `url` or `base64`.

| Field       | Type   | Required | Description                                                                                                                                  |
| :---------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | String | One of   | Public `http(s)` link to the file. Digishare downloads it, so it must be reachable from the internet.                                        |
| `base64`    | String | One of   | The file as a data URI, e.g. `data:image/jpeg;base64,/9j/4AAQ...`. Use this when the file is not publicly hosted.                            |
| `file_name` | String | No       | Name of the file. For documents this is the name the customer sees, so include the extension (`invoice.pdf`).                                |
| `extension` | String | No       | Appended to `file_name`. Leave it out when `file_name` already ends with the extension, or you will get `invoice.pdf.pdf`.                   |
| `voice`     | Boolean | No      | Audio only. Send the file as a WhatsApp voice note. See [Audio Message](/developer-guides/livechat/outgoing-messages/attachments/audio_message).         |
| `duration`  | Number | No       | Audio only. Length in seconds, stored with the message.                                                                                      |

#### Sending a file from a URL

::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/messages"
headers:
  Authorization: "Bearer YOUR_TOKEN"
  Content-Type: "application/json"
body:
  send_to_third: true
  conversation_id: "CONV_123"
  file:
    url: "https://example.com/files/invoice-2026-001.pdf"
    file_name: "invoice-2026-001.pdf"
responseSample:
  data:
    object: "Message"
    id: "MSG_ID"
    conversation_id: "CONV_123"
    type: "pdf"
    body:
      id: 48213
      name: "invoice-2026-001"
      file_name: "invoice-2026-001.pdf"
      mime_type: "application/pdf"
      extension: "pdf"
      size: 91204
      type: "pdf"
      url: "companies/public/message/48213/invoice-2026-001.pdf"
      path: "companies/public/message/48213/invoice-2026-001.pdf"
    send_to_third: true
    system: false
    status: "sent"
---
::

#### Sending a file as base64

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
Base64 inflates the request by about a third. For files over a few megabytes, host the file and use `url` instead.
::

## Supported types

| Type         | Formats                                   | Reference                                                                           |
| :----------- | :---------------------------------------- | :---------------------------------------------------------------------------------- |
| **Image**    | JPEG, PNG                                 | [Image Message](/developer-guides/livechat/outgoing-messages/attachments/image_message)       |
| **Video**    | MP4, 3GPP (H.264 video, AAC audio)        | [Video Message](/developer-guides/livechat/outgoing-messages/attachments/video_message)       |
| **Audio**    | AAC, AMR, MP3, M4A, OGG (Opus)            | [Audio Message](/developer-guides/livechat/outgoing-messages/attachments/audio_message)       |
| **Document** | PDF, DOCX, XLSX, PPTX, TXT, CSV, ZIP, ... | [Document Message](/developer-guides/livechat/outgoing-messages/attachments/document_message) |
| **Sticker**  | WebP                                      | See [Type detection](#type-detection)                                               |

## File size limits

For an **upload**, two limits apply: Digishare's own, and the one of the provider type behind the conversation. The **smaller** one wins. For a **link**, Digishare downloads nothing, so only the provider's limits apply: WhatsApp fetches the file itself and rejects one that is too large.

### Digishare limit

**100 MB per file**, for every provider type and every file type. The API refuses a request body over 100 MB with HTTP `413` (an HTML error page from the gateway, not JSON).

- With `url`, Digishare downloads the file while it handles your request, so host it on a fast, reliable server. Files up to 104,857,600 bytes (100 MiB) are accepted. A file over 100 MB is not stored: the message comes back as the `unsupported file type` placeholder described in [Things to know](#things-to-know).
- With `base64`, the whole file is decoded in memory on the API server, and base64 adds about a third to the request. In our tests a 25 MB file was accepted, while a 40 MB file failed with HTTP `500` and left an empty message in the conversation. Use `base64` for files up to 25 MB and `url` for anything larger.

::tip
When in doubt, host the file and use `url`.
::

::note
**Event API.** The event endpoint on `api-app.digishare.ma` does not accept uploads: it carries links (see [Send by link](#send-by-link)). Each event is limited to **1 MB**; a larger one is rejected with `413 payload_too_large`.
::

### Limits by provider type

The provider type is the type of the API provider instance the conversation belongs to: the `api_provider_instant_id` of the conversation, listed under **Advanced Settings > API Provider** in the dashboard.

| Provider type                 | Code           | Image  | Video  | Audio  | Document | Sticker                   |
| :---------------------------- | :------------- | :----- | :----- | :----- | :------- | :------------------------ |
| **WhatsApp Business**         | `whatsapp`     | 5 MB   | 16 MB  | 16 MB  | 100 MB   | 100 KB static, 500 KB animated |
| **Shared WhatsApp number**    | `centrelatio`  | 5 MB   | 16 MB  | 16 MB  | 100 MB   | 100 KB static, 500 KB animated |
| **WhatsApp Web** (QR-linked)  | `whatsapp_web` | 100 MB | 100 MB | 100 MB | 100 MB   | 100 MB                    |
| **Telegram**                  | `telegram`     | 10 MB  | 50 MB  | 50 MB  | 50 MB    | Telegram sticker rules    |
| **Messenger**                 | `messenger`    | 25 MB  | 25 MB  | 25 MB  | 25 MB    | Not supported             |
| **Web Chat**                  | `web_chat`     | 100 MB | 100 MB | 100 MB | 100 MB   | 100 MB                    |

- **WhatsApp Business and the shared number**: Digishare checks the size before uploading and rejects an oversized file instead of sending it.
- **WhatsApp Web**: none of the WhatsApp Business per-type caps apply; only the 100 MB Digishare limit (also the gateway's cap). WhatsApp itself may still refuse very large media.
- **Telegram and Messenger**: these are the provider's own limits (Telegram Bot API, Meta). Digishare does not check them first, so an oversized file is accepted by Digishare and refused by the provider.
- **Web Chat**: only the Digishare limit applies when you send to a visitor. Files a visitor uploads from the widget are limited to 15 MB by default.

## Type detection

For an upload you never declare the attachment type. Digishare inspects the file and picks both how it is delivered and the `type` stored on the message.

| File                                         | Delivered on WhatsApp as | `type` in responses and webhooks |
| :------------------------------------------- | :----------------------- | :------------------------------- |
| JPEG, PNG                                    | Image                    | `image`                          |
| WebP                                         | **Sticker**              | `webp`                           |
| MP4, 3GPP                                    | Video                    | `video`                          |
| OGG, MP3, M4A, AAC, AMR                      | Audio                    | `audio`                          |
| PDF                                          | Document                 | `pdf`                            |
| Anything else (DOCX, XLSX, CSV, ZIP, ...)    | Document                 | `other`                          |

::warning
A **WebP image is delivered as a sticker**, not as a photo, and stickers have a much smaller size limit. Convert to JPEG or PNG if you want a regular image.
::

## Things to know

::warning
**No captions on WhatsApp.** Attachments are delivered without a caption, and `body` is ignored when an upload has a `file`. To add text, send a separate [Text Message](/developer-guides/livechat/outgoing-messages/text_message) right after the file.
::

::warning
**Uploads: check the `type` in the response.** If Digishare cannot download or decode your file (unreachable `url`, malformed `base64`), the call still returns `200`, but the message comes back with `type: "text"` and a `body.name` of `unsupported file type <file_name>` instead of an attachment. A successful attachment always comes back with a `type` of `image`, `video`, `audio`, `pdf`, `webp` or `other`.
::

::note
**`status: "sent"` is not delivery.** On the Messages API the response reports `sent` as soon as Digishare has accepted the message (`delivery_timeline` is `null` at that point), even for the placeholder above. It does not mean the customer's phone received it.
::

::note
**24-hour window.** Like any free-form message, an attachment sent more than 24 hours after the customer's last message may be restricted by your provider. See [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation).
::
