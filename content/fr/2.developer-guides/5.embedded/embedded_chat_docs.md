---
title: Aperçu
description: Apprenez à intégrer le Widget Chat Digishare dans votre site web en utilisant un pass à usage unique sécurisé.
---

Intégrez le Widget Chat Digishare dans votre site web afin que vos utilisateurs puissent discuter directement sans quitter votre application.

---

## Aperçu

::Mermaid
---
code: |
  sequenceDiagram
      actor Client as 🏢 Client
      participant Platform as 🔑 Plateforme Digishare
      actor EndUser as 👤 Utilisateur Final
      participant Website as 🌐 Site Web Client
      participant Chat as 💬 Widget Chat

      rect rgb(230, 240, 255)
          Note over Client,Platform: 🔧 Phase 1 — Configuration du compte (une seule fois)
          Client->>Platform: Se connecter à la Plateforme Digishare
          Platform-->>Client: Bienvenue ! Voici votre tableau de bord
          Client->>Platform: Aller dans Paramètres → copier l'ID Utilisateur
          Platform-->>Client: Votre ID Utilisateur : USR-XXXXX
          Client->>Platform: Générer un Token d'Accès
          Platform-->>Client: Votre Token d'Accès : TKN-XXXXX ✅
      end

      rect rgb(230, 255, 230)
          Note over Client,Chat: 🔗 Phase 2 — Générer un Pass Chat
          EndUser->>Website: Visite votre site web & se connecte
          Website->>Platform: Créer un pass chat à usage unique
          Note over Website,Platform: 🔐 Avec votre Token d'Accès + ID Utilisateur
          Platform-->>Website: Pass à usage unique : PASS-XXXXX ✅
      end

      rect rgb(255, 245, 230)
          Note over EndUser,Chat: 💬 Phase 3 — Ouvrir le Chat
          Website->>Chat: Intégrer le widget chat avec le pass
          Chat->>Platform: Vérifier ce pass
          Platform-->>Chat: Pass valide ! ✅
          Note over Chat: 🔒 Pass détruit après utilisation
      end

      rect rgb(240, 230, 255)
          Note over EndUser,Chat: ✨ Phase 4 — Prêt
          Chat-->>EndUser: Chat chargé — déjà connecté !
      end
---
::

---

## Étape 1 — Obtenir vos identifiants

1. **Connectez-vous** à la [Plateforme Digishare](https://app.digishare.ma)
2. Allez dans **Paramètres → Identifiants API**
3. Copiez vos :
   - **ID Utilisateur** — identifie votre compte
   - **Token d'Accès** — authentifie vos requêtes serveur

> [!IMPORTANT]
> Gardez votre Token d'Accès **secret**. Ne l'exposez jamais dans le code frontend ou les dépôts publics.

---

## Étape 2 — Générer un Code à Usage Unique (Côté Serveur)

Lorsqu'un utilisateur de votre site web a besoin d'accéder au chat, votre **serveur backend** doit demander un code à usage unique à l'API Digishare.

### Point d'accès API

```
POST https://api.digishare.ma/v1/oauth/widget/generate-code
```

### En-têtes

| En-tête         | Valeur                   |
|-----------------|--------------------------|
| `Authorization` | `Bearer VOTRE_TOKEN_ACCES` |
| `Content-Type`  | `application/json`       |

### Corps de la requête

```json
{
  "user_id": "VOTRE_ID_UTILISATEUR"
}
```

### Réponse

```json
{
  "code": "CODE_TEMPORAIRE_ICI",
  "expires_in": 300
}
```

> [!NOTE]
> Le code est **à usage unique** et expire après un court délai (généralement 5 minutes). Générez un nouveau code à chaque fois qu'un utilisateur ouvre le chat.

### Exemple (Node.js / Express)

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

### Exemple (PHP / Laravel)

```php
Route::get('/api/chat-code', function () {
    $response = Http::withToken(config('services.digishare.token'))
        ->post('https://api.digishare.ma/v1/oauth/widget/generate-code', [
            'user_id' => config('services.digishare.user_id'),
        ]);

    return response()->json(['code' => $response->json('code')]);
});
```

### Exemple (Python / Flask)

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

## Étape 3 — Intégrer le Widget Chat

Ajoutez un `<iframe>` à votre page HTML. L'URL `src` inclut l'**ID de la salle de chat** et le **code à usage unique**.

### Format de l'URL iframe

```
https://app.digishare.ma/chat/embeded/{ID_SALLE_CHAT}?code={CODE_USAGE_UNIQUE}
```

| Paramètre         | Description                              |
|-------------------|------------------------------------------|
| `ID_SALLE_CHAT`   | L'ID de la salle de chat à ouvrir        |
| `CODE_USAGE_UNIQUE` | Le code temporaire de l'Étape 2        |

### Exemple HTML Basique

```html
<iframe
  id="digishare-chat"
  src="https://app.digishare.ma/chat/embeded/ID_SALLE?code=CODE"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  allow="microphone; camera"
></iframe>
```

### Exemple Dynamique (JavaScript)

```html
<div id="chat-container"></div>

<script>
  async function loadChat() {
    // 1. Obtenir le code à usage unique depuis votre backend
    const response = await fetch('/api/chat-code');
    const { code } = await response.json();

    // 2. Construire l'URL de l'iframe
    const chatRoomId = 'VOTRE_ID_SALLE_CHAT';
    const chatUrl = `https://app.digishare.ma/chat/embeded/${chatRoomId}?code=${code}`;

    // 3. Créer et insérer l'iframe
    const iframe = document.createElement('iframe');
    iframe.src = chatUrl;
    iframe.width = '100%';
    iframe.height = '600';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.allow = 'microphone; camera';

    document.getElementById('chat-container').appendChild(iframe);
  }

  // Charger le chat quand la page est prête
  loadChat();
