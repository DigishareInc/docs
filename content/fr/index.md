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
::div{class="flex flex-wrap justify-center gap-2"}
  :UButton{to="/fr/developer-guides/message-templates" icon="i-mdi-file-document-outline" label="Modèles de message" variant="soft" color="neutral"}
  :UButton{to="/fr/developer-guides/campaigns" icon="i-mdi-bullhorn" label="Campagnes" variant="soft" color="neutral"}
  :UButton{to="/fr/developer-guides/livechat" icon="i-mdi-forum" label="LiveChat" variant="soft" color="neutral"}
  :UButton{to="/fr/developer-guides/thirds" icon="i-mdi-account-group" label="Contacts" variant="soft" color="neutral"}
  :UButton{to="/fr/developer-guides/webhooks" icon="i-mdi-webhook" label="Webhooks" variant="soft" color="neutral"}
  :UButton{to="/fr/developer-guides/embedded/embedded_chat_docs" icon="i-mdi-message-text" label="Chat intégré" variant="soft" color="neutral"}
  :UButton{to="/fr/use-cases" icon="i-mdi-lightbulb-on" label="Cas d'usage" variant="soft" color="neutral"}
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

