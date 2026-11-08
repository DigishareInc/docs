---
seo:
  title: Digishare Documentation
  description: Official documentation for the Digishare Platform. Guides, API references, and best practices.
---

::UPageHero{title="Modern Customer Engagement, Simplified." description="Build, automate, and scale your communications with the official Digishare Platform interface. Integrate once, reach everywhere." :ui='{"container":"py-12 sm:py-16 lg:py-20 gap-6 sm:gap-y-8"}'}
#links
::UButton{to="/overview/introduction" icon="i-mdi-arrow-right" size="xl" color="primary" trailing}
Get started
::
::UButton{to="/en/developer-guides/authentication" variant="ghost" color="neutral" size="xl"}
API Reference
::

#default
::div{class="flex flex-wrap justify-center gap-2"}
  :UButton{to="/en/developer-guides/message-templates" icon="i-mdi-file-document-outline" label="Message Templates" variant="soft" color="neutral"}
  :UButton{to="/en/developer-guides/campaigns" icon="i-mdi-bullhorn" label="Campaigns" variant="soft" color="neutral"}
  :UButton{to="/en/developer-guides/livechat" icon="i-mdi-forum" label="LiveChat" variant="soft" color="neutral"}
  :UButton{to="/en/developer-guides/thirds" icon="i-mdi-account-group" label="Contacts" variant="soft" color="neutral"}
  :UButton{to="/en/developer-guides/webhooks" icon="i-mdi-webhook" label="Webhooks" variant="soft" color="neutral"}
  :UButton{to="/en/developer-guides/embedded/embedded_chat_docs" icon="i-mdi-message-text" label="Embedded Chat" variant="soft" color="neutral"}
  :UButton{to="/en/use-cases" icon="i-mdi-lightbulb-on" label="Use Cases" variant="soft" color="neutral"}
::
::

::UPageSection{title="Unified Messaging Platform" description="A single secure portal to manage all your customer experiences."}
::UPageGrid
:UPageCard{icon="i-mdi-shield-check" title="Secure Auth" description="Robust authentication using Personal Access Tokens or OAuth 2.0 Client Credentials." to="/developer-guides/authentication"}
:UPageCard{icon="i-mdi-webhook" title="Real-time Webhooks" description="Event-driven architecture. Receive instant notifications for campaign and conversation events." to="/developer-guides/webhooks"}
:UPageCard{icon="i-mdi-forum" title="LiveChat API" description="Bidirectional messaging suite with support for interactive buttons, locations, and media." to="/developer-guides/livechat"}
:UPageCard{icon="i-mdi-bullhorn" title="Campaigns" description="High-volume WhatsApp and SMS marketing with personalized templates and scheduling." to="/developer-guides/campaigns"}
:UPageCard{icon="i-mdi-account-group" title="Contact Management" description="Manage thousands of contacts with custom fields, bulk imports, and sync tags." to="/developer-guides/thirds"}
:UPageCard{icon="i-mdi-cart" title="E-Commerce" description="Automation flows specifically designed for orders, support, and customer follow-ups." to="/use-cases/ecommerce-integration"}
::
::

::UPageSection{title="Built for Developers" description="Standardized API endpoints, detailed error handling, and ready-to-use snippets in multiple languages."}
::UPageGrid
:UPageCard{title="API Best Practices" icon="i-mdi-check-circle" to="/developer-guides/best-practices" description="Learn how to optimize your integration for reliability and speed."}
:UPageCard{title="API Reference" icon="i-mdi-book-open-variant" to="/developer-guides/authentication" description="Explore detailed endpoints, request structures, and authentication guides."}
:UPageCard{title="Developer Guides" icon="i-mdi-book-multiple" to="/en/developer-guides" description="Browse every guide: authentication, campaigns, LiveChat, webhooks and more."}
:UPageCard{title="Use Cases" icon="i-mdi-lightbulb-on" to="/en/use-cases" description="Step-by-step examples for common workflows, like sending a PDF or linking Telegram."}
:UPageCard{title="Multilingual" icon="i-mdi-translate" to="/fr" description="Documentation fully mirrored in English and French."}
::
::