</script>
```

---

## Étape 4 — Personnaliser le Widget (Optionnel)

### Dimensionnement

| Cas d'utilisation     | Taille recommandée       |
|-----------------------|--------------------------|
| Chat pleine page      | `width: 100%; height: 100vh` |
| Chat barre latérale   | `width: 350px; height: 100vh` |
| Panneau intégré       | `width: 100%; height: 600px` |
| Bouton flottant       | `width: 400px; height: 500px` (basculé) |

### Exemple de Bouton Chat Flottant

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
      const chatRoomId = 'VOTRE_ID_SALLE_CHAT';
      document.getElementById('chat-iframe').src =
        `https://app.digishare.ma/chat/embeded/${chatRoomId}?code=${code}`;
      chatLoaded = true;
    }
  }
</script>
```

---

## Expiration de la Session

La session du widget chat expirera après une certaine période. Lorsque cela se produit :

- La zone de chat est remplacée par un message **« Session Expirée »**
- Un bouton **« Rafraîchir la Page »** est affiché
- Cliquer sur le bouton recharge le widget — votre application doit générer un **nouveau code** pour la ré-authentification

> [!TIP]
> Pour gérer la ré-authentification automatique, écoutez le rechargement de l'iframe et fournissez un nouveau code automatiquement.

---

## Bonnes Pratiques de Sécurité

| ✅ À faire                                    | ❌ À ne pas faire                              |
|-----------------------------------------------|------------------------------------------------|
| Générer les codes sur votre **serveur**       | Exposer votre Token d'Accès dans le JavaScript |
| Utiliser HTTPS pour toutes les requêtes       | Réutiliser des codes expirés                   |
| Générer un **nouveau code** à chaque session  | Coder les codes en dur dans le HTML            |
| Restreindre les domaines iframe avec les en-têtes CSP | Partager votre ID Utilisateur publiquement |

---

## Dépannage

| Problème                               | Solution                                                              |
|----------------------------------------|-----------------------------------------------------------------------|
| **« Authentification échouée »**       | Le code a peut-être expiré. Générez-en un nouveau.                    |
| **« Pas de code d'authentification »** | Le paramètre `code` est manquant dans l'URL.                         |
| **« Session Expirée »**               | Le token a expiré. Rafraîchissez la page pour obtenir une nouvelle session. |
| **iframe vide**                        | Vérifiez la console du navigateur pour les erreurs CORS ou CSP.       |
| **403 Interdit**                       | Vérifiez que votre Token d'Accès est valide et non expiré.           |

---

## Référence Rapide

| Élément              | Valeur / Format                                                      |
|----------------------|----------------------------------------------------------------------|
| **Générer un Code**  | `POST https://api.digishare.ma/v1/oauth/widget/generate-code`       |
| **URL du Widget**    | `https://app.digishare.ma/chat/embeded/{room_id}?code={code}`       |
| **En-tête Auth**     | `Bearer VOTRE_TOKEN_ACCES`                                           |
| **Durée du Code**    | Usage unique, expire en ~5 minutes                                   |
