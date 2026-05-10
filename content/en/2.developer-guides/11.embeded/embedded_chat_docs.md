  <!-- # Embedded Chat Widget — Integration Guide -->

Embed the Digishare Chat Widget into your website so your users can chat directly without leaving your app.

---

## Overview

::Mermaid
---
code: |
  sequenceDiagram
      actor Client as 🏢 Client
      participant Platform as 🔑 Digishare Platform
      actor EndUser as 👤 End User
      participant Website as 🌐 Client Website
      participant Chat as 💬 Chat Widget

      rect rgb(230, 240, 255)
          Note over Client,Platform: 🔧 Phase 1 — Account Setup (one time)
          Client->>Platform: Log in to Digishare Platform
          Platform-->>Client: Welcome! Here is your dashboard
          Client->>Platform: Go to Settings → copy User ID
          Platform-->>Client: Your User ID: USR-XXXXX
          Client->>Platform: Generate an Access Token
          Platform-->>Client: Your Access Token: TKN-XXXXX ✅
      end

      rect rgb(230, 255, 230)
          Note over Client,Chat: 🔗 Phase 2 — Generate a Chat Pass
          EndUser->>Website: Visits your website & logs in
          Website->>Platform: Create a one-time chat pass
          Note over Website,Platform: 🔐 Using your Access Token + User ID
          Platform-->>Website: One-time pass: PASS-XXXXX ✅
      end

      rect rgb(255, 245, 230)
          Note over EndUser,Chat: 💬 Phase 3 — Open the Chat
          Website->>Chat: Embed chat widget with the pass
          Chat->>Platform: Verify this pass
          Platform-->>Chat: Pass is valid! ✅
          Note over Chat: 🔒 Pass destroyed after use
      end

      rect rgb(240, 230, 255)
          Note over EndUser,Chat: ✨ Phase 4 — Ready
          Chat-->>EndUser: Chat loaded — already logged in!
      end
---
::

---

## Step 1 — Get Your Credentials

1. **Log in** to the [Digishare Platform](https://app.digishare.ma)
2. Navigate to **Settings → API Credentials**
3. Copy your:
   - **User ID** — identifies your account
   - **Access Token** — authenticates your server requests

> [!IMPORTANT]
> Keep your Access Token **secret**. Never expose it in frontend code or public repositories.

---

## Step 2 — Generate a One-Time Code (Server-Side)

When a user on your website needs to access the chat, your **backend server** must request a one-time code from the Digishare API.

### API Endpoint

```
POST https://api.digishare.ma/v1/oauth/widget/generate-code
```

### Headers

| Header          | Value                    |
|-----------------|--------------------------|
| `Authorization` | `Bearer YOUR_ACCESS_TOKEN` |
| `Content-Type`  | `application/json`       |

### Request Body

```json
{
  "user_id": "YOUR_USER_ID"
}
```

### Response

```json
{
  "code": "TEMPORARY_CODE_HERE",
  "expires_in": 300
}
```

> [!NOTE]
> The code is **single-use** and expires after a short time (typically 5 minutes). Generate a new code each time a user opens the chat.

### Example (Node.js / Express)

```javascript
app.get('/api/chat-code', async (req, res) => {
  const response = await fetch('https://api.digishare.ma/v1/oauth/widget/generate-code', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIGISHARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: process.env.DIGISHARE_USER_ID,
    }),
  });

  const data = await response.json();
  res.json({ code: data.code });
});
```

### Example (PHP / Laravel)

```php
Route::get('/api/chat-code', function () {
    $response = Http::withToken(config('services.digishare.token'))
        ->post('https://api.digishare.ma/v1/oauth/widget/generate-code', [
            'user_id' => config('services.digishare.user_id'),
        ]);

    return response()->json(['code' => $response->json('code')]);
});
```

### Example (Python / Flask)

```python
import requests

@app.route('/api/chat-code')
def get_chat_code():
    response = requests.post(
        'https://api.digishare.ma/v1/oauth/widget/generate-code',
        headers={'Authorization': f'Bearer {ACCESS_TOKEN}'},
        json={'user_id': USER_ID}
    )
    return {'code': response.json()['code']}
```

---

## Step 3 — Embed the Chat Widget

Add an `<iframe>` to your HTML page. The `src` URL includes the **chat room ID** and the **one-time code**.

### iframe URL Format

```
https://app.digishare.ma/chat/embeded/{CHAT_ROOM_ID}?code={ONE_TIME_CODE}
```

| Parameter       | Description                              |
|-----------------|------------------------------------------|
| `CHAT_ROOM_ID`  | The ID of the chat room to open          |
| `ONE_TIME_CODE` | The temporary code from Step 2           |

### Basic HTML Example

```html
<iframe
  id="digishare-chat"
  src="https://app.digishare.ma/chat/embeded/ROOM_ID?code=CODE"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  allow="microphone; camera"
></iframe>
```

### Dynamic Example (JavaScript)

```html
<div id="chat-container"></div>

<script>
  async function loadChat() {
    // 1. Get the one-time code from your backend
    const response = await fetch('/api/chat-code');
    const { code } = await response.json();

    // 2. Build the iframe URL
    const chatRoomId = 'YOUR_CHAT_ROOM_ID';
    const chatUrl = `https://app.digishare.ma/chat/embeded/${chatRoomId}?code=${code}`;

    // 3. Create and insert the iframe
    const iframe = document.createElement('iframe');
    iframe.src = chatUrl;
    iframe.width = '100%';
    iframe.height = '600';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.allow = 'microphone; camera';

    document.getElementById('chat-container').appendChild(iframe);
  }

  // Load chat when page is ready
  loadChat();
