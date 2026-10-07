---
navigation:
  title: Overview
title: Attachments
description: Send images, videos, audio files and documents to a conversation with the Event API, by link or as a file.
icon: i-mdi-paperclip
---

Images, videos, audio files and documents are sent with the [Event API](/developer-guides/livechat/conversation/send-on-conversation): `POST https://api-app.digishare.ma/v1/event/conversation_message`. There are two ways to attach a file.

|                                  | **By link**                                                        | **As a file (base64)**                               |
| :------------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------- |
| **You send**                     | A public HTTPS link in `body.link`                                 | The file itself, base64-encoded, in `file.base64`    |
| **Processing**                   | Queued: `202` at once                                              | Queued: `202` at once                                |
| **Digishare stores the file**    | No                                                                 | Yes                                                  |
| **Shown in the Digishare inbox** | No: agents see an empty bubble                                     | Yes                                                  |
| **Provider types**               | WhatsApp only (`whatsapp`, `centrelatio`, `whatsapp_web`)          | All                                                  |
| **Message `type`**               | You set it                                                         | Detected from the file                               |
| **Caption (text with the file)** | `body.caption`                                                     | `file.caption`                                       |
| **Size limit**                   | None on Digishare's side: WhatsApp fetches the file and applies its own limits | About 700 KB (1 MB per event)            |

::tip
Use a **link** for large files, for high-volume sends, or when your files are already hosted and agents do not need to see them in the inbox. Send a **file** when agents must see it in the inbox, or when it is small (under about 700 KB) and not hosted anywhere.
::

## Send by link

Put a public HTTPS link in `body` and set the attachment `type`. Digishare does not download or store the file: it hands the link to WhatsApp, which fetches the file itself.

**Endpoint**: `POST https://api-app.digishare.ma/v1/event/conversation_message`

| Field                    | Type   | Required | Description                                                                                                  |
| :----------------------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------- |
| `type`                   | String | **Yes**  | `image`, `video`, `audio`, `document` or `sticker`. Digishare does not inspect the link, so it must match the file. |
| `body.link`              | String | **Yes**  | Public HTTPS link to the file. WhatsApp must be able to reach it without logging in.                          |
| `body.filename`          | String | No       | Documents only. The name the customer sees, including the extension (`invoice.pdf`).                          |
| `body.caption`           | String | No       | Text shown under the file, in the same message. Images, videos and documents only. See [Text with an attachment](#text-with-an-attachment). |
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
**Not shown in the inbox.** The message is delivered to the customer, but the Digishare inbox has no file to preview, so agents see an empty bubble. Send it as a file when agents need to see it.
::

## Send a file (base64)

Put the file in `file` instead of a link in `body`. Digishare stores it, shows it in the inbox and detects its type.

**Endpoint**: `POST https://api-app.digishare.ma/v1/event/conversation_message`

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "body": "",
  "file": {
    "base64": "JVBERi0xLjQK...",
    "file_name": "invoice-2026-001.pdf",
    "caption": "Your invoice for October, thank you!"
  }
}
```

Every field, the size limit, the allowed file types, what happens to a refused file and a full curl example are on [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation#send-a-file-base64).

## Supported types

| Type         | Formats                                   | Reference                                                                           |
| :----------- | :---------------------------------------- | :---------------------------------------------------------------------------------- |
| **Image**    | JPEG, PNG                                 | [Image Message](/developer-guides/livechat/outgoing-messages/attachments/image_message)       |
| **Video**    | MP4, 3GPP (H.264 video, AAC audio)        | [Video Message](/developer-guides/livechat/outgoing-messages/attachments/video_message)       |
| **Audio**    | AAC, AMR, MP3, M4A, OGG (Opus)            | [Audio Message](/developer-guides/livechat/outgoing-messages/attachments/audio_message)       |
| **Document** | PDF, DOCX, XLSX, PPTX, TXT, CSV, ZIP, ... | [Document Message](/developer-guides/livechat/outgoing-messages/attachments/document_message) |
| **Sticker**  | WebP                                      | See [Type detection](#type-detection)                                               |

::note
**As a file**, Digishare accepts PDF; JPEG, PNG, WebP and GIF images; MP4 and 3GP video; OGG, MP3, M4A, AAC and AMR audio; DOC, DOCX, XLS, XLSX, PPT and PPTX; TXT and CSV. The content decides, not the name, and any other type is refused. **By link**, Digishare checks nothing: WhatsApp decides.
::

## File size limits

For a **file**, the event limit applies first (1 MB per event, so about 700 KB of file), then the limit of the provider type behind the conversation: the **smaller** one wins. For a **link**, Digishare downloads nothing, so only the provider's limits apply: WhatsApp fetches the file itself and rejects one that is too large.

### Limits by provider type

The provider type is the type of the API provider instance the conversation belongs to: the `api_provider_instant_id` of the conversation, listed under **Advanced Settings > API Provider** in the dashboard.

| Provider type                 | Code           | Image  | Video  | Audio  | Document | Sticker                   |
| :---------------------------- | :------------- | :----- | :----- | :----- | :------- | :------------------------ |
| **WhatsApp API**         | `whatsapp`     | 5 MB   | 16 MB  | 16 MB  | 100 MB   | 100 KB static, 500 KB animated |
| **WhatsApp API** (shared number)    | `centrelatio`  | 5 MB   | 16 MB  | 16 MB  | 100 MB   | 100 KB static, 500 KB animated |
| **WhatsApp Business** or **Messenger** (QR-linked)  | `whatsapp_web` | 100 MB* | 100 MB* | 100 MB* | 100 MB*   | 100 MB*                    |
| **Telegram**                  | `telegram`     | 10 MB  | 50 MB  | 50 MB  | 50 MB    | Telegram sticker rules    |
| **Messenger**                 | `messenger`    | 25 MB  | 25 MB  | 25 MB  | 25 MB    | Not supported             |
| **Web Chat**                  | `web_chat`     | 100 MB | 100 MB | 100 MB | 100 MB   | 100 MB                    |

- **WhatsApp API and the shared number**: Digishare checks the size before uploading and rejects an oversized file instead of sending it.
- **WhatsApp Business and Messenger (QR-linked)**: none of the WhatsApp API per-type caps apply. The 100 MB* is Digishare's cap (also the gateway's), not a promise that WhatsApp will deliver it: WhatsApp itself may refuse very large media.
- **Telegram and Messenger**: these are the provider's own limits (Telegram Bot API, Meta). Digishare does not check them first, so an oversized file is accepted by Digishare and refused by the provider.
- **Web Chat**: no provider limit applies when you send to a visitor; for a file, the event limit still applies. Files a visitor uploads from the widget are limited to 15 MB by default.

## Type detection

For a file sent as base64 you never declare the attachment type. Digishare inspects its content and picks both how it is delivered and the `type` stored on the message.

| File                                         | Delivered on WhatsApp as | `type` in responses and webhooks |
| :------------------------------------------- | :----------------------- | :------------------------------- |
| JPEG, PNG                                    | Image                    | `image`                          |
| WebP                                         | **Sticker**              | `webp`                           |
| MP4, 3GPP                                    | Video                    | `video`                          |
| OGG, MP3, M4A, AAC, AMR                      | Audio                    | `audio`                          |
| PDF                                          | Document                 | `pdf`                            |
| Anything else (DOCX, XLSX, TXT, CSV, ...)   | Document                 | `other`                          |

::warning
A **WebP image is delivered as a sticker**, not as a photo, and stickers have a much smaller size limit. Convert to JPEG or PNG if you want a regular image.
::

## Text with an attachment

Add a **caption** to an image, video or document and it arrives in the **same message**, under the file.

| Way to send | Field                                                                     |
| :---------- | :------------------------------------------------------------------------ |
| By link     | `body.caption`                                                            |
| As a file   | `file.caption`, or a non-empty `body` when `file.caption` is missing      |

By link:

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "send_to_third": true,
  "type": "document",
  "body": {
    "link": "https://example.com/files/invoice-2026-001.pdf",
    "filename": "invoice-2026-001.pdf",
    "caption": "Your invoice for October, thank you!"
  }
}
```

