---
navigation:
  title: Overview
title: Export tickets to Excel
description: Choose exactly which columns and custom data of your tickets to export, then download an Excel file.
icon: i-mdi-microsoft-excel
---

The **advanced export** creates an Excel file (.xlsx) with **the columns you choose**: ticket fields, contact fields, and your tickets' **custom data** (the "Information" field), key by key.

:guide-video{src="/docs/guides/ticket-export-en.mp4" poster="/docs/guides/ticket-export-poster-en.webp"}

::note
The video has captions. The data it shows is fictional. The app in the screenshots below is in French.
::

::collapsible{name="the French version"}
:guide-video{src="/docs/guides/ticket-export-fr.mp4" poster="/docs/guides/ticket-export-poster-fr.webp"}
::

::collapsible{name="the Moroccan Darija version"}
:guide-video{src="/docs/guides/ticket-export-ar.mp4" poster="/docs/guides/ticket-export-poster.webp"}
::

## Steps

::steps

### Open the advanced export

In **Tickets**, click the **Export** icon (*Exporter*), then **Advanced export (Excel)** (*Export avancé*).

![Export menu with the Advanced export (Excel) option](/docs/guides/export-menu.webp)

### Choose the tickets

At the top you see how many tickets will be exported. Choose **All tickets matching the filters** (the list's filters apply), or **Selected tickets** if you ticked tickets in the list.

### Tick the fields

Tick the ticket fields (status, type, assignee, dates…) and the contact fields (name, mobile, email…).

![Export window: ticket and contact fields, your columns on the right](/docs/guides/export-dialog.webp)

### Add custom data

The **Information** part lists the keys found in your tickets. Next to each key you see **in how many tickets** it is filled and **a sample value**.

- Tick a key to get **its own column**.
- For a group (for example *Livraison*), open it and tick only the keys you need, or tick the whole group to put it **in one cell**.

![Custom data with the ticket count and a sample per key](/docs/guides/export-custom-data.webp)

### Search for a field

Many fields? Type a word in the search box. A **yellow "also: …" tag** means another key has almost the same name (for example *email* and *Email*): check which one holds your data.

![Search for "email" with the yellow tag on two similar keys](/docs/guides/export-search.webp)

### Order and rename the columns

On the right, **Your columns** follows the file's order. Drag a column to move it, click its name to rename it, or remove it with ×. The **preview** below shows the file's first three rows.

![Preview of the first three rows with the chosen columns](/docs/guides/export-preview.webp)

### Save a preset

Do you often run the same export? Type a name and click **Save**. Find it later under **Presets** (*Modèles*) at the top of the window.

![Presets menu with a saved preset](/docs/guides/export-presets.webp)

### Export

Click **Export … tickets**. The Excel file downloads.

::

## Good to know

- **Up to 50,000 tickets** per file. Beyond that, narrow the filters (for example by date).
- Custom data keys come from the **last 500 tickets** matching the filters. A very rare key may not show.
- **Presets** are saved **in this browser**, for this company. They are not shared with your team.
- The **quick exports (CSV)** in the same menu only include **the tickets on the current page**.