</script>
```

---

## Step 4 — Customize the Widget (Optional)

### Sizing

| Use Case           | Recommended Size         |
|--------------------|--------------------------|
| Full-page chat     | `width: 100%; height: 100vh` |
| Sidebar chat       | `width: 350px; height: 100vh` |
| Embedded panel     | `width: 100%; height: 600px` |
| Floating button    | `width: 400px; height: 500px` (toggled) |

### Floating Chat Button Example

```html
<style>
  #chat-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999;
  }

  #chat-popup {
    display: none;
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 400px;
    height: 500px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 999;
  }

  #chat-popup.open { display: block; }

  #chat-popup iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<button id="chat-toggle" onclick="toggleChat()">💬</button>

<div id="chat-popup">
  <iframe id="chat-iframe" src=""></iframe>
</div>

<script>
  let chatLoaded = false;

  async function toggleChat() {
    const popup = document.getElementById('chat-popup');
    popup.classList.toggle('open');

    if (!chatLoaded) {
      const response = await fetch('/api/chat-code');
      const { code } = await response.json();
      const chatRoomId = 'YOUR_CHAT_ROOM_ID';
      document.getElementById('chat-iframe').src =
        `https://app.digishare.ma/chat/embeded/${chatRoomId}?code=${code}`;
      chatLoaded = true;
    }
  }
</script>
```

---

## Session Expiration

The chat widget session will expire after a certain period. When this happens:

- The chat area is replaced with a **"Session Expired"** message
- A **"Refresh Page"** button is shown
- Clicking the button reloads the widget — your app should generate a **new code** for re-authentication

> [!TIP]
> To handle automatic re-authentication, listen for the iframe reload and provide a fresh code automatically.

---

## Security Best Practices

| ✅ Do                                       | ❌ Don't                                    |
|---------------------------------------------|---------------------------------------------|
| Generate codes on your **server**            | Expose your Access Token in JavaScript      |
| Use HTTPS for all requests                   | Reuse expired codes                         |
| Generate a **new code** for each session     | Hardcode codes in HTML                      |
| Restrict iframe domains with CSP headers     | Share your User ID publicly                 |

---

## Troubleshooting

| Problem                        | Solution                                                       |
|--------------------------------|----------------------------------------------------------------|
| **"Authentication failed"**    | The code may have expired. Generate a new one.                 |
| **"No authentication code"**   | The `code` parameter is missing from the URL.                  |
| **"Session Expired"**          | The token expired. Refresh the page to get a new session.      |
| **Blank iframe**               | Check browser console for CORS or CSP errors.                  |
| **403 Forbidden**              | Verify your Access Token is valid and not expired.             |

---

## Quick Reference

| Item                | Value / Format                                                   |
|---------------------|------------------------------------------------------------------|
| **Generate Code**   | `POST https://api.digishare.ma/v1/oauth/widget/generate-code`   |
| **Widget URL**      | `https://app.digishare.ma/chat/embeded/{room_id}?code={code}`   |
| **Auth Header**     | `Bearer YOUR_ACCESS_TOKEN`                                       |
| **Code Lifetime**   | Single-use, expires in ~5 minutes                                |