As a file:

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "body": "",
  "file": {
    "base64": "JVBERi0xLjQK...",
    "file_name": "invoice-2026-001.pdf",
    "caption": "Your invoice for October, thank you!"
  }
}
```

- **Which files:** images, videos and documents (PDF and other files). Audio files and stickers take no caption: it is ignored and the file is delivered without it.
- **Length:** up to 1024 characters; a longer text is cut. Leading and trailing spaces are removed. Emoji and Arabic text are fine.
- **Optional:** a message without `caption` is sent exactly as before.
- **Providers:** verified on WhatsApp Business and Messenger numbers (QR-linked), where the file and the caption arrive as one message. The WhatsApp API supports captions natively and receives the same field, but we have not tested it yet. On other provider types, send the text as a second message.

### With reply buttons

To send a file, text and at least one reply button in one message, use an interactive message that carries the media as its header and your text as its body.

```json
{
  "event_type": "conversation_message",
  "conversation_id": "CONV_123",
  "send_to_third": true,
  "type": "interactive",
  "body": {
    "type": "button",
    "header": { "type": "image", "image": { "link": "https://example.com/images/promo.jpg" } },
    "body": { "text": "Your text here" },
    "action": {
      "buttons": [ { "type": "reply", "reply": { "id": "ok", "title": "OK" } } ]
    }
  }
}
```

How the interactive message arrives depends on the provider type:

| Provider type                                     | What the customer receives                                                                                                                                  |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WhatsApp API** (`whatsapp`, `centrelatio`)      | One message: the media, your text and the buttons.                                                                                                          |
| **WhatsApp Business / Messenger** (`whatsapp_web`) | **Two messages**: the media first, then your text with the buttons as a numbered menu ("Reply with a number"). Buttons are emulated on QR-linked numbers. |
| Other provider types                              | Send two messages instead.                                                                                                                                  |

::note
The header can be an `image`, `video` or `document`; audio files and stickers cannot be a header. Only reply-button messages keep a media header: list menus drop it. On the WhatsApp API, an interactive message is subject to the 24-hour window.
::

## Things to know

::note
**`202` means queued.** The Event API answers as soon as the event is accepted, not when the message is created or delivered. Use the `event_id` to find the message afterwards: see [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation#response).
::

::warning
**A refused file creates no message.** A file is checked after the `202`: if its type is not allowed, the base64 is invalid or it is too large, you get no error and nothing is sent. Check the file on your side before sending.
::

::note
**24-hour window.** On the WhatsApp API, an attachment sent more than 24 hours after the customer's last message may be restricted. WhatsApp Business and Messenger numbers (QR-linked) have no such window. See [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation).
::

::warning
**QR-linked numbers are rate-limited.** WhatsApp Business and Messenger numbers send through a gateway that protects the number. By default it takes a burst of 5 messages, then about 12 per minute, with a short random pause between messages, and a daily cap that grows with the age of the link (30 messages a day for the first 3 days, 100 until day 7, then 500). A message over a limit is not sent immediately but retried later, so a burst of attachments can arrive minutes late. These are default values and your setup may differ.
::
