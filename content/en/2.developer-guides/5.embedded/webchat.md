---
title: Web Chat
description: Add the Digishare chat bubble to any website with one code snippet. Visitors chat with your agents or your AI bot, no login needed.
---

The Web Chat puts a chat bubble on your website. Any visitor can open it and write to you, without an account or a login. Messages arrive in your Livechat inbox like a WhatsApp or Telegram conversation, and your agents or your ChatBot answer in real time.

::note
**Web Chat or Embedded Chat?** Use **Web Chat** for public visitors on a website (shop, restaurant, landing page). Use [Embedded Chat](/en/developer-guides/embedded/embedded_chat_docs) when your own logged-in users chat from inside your app.
::

## How it works

1. A visitor opens a page of your website and the bubble loads.
2. The bubble checks with Digishare that this website is allowed.
3. The visitor writes; the message opens a conversation in your Livechat inbox.
4. An agent or your ChatBot replies, and the reply shows in the bubble in real time.

- The visitor's session is kept in their browser for 30 days, so the conversation survives page reloads.
- Visitors can send text, files (PDF, Word, Excel, images, up to 15 MB) and voice notes.
- The bubble only works on the websites you allow. Any other site is refused.

## 1. Create the Web Chat channel

In the Digishare dashboard, open **Providers**, add a **Web Chat** provider and fill in:

| Field | What to put |
| --- | --- |
| **Allowed Domains** | Every website address where the bubble will appear, e.g. `https://example.com`. Up to 50. |
| **Welcome Message** | The first message the visitor sees, e.g. "Hi! How can we help?" |
| **Language** | `fr`, `en` or `ar`. |
| **Primary Color** | Your brand color, e.g. `#4f46e5`. |
| **Widget Position** | `right` or `left` corner. |
| **Logo URL** / **Avatar URL** | Optional images shown in the chat window. |

Save. The provider page then shows the **Web Chat Installation** block with your **Channel ID** and a ready-to-copy snippet.

::warning
Allowed domains are matched exactly. `https://example.com` and `https://www.example.com` are two different sites: add both if your site answers on both. No path and no trailing slash.
::

## 2. Add the snippet to your website

Paste this snippet just before the closing `</body>` tag of every page where the bubble should appear, with your own channel ID:

```html
<script src="https://rfs-ui.digishare.ma/cdn/chatbox/webchat.js"></script>
<script>
  DigishareWebChat.init({
    channelId: "YOUR_CHANNEL_ID",
    locale: "fr",
    position: "right",
  });
</script>
```

| Option | Description |
| --- | --- |
| `channelId` | Your Channel ID from the provider page. Required. |
| `locale` | Language of the widget: `fr`, `en` or `ar`. |
| `position` | `right` or `left`. |

Colors, logo, avatar and welcome message come from the provider settings. Change them in the dashboard; you don't need to touch the website again.

## 3. Answer automatically with a ChatBot

Conversations go to the pole / chat-room template selected in the **Provider Poles** section of the provider page. To let an AI bot answer visitors, attach a ChatBot to that template on the **Chat Bots** page.

Without a template, visitor messages still reach the Livechat inbox, but only your agents can answer.

## Control the widget from your site

Your own scripts can drive the bubble:

| Method | Description |
| --- | --- |
| `DigishareWebChat.open()` / `close()` / `toggle()` | Show or hide the chat window. |
| `DigishareWebChat.show()` / `hide()` | Show or hide the bubble itself. |
| `DigishareWebChat.identify(visitorId)` | Link the session to your own user id, e.g. after login. |
| `DigishareWebChat.reset()` | Clear the session and start a new conversation. |

Example: open the chat from your own "Contact us" button.

```html
<button onclick="DigishareWebChat.open()">Contact us</button>
```

## For agencies and platforms

If you build websites for many clients (restaurants, shops), you have two options:

- **One channel per client**: each client gets its own Web Chat provider, its own branding and its own ChatBot. Best when each client answers its own visitors.
- **One shared channel**: list every client site in **Allowed Domains** (up to 50). All conversations land in the same inbox and the same ChatBot answers.
