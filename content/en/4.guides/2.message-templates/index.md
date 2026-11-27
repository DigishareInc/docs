---
navigation:
  title: Overview
title: Create a message template
description: One screen to write a message for WhatsApp, Telegram, SMS and e-mail. Compare the channels and pick the right one.
icon: i-mdi-file-document-edit-outline
---

A **message template** is a ready-to-use message. You use it in campaigns, automations and the chat. One template can hold **one text per channel**: WhatsApp, Telegram, SMS and e-mail.

:guide-video{src="/docs/guides/message-template-fr.mp4" poster="/docs/guides/message-template-poster-fr.webp"}

::note
The video shows a WhatsApp template, from picking the channel to sending it to Meta. It is in French, with captions; the app is in French too. The data it shows is fictional.
::

::collapsible{name="the Moroccan Darija version"}
:guide-video{src="/docs/guides/message-template-ar.mp4" poster="/docs/guides/message-template-poster-ar.webp"}
::

## Open the editor

::steps

### Click "+"

At the top of the screen, click **+**, then **Message template**. You can also open **Message Templates** and click **New template (builder)**.

### Choose the first channel

The editor asks: **Where will this message go?** Choose **WhatsApp template**, **WhatsApp message**, **Telegram**, **SMS** or **Email**.

### Name the template

The **Template name** helps you find it in the list. Only your team sees it.

### Add more channels if needed

Click **Add Telegram**, **Add SMS**… to write the same message for another channel. The **variables** are shared by all channels.

### Save

Click **Create template**. For a WhatsApp template, click **Save & send to Meta**.

::

::tip
A **"… to fix"** counter at the top lists what is missing before sending. Click it, then click a line to jump to the field.
::

## Compare the channels

| | WhatsApp template | WhatsApp message | Telegram | SMS | E-mail |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Review** | Meta must approve it | None | None | None | None |
| **When to send** | Any time | Within 24 h of the contact's last message | To contacts who started your bot | Any time | Any time |
| **Content** | Header, body, footer, buttons, carousel | Text, media, buttons and lists | Text, file, buttons | Plain text | Drag & drop or HTML |
| **Max. text** | 1024 characters (body) | 4096 characters | 4096 characters | 160 per part (70 with emojis or accents) | — |
| **Formatting** | `*bold*` `_italic_` `~strike~` | `*bold*` `_italic_` `~strike~` | Markdown: `*bold*` `_italic_` `` `code` `` | None | Visual editor |
| **Variables** | `{{1}}`, `{{2}}`… with an example | `{{first_name}}` | `{{first_name}}` | `{{first_name}}` | `{{first_name}}` |

::note
**WhatsApp template or WhatsApp message?** To write first to a contact (a campaign, a reminder), you need an approved **WhatsApp template**. A **WhatsApp message** is only for replies within 24 h of the contact's last message.
::

## Variables

A variable puts a value of each contact into the message, such as their first name or order number.

- In a message, click **Add variable**, or type `{{first_name}}` directly: the variable is created.
- Each variable has a **key** (lowercase letters, digits and `_`, for example `first_name`) and a **default value**.
- The **default value** is sent when a contact has no value of their own.
- In a campaign, each variable is filled per contact: typed in, or from an **Excel column named like the key**.
- The **Variables** panel lists all the template's variables. You can rename them everywhere or remove unused ones.

## Guides per channel

::card-group
::card{title="WhatsApp" icon="i-mdi-whatsapp" to="/en/guides/message-templates/whatsapp"}
A Meta-approved template, and a free message in the 24-hour window.
::
::card{title="Telegram" icon="i-mdi-send" to="/en/guides/message-templates/telegram"}
Text, file or buttons, sent by your bot.
::
::card{title="SMS" icon="i-mdi-message-text" to="/en/guides/message-templates/sms"}
Plain text, counted in SMS parts.
::
::card{title="E-mail" icon="i-mdi-email" to="/en/guides/message-templates/email"}
Drag & drop or your own HTML.
::
::
