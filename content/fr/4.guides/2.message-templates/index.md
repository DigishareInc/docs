---
navigation:
  title: Vue d'ensemble
title: Créer un modèle de message
description: Un seul écran pour écrire un message pour WhatsApp, Telegram, SMS et e-mail. Comparez les canaux et choisissez le bon.
icon: i-mdi-file-document-edit-outline
---

Un **modèle de message** est un message prêt à l'emploi. Vous l'utilisez dans les campagnes, les automatisations et le chat. Un même modèle peut avoir **un texte par canal** : WhatsApp, Telegram, SMS et e-mail.

## Ouvrir l'éditeur

::steps

### Cliquez sur « + »

En haut de l'écran, cliquez sur **+**, puis sur **Modèle de message**. Vous pouvez aussi ouvrir **Modèles de messages** et cliquer sur **New template (builder)**.

### Choisissez le premier canal

L'éditeur demande : **Où ce message sera-t-il envoyé ?** Choisissez **Modèle WhatsApp**, **Message WhatsApp**, **Telegram**, **SMS** ou **Email**.

### Donnez un nom au modèle

Le **Nom du modèle** sert à le retrouver dans la liste. Seule votre équipe le voit.

### Ajoutez d'autres canaux si besoin

Cliquez sur **Ajouter Telegram**, **Ajouter SMS**… pour écrire le même message sur un autre canal. Les **variables** sont partagées par tous les canaux.

### Enregistrez

Cliquez sur **Créer le modèle**. Pour un modèle WhatsApp, cliquez sur **Enregistrer et envoyer à Meta**.

::

::tip
Un compteur **« … à corriger »** en haut liste ce qui manque avant l'envoi. Cliquez dessus, puis sur une ligne, pour aller au bon champ.
::

## Comparer les canaux

| | Modèle WhatsApp | Message WhatsApp | Telegram | SMS | E-mail |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Validation** | Meta doit l'approuver | Aucune | Aucune | Aucune | Aucune |
| **Quand l'envoyer** | À tout moment | Dans les 24 h après le dernier message du contact | Au contact qui a démarré votre bot | À tout moment | À tout moment |
| **Contenu** | En-tête, corps, pied de page, boutons, carrousel | Texte, média, boutons et listes | Texte, fichier, boutons | Texte simple | Glisser-déposer ou HTML |
| **Texte max.** | 1024 caractères (corps) | 4096 caractères | 4096 caractères | 160 par partie (70 avec émojis ou accents) | — |
| **Mise en forme** | `*gras*` `_italique_` `~barré~` | `*gras*` `_italique_` `~barré~` | Markdown : `*gras*` `_italique_` `` `code` `` | Aucune | Éditeur visuel |
| **Variables** | `{{1}}`, `{{2}}`… avec un exemple | `{{prenom}}` | `{{prenom}}` | `{{prenom}}` | `{{prenom}}` |

::note
**Modèle WhatsApp ou Message WhatsApp ?** Pour écrire en premier à un contact (une campagne, un rappel), il faut un **Modèle WhatsApp** approuvé. Le **Message WhatsApp** sert seulement pour répondre dans les 24 h qui suivent le dernier message du contact.
::

## Les variables

Une variable met une valeur propre à chaque contact dans le message, par exemple son prénom ou son numéro de commande.

- Dans un message, cliquez sur **Ajouter une variable**, ou écrivez directement `{{prenom}}` : la variable est créée.
- Chaque variable a une **clé** (minuscules, chiffres et `_`, par exemple `prenom`) et une **valeur par défaut**.
- La **valeur par défaut** est envoyée quand un contact n'a pas de valeur propre.
- Dans une campagne, chaque variable est remplie par contact : saisie, ou depuis une **colonne Excel nommée comme la clé**.
- Le panneau **Variables** liste toutes les variables du modèle. Vous pouvez les renommer partout ou supprimer celles qui ne servent pas.

## Guides par canal

::card-group
::card{title="WhatsApp" icon="i-mdi-whatsapp" to="/fr/guides/message-templates/whatsapp"}
Modèle approuvé par Meta, et message libre dans la fenêtre de 24 h.
::
::card{title="Telegram" icon="i-mdi-send" to="/fr/guides/message-templates/telegram"}
Texte, fichier ou boutons, envoyés par votre bot.
::
::card{title="SMS" icon="i-mdi-message-text" to="/fr/guides/message-templates/sms"}
Texte simple, compté en parties SMS.
::
::card{title="E-mail" icon="i-mdi-email" to="/fr/guides/message-templates/email"}
Glisser-déposer ou votre propre HTML.
::
::
