---
seo:
  title: Documentation Digishare
  description: Documentation officielle de la plateforme Digishare. Guides, références API et meilleures pratiques.
---

::UPageHero{title="Engagement Client Moderne, Simplifié." description="Construisez, automatisez et développez vos communications avec l'interface officielle de la plateforme Digishare. Intégrez une fois, diffusez partout." :ui='{"container":"py-12 sm:py-16 lg:py-20 gap-6 sm:gap-y-8"}'}
#links
::UButton{to="/fr/overview/introduction" icon="i-mdi-arrow-right" size="xl" color="primary" trailing}
Commencer
::
::UButton{to="/fr/developer-guides/authentication" variant="ghost" color="neutral" size="xl"}
Référence API
::

#default
::div{class="flex justify-center"}
  :UContentSearchButton{:collapsed="false" size="xl" variant="outline" class="w-full" style="max-width: 36rem"}
::
::

::UPageSection{title="Je veux…" description="Choisissez ce que vous voulez faire, la bonne page s'ouvre."}
::UPageGrid
:UPageCard{icon="i-lucide-megaphone" title="Envoyer une campagne" description="WhatsApp, SMS ou Telegram, à des milliers de contacts, par l'API." to="/fr/developer-guides/campaigns"}
:UPageCard{icon="i-lucide-file-pen-line" title="Créer un modèle de message" description="Pas à pas dans l'application, pour WhatsApp, Telegram, SMS et e-mail." to="/fr/guides/message-templates"}
:UPageCard{icon="i-lucide-key-round" title="Connecter l'API" description="Créez votre jeton et faites votre premier appel." to="/fr/developer-guides/authentication"}
:UPageCard{icon="i-lucide-webhook" title="Recevoir des webhooks" description="Soyez prévenu à chaque message, statut de livraison ou ticket." to="/fr/developer-guides/webhooks"}
:UPageCard{icon="i-lucide-messages-square" title="Répondre aux clients par l'API" description="Lisez et envoyez les messages du LiveChat depuis votre système." to="/fr/developer-guides/livechat"}
:UPageCard{icon="i-lucide-users" title="Gérer mes contacts" description="Créez, importez et complétez vos contacts avec des champs personnalisés." to="/fr/developer-guides/thirds"}
:UPageCard{icon="i-lucide-file-text" title="Envoyer un PDF avec un texte" description="Un devis ou une facture et son texte, dans un seul message WhatsApp ou Telegram." to="/fr/use-cases/send-pdf-with-caption"}
:UPageCard{icon="i-lucide-send" title="Lier mes contacts à Telegram" description="Un lien personnel par contact, pour qu'il reçoive vos messages Telegram." to="/fr/use-cases/link-contacts-to-telegram"}
:UPageCard{icon="i-lucide-sheet" title="Exporter les tickets vers Excel" description="Choisissez les colonnes et les données de vos tickets, puis téléchargez le fichier." to="/fr/guides/export-tickets"}
::
::

::UPageSection{title="Plateforme de Messagerie Unifiée" description="Un portail unique et sécurisé pour gérer toutes vos expériences client."}
::UPageGrid
:UPageCard{icon="i-mdi-shield-check" title="Auth Sécurisée" description="Authentification robuste via des Jetons d'Accès Personnels ou OAuth 2.0." to="/fr/developer-guides/authentication"}
:UPageCard{icon="i-mdi-webhook" title="Webhooks en Temps Réel" description="Architecture pilotée par les événements. Recevez des notifications instantanées pour vos campagnes." to="/fr/developer-guides/webhooks"}
:UPageCard{icon="i-mdi-forum" title="API LiveChat" description="Suite de messagerie bidirectionnelle avec support pour boutons, localisation et médias." to="/fr/developer-guides/livechat"}
:UPageCard{icon="i-mdi-bullhorn" title="Campagnes" description="Marketing WhatsApp et SMS à haut volume avec modèles personnalisés et planification." to="/fr/developer-guides/campaigns"}
:UPageCard{icon="i-mdi-account-group" title="Gestion des Contacts" description="Gérez des milliers de contacts avec des champs personnalisés et des imports en masse." to="/fr/developer-guides/thirds"}
:UPageCard{icon="i-mdi-cart" title="E-Commerce" description="Flux d'automatisation conçus pour les commandes, le support et le suivi client." to="/fr/use-cases/ecommerce-integration"}
::
::

::UPageSection{title="Conçu pour les Développeurs" description="Points de terminaison API standardisés, gestion détaillée des erreurs et extraits de code multilingues."}
::UPageGrid

:UPageCard{title="Référence API" icon="i-mdi-book-open-variant" to="/fr/developer-guides/authentication" description="Explorez les points de terminaison, les structures de requêtes et l'authentification."}
:UPageCard{title="Guides développeur" icon="i-mdi-book-multiple" to="/fr/developer-guides" description="Parcourez tous les guides : authentification, campagnes, LiveChat, webhooks et plus."}
:UPageCard{title="Cas d'usage" icon="i-mdi-lightbulb-on" to="/fr/use-cases" description="Des exemples pas à pas pour les besoins courants, comme envoyer un PDF ou lier Telegram."}
:UPageCard{title="Multilingual" icon="i-mdi-translate" to="/" description="Documentation entièrement disponible en Anglais et Français."}
::
::

