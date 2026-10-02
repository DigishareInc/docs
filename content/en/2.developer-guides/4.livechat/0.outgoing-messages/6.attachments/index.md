---
navigation:
  title: Overview
title: Attachments
description: Send images, videos, audio and documents to a conversation with the file object.
icon: i-mdi-paperclip
---

Images, videos, audio files and documents are all sent the same way: call `POST /v1/messages` and pass a **`file`** object instead of a text `body`. Digishare stores the file, detects its type and delivers it on the customer's channel.

::warning
**Prerequisite**: You must have an active Conversation ID. See [LiveChat Integration](/developer-guides/livechat/integration).
::

**Endpoint**: `POST https://api.digishare.ma/v1/messages`

## Request Body

| Parameter         | Type    | Required | Description                                                                                   |
| :---------------- | :------ | :------- | :-------------------------------------------------------------------------------------------- |
| `conversation_id` | String  | **Yes**  | ID from the webhook event.                                                                    |
| `send_to_third`   | Boolean | **Yes**  | Set `true` to deliver the file to the user's platform (e.g., WhatsApp).                       |
| `file`            | Object  | **Yes**  | The attachment. See [The file object](#the-file-object). Replaces `body`.                     |
| `reply_to`        | String  | No       | ID of a message in the same conversation to quote.                                            |
| `type`            | String  | No       | Not needed. The message type is detected from the file (see [Type detection](#type-detection)). |

## The file object

Provide **one** source, either `url` or `base64`.

| Field       | Type   | Required | Description                                                                                                                                  |
| :---------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | String | One of   | Public `http(s)` link to the file. Digishare downloads it, so it must be reachable from the internet.                                        |
| `base64`    | String | One of   | The file as a data URI, e.g. `data:image/jpeg;base64,/9j/4AAQ...`. Use this when the file is not publicly hosted.                            |
| `file_name` | String | No       | Name of the file. For documents this is the name the customer sees, so include the extension (`invoice.pdf`).                                |
| `extension` | String | No       | Appended to `file_name`. Leave it out when `file_name` already ends with the extension, or you will get `invoice.pdf.pdf`.                   |
| `voice`     | Boolean | No      | Audio only. Send the file as a WhatsApp voice note. See [Audio Message](/developer-guides/livechat/outgoing-messages/attachments/audio_message).         |
| `duration`  | Number | No       | Audio only. Length in seconds, stored with the message.                                                                                      |

### Sending a file from a URL

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

### Sending a file as base64

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

Two limits apply to every attachment: Digishare's own, and the one of the provider type behind the conversation. The **smaller** one wins.

### Digishare limit

**100 MB per file**, for every provider type and every file type. The API refuses a request body over 100 MB with HTTP `413` (an HTML error page from the gateway, not JSON).

- With `url`, Digishare downloads the file while it handles your request, so host it on a fast, reliable server. Files up to 104,857,600 bytes (100 MiB) are accepted. A file over 100 MB is not stored: the message comes back as the `unsupported file type` placeholder described in [Things to know](#things-to-know).
- With `base64`, the whole file is decoded in memory on the API server, and base64 adds about a third to the request. In our tests a 25 MB file was accepted, while a 40 MB file failed with HTTP `500` and left an empty message in the conversation. Use `base64` for files up to 25 MB and `url` for anything larger.

::tip
When in doubt, host the file and use `url`.
::

::note
**Event API.** The event endpoints on `api-app.digishare.ma` (see [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation)) do not carry files, and each event is limited to **1 MB**. Larger events are rejected with `413 payload_too_large`.
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

You never declare the attachment type. Digishare inspects the file and picks both how it is delivered and the `type` stored on the message.

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
**No captions on WhatsApp.** The `body` field is ignored when a `file` is present, and WhatsApp messages are delivered without a caption. To add text, send a separate [Text Message](/developer-guides/livechat/outgoing-messages/text_message) right after the file.
::

::warning
**Check the `type` in the response.** If Digishare cannot download or decode your file (unreachable `url`, malformed `base64`), the call still returns `200`, but the message comes back with `type: "text"` and a `body.name` of `unsupported file type <file_name>` instead of an attachment. A successful attachment always comes back with a `type` of `image`, `video`, `audio`, `pdf`, `webp` or `other`.
::

::note
**`status: "sent"` is not delivery.** The response reports `sent` as soon as Digishare has accepted the message (`delivery_timeline` is `null` at that point), even for the placeholder above. It does not mean the customer's phone received it.
::

::note
**24-hour window.** Like any free-form message, an attachment sent more than 24 hours after the customer's last message may be restricted by your provider. See [Send on Conversation](/developer-guides/livechat/conversation/send-on-conversation).
::
