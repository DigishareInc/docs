---
navigation:
  title: Vue d'ensemble
title: Exporter les tickets vers Excel
description: Choisissez exactement les colonnes et les données personnalisées de vos tickets, puis téléchargez un fichier Excel.
icon: i-mdi-microsoft-excel
---

L'**export avancé** crée un fichier Excel (.xlsx) avec **les colonnes que vous choisissez** : les champs du ticket, les champs du contact, et les **données personnalisées** de vos tickets (le champ « Informations »), clé par clé.

:guide-video{src="/docs/guides/ticket-export-fr.mp4" poster="/docs/guides/ticket-export-poster-fr.webp"}

::note
Les données montrées dans la vidéo sont fictives.
::

::collapsible{name="la version en darija"}
:guide-video{src="/docs/guides/ticket-export-ar.mp4" poster="/docs/guides/ticket-export-poster.webp"}
::

## Étapes

::steps

### Ouvrez l'export avancé

Dans **Tickets**, cliquez sur l'icône **Exporter**, puis sur **Export avancé (Excel)**.

![Menu Exporter avec l'option Export avancé (Excel)](/docs/guides/export-menu.webp)

### Choisissez les tickets

En haut, vous voyez combien de tickets seront exportés. Choisissez **Tous les tickets des filtres** (les filtres de la liste s'appliquent), ou **Tickets sélectionnés** si vous avez coché des tickets dans la liste.

### Cochez les champs

Cochez les champs du ticket (statut, type, assigné, dates…) et du contact (nom, mobile, email…).

![Fenêtre d'export : champs du ticket et du contact, et vos colonnes à droite](/docs/guides/export-dialog.webp)

### Ajoutez des données personnalisées

La partie **Informations** liste les clés trouvées dans vos tickets. À côté de chaque clé, vous voyez **dans combien de tickets** elle est remplie et **un exemple de valeur**.

- Cochez une clé pour avoir **sa propre colonne**.
- Pour un groupe (par exemple *Livraison*), ouvrez-le et cochez seulement les clés utiles, ou cochez le groupe entier pour le mettre **dans une seule cellule**.

![Données personnalisées avec le nombre de tickets et un exemple par clé](/docs/guides/export-custom-data.webp)

### Cherchez un champ

Beaucoup de champs ? Tapez un mot dans la recherche. Une **étiquette jaune « aussi : … »** veut dire qu'une autre clé a presque le même nom (par exemple *email* et *Email*) : vérifiez laquelle contient vos données.

![Recherche « email » avec l'étiquette jaune sur deux clés proches](/docs/guides/export-search.webp)

### Rangez et renommez les colonnes

À droite, **Vos colonnes** suit l'ordre du fichier. Glissez une colonne pour la déplacer, cliquez sur son nom pour le renommer, ou retirez-la avec ×. L'**aperçu** en bas montre les trois premières lignes du fichier.

![Aperçu des trois premières lignes avec les colonnes choisies](/docs/guides/export-preview.webp)

### Enregistrez un modèle

Vous refaites souvent le même export ? Donnez un nom et cliquez sur **Enregistrer**. Retrouvez-le ensuite dans **Modèles**, en haut de la fenêtre.

![Menu Modèles avec un modèle enregistré](/docs/guides/export-presets.webp)

### Exportez

Cliquez sur **Exporter … tickets**. Le fichier Excel se télécharge.

::

## Bon à savoir

- **Jusqu'à 50 000 tickets** par fichier. Au-delà, réduisez les filtres (par exemple par période).
- Les clés des données personnalisées viennent des **500 derniers tickets** des filtres. Une clé très rare peut ne pas apparaître.
- Les **modèles** sont enregistrés **dans ce navigateur**, pour cette entreprise. Ils ne sont pas partagés avec votre équipe.
- Les **exports rapides (CSV)** du même menu ne prennent que **les tickets de la page affichée**.
