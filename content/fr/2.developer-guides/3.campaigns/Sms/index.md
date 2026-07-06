---
title: Campagnes SMS
description: Diffusion de campagnes SMS à haut volume avec contenu en ligne ou modèles enregistrés.
icon: i-mdi-comment-text-outline
---

Ce guide explique comment envoyer des campagnes SMS à l'aide de l'**API Campagnes Digishare**. Digishare prend en charge à la fois les **ID de modèles SMS enregistrés** et le **contenu SMS dynamique en ligne** sans avoir besoin de créer un modèle au préalable.

::note
**Prérequis** :

- **Jeton Bearer** valide.
- **ID d'étiquette d'expéditeur (Sender Label ID)** actif (ex. `n84bp7mybrlydovg`) représentant votre nom d'expéditeur SMS.
- **ID de type de message** (ex. `dxg6ynlpw7k87awb`) catégorisant le SMS (Transactionnel / Promotionnel).
- Solde SMS suffisant sur votre compte Digishare.
::

## 1. Référence du Payload API

L'endpoint de campagne SMS accepte un objet JSON flexible conçu aussi bien pour les messages transactionnels ponctuels que pour les listes de destinataires à haut volume.

### Champs de Configuration

| Champ | Type | Statut | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Requis** | Nom interne de la campagne (non visible par les destinataires). |
| `channel` | `string` | **Requis** | Le canal de communication. Doit être défini sur `sms`. |
| `sender_label_id` | `string` | **Requis** | L'identifiant unique de votre nom d'expéditeur SMS attribué. |
| `message_type_id` | `string` | **Requis** | L'ID catégorisant le type de SMS (ex. Transactionnel ou Marketing). |
| `message_template` | `object` | **Requis\*** | Objet de modèle SMS en ligne contenant le texte brut. |
| `message_template_id` | `string` | **Requis\*** | ID d'un modèle SMS préalablement enregistré. \*(Fournir `message_template` OU `message_template_id`). |
| `recipients` | `array` | **Requis** | Liste des objets destinataires avec numéros de téléphone et variables. |
| `global_data` | `object` | Optionnel | Pont de correspondance centralisé liant les champs des destinataires aux variables. |
| `start_datetime` | `string` | Optionnel | Heure de début programmée pour la campagne au format ISO-8601. |
| `notify_webhooks` | `boolean` | Optionnel | Déclenche des webhooks sur les événements de livraison lorsque défini sur `true`. |
| `meta` | `object` | Optionnel | Métadonnées personnalisées au format JSON rattachées à la campagne. |

---

## 2. Exemple : Campagne SMS en Ligne (Sans Modèle Enregistré)

Pour envoyer du contenu texte personnalisé directement sans créer de modèle dans le tableau de bord, transmettez le texte dans le champ `message_template.template.channels.sms.content` :

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Envoyer une campagne SMS en ligne avec variables dynamiques.
variables:
  token: YOUR_ACCESS_TOKEN
  senderId: n84bp7mybrlydovg
  messageTypeId: dxg6ynlpw7k87awb
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: Campagne Ventes Flash SMS
  channel: sms
  sender_label_id: "{senderId}"
  message_type_id: "{messageTypeId}"
  message_template:
    template:
      channels:
        sms:
          content: "Bonjour {{first_name}}, utilisez le code {{promo_code}} pour -20% sur votre commande !"
  recipients:
    - mobile: "212671791198"
      first_name: "Youssef"
      promo_code: "SAVE20"
    - mobile: "212661234567"
      first_name: "Sarah"
      promo_code: "PROMO20"
  global_data:
    first_name: "%recipient.first_name%"
    promo_code: "%recipient.promo_code%"
responseSample:
  status: success
  data:
    id: "x4dgk7090azly760"
    title: "Campagne Ventes Flash SMS"
    channel: "sms"
    status: "planned"
    recipients_count: 2
    cost: 0.12
    created_at: "2026-07-06T12:00:00Z"
---
::

---

## 3. Exemple : Campagne SMS avec ID de Modèle Enregistré

Si vous avez déjà configuré un modèle SMS réutilisable dans votre tableau de bord Digishare, fournissez son `message_template_id` :

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Envoyer une campagne SMS en utilisant l'ID d'un modèle enregistré.
variables:
  token: YOUR_ACCESS_TOKEN
  senderId: n84bp7mybrlydovg
  messageTypeId: dxg6ynlpw7k87awb
  templateId: tpl_987654321
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: SMS de Vérification de Compte
  channel: sms
  sender_label_id: "{senderId}"
  message_type_id: "{messageTypeId}"
  message_template_id: "{templateId}"
  recipients:
    - mobile: "212671791198"
      otp: "849201"
  global_data:
    otp: "%recipient.otp%"
    mobile: "%recipient.mobile%"
responseSample:
  status: success
  data:
    id: "abnd5ym5dgkr7x4g"
    title: "SMS de Vérification de Compte"
    channel: "sms"
    status: "planned"
    recipients_count: 1
    created_at: "2026-07-06T12:05:00Z"
---
::

---

## 4. Correspondance des Données Dynamiques

L'objet `global_data` sert de passerelle reliant les propriétés des destinataires aux variables situées dans le texte du SMS :

- **Placeholders** : Utilisez la syntaxe `{{nom_variable}}` dans le texte du message SMS.
- **Références destinataire** : Mappez les clés dans `global_data` vers `%recipient.nom_champ%`.

```json
{
  "message_template": {
    "template": {
      "channels": {
        "sms": {
          "content": "Bonjour {{name}}, votre solde est de {{amount}} MAD."
        }
      }
    }
  },
  "global_data": {
    "name": "%recipient.name%",
    "amount": "%recipient.amount%"
  },
  "recipients": [
    { "mobile": "212671791198", "name": "Karim", "amount": "150" }
  ]
}
```

::important
Chaque placeholder du texte SMS (ex. `{{name}}`) **doit** exister en tant que clé dans `global_data`. Les données situées dans l'objet `recipients` ne sont accessibles que si elles sont explicitement mappées dans `global_data`.
::
