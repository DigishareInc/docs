---
title: SMS Campaigns
description: Broadcast high-volume SMS campaigns with inline message bodies or saved templates.
icon: i-mdi-comment-text-outline
---

This guide explains how to send SMS campaigns using the **Digishare Campaigns API**. Digishare supports both **saved Message Template IDs** and **inline dynamic SMS content** without pre-creating a template.

::note
**Prerequisites**:

- Valid **Bearer Token**.
- Active **Sender Label ID** (e.g., `n84bp7mybrlydovg`) representing your SMS sender ID.
- **Message Type ID** (e.g., `dxg6ynlpw7k87awb`) categorizing the SMS (Transactional / Promotional).
- Sufficient SMS balance on your Digishare account.
::

## 1. API Payload Reference

The SMS campaign endpoint accepts a flexible JSON payload designed for both one-off transactional messages and high-volume recipient lists.

### Configuration Fields

| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Required** | Internal name for the campaign (not visible to recipients). |
| `channel` | `string` | **Required** | The communication channel. Must be set to `sms`. |
| `sender_label_id` | `string` | **Required** | The unique identifier for your assigned SMS sender ID. |
| `message_type_id` | `string` | **Required** | The ID categorizing your SMS type (e.g. Transactional or Marketing). |
| `message_template` | `object` | **Required\*** | Inline SMS template object containing the raw text content. |
| `message_template_id` | `string` | **Required\*** | ID of a pre-created saved template. \*(Either `message_template` OR `message_template_id` must be provided). |
| `recipients` | `array` | **Required** | List of recipient objects containing phone numbers and dynamic fields. |
| `global_data` | `object` | Optional | Centralized mapping bridge connecting recipient fields to template placeholders. |
| `start_datetime` | `string` | Optional | Scheduled start time for the campaign in ISO-8601 format. |
| `notify_webhooks` | `boolean` | Optional | Triggers delivery status webhooks when set to `true`. |
| `meta` | `object` | Optional | Custom key-value metadata attached to the campaign. |

---

## 2. Example: Inline SMS Campaign (No Pre-created Template)

When sending custom text messages directly from your application without creating a template in advance, pass the text in the `message_template.template.channels.sms.content` field:

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Send an SMS campaign with inline text content and dynamic variables.
variables:
  token: YOUR_ACCESS_TOKEN
  senderId: n84bp7mybrlydovg
  messageTypeId: dxg6ynlpw7k87awb
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: Flash Sale SMS Notification
  channel: sms
  sender_label_id: "{senderId}"
  message_type_id: "{messageTypeId}"
  message_template:
    template:
      channels:
        sms:
          content: "Hello {{first_name}}, use code {{promo_code}} for 20% off your order!"
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
    title: "Flash Sale SMS Notification"
    channel: "sms"
    status: "planned"
    recipients_count: 2
    cost: 0.12
    created_at: "2026-07-06T12:00:00Z"
---
::

---

## 3. Example: SMS Campaign using Saved Template ID

If you have already configured a reusable SMS template in your Digishare dashboard, provide its `message_template_id`:

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Send an SMS campaign using a pre-saved message template ID.
variables:
  token: YOUR_ACCESS_TOKEN
  senderId: n84bp7mybrlydovg
  messageTypeId: dxg6ynlpw7k87awb
  templateId: tpl_987654321
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: Account Verification SMS
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
    title: "Account Verification SMS"
    channel: "sms"
    status: "planned"
    recipients_count: 1
    created_at: "2026-07-06T12:05:00Z"
---
::

---

## 4. Dynamic Data Mapping

The `global_data` object acts as the bridge mapping your recipient properties to the placeholders inside the SMS template text:

- **Placeholders**: Use `{{variable_name}}` syntax inside the SMS message text.
- **Recipient References**: Map keys in `global_data` to `%recipient.field_name%`.

```json
{
  "message_template": {
    "template": {
      "channels": {
        "sms": {
          "content": "Hi {{name}}, your balance is {{amount}} MAD."
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
Every placeholder inside the SMS text (e.g. `{{name}}`) **must** exist as a key in `global_data`. Data inside the `recipients` object is only accessible if mapped explicitly in `global_data`.
::
