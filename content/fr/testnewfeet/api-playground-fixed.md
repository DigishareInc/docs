# Exemple de l'Aire de Jeux API Corrigé

Explorez notre aire de jeux API interactive. Vous pouvez voir les détails des points de terminaison, voir des extraits de code dans plusieurs langues et exécuter des requêtes directement.

## Créer un Nouveau Projet

Cet exemple montre comment utiliser le composant `::api-playground` pour documenter un point de terminaison `POST` avec des variables d'URL et un corps de requête.

## ::api-playground{method="POST" url="https://api.digishare.ma/v1/projects/{projectId}"}

description: "Initialise un nouveau conteneur de projet avec le nom et les balises spécifiés."
variables:
projectId: "12345"
token: "votre-jeton-secret"
headers:
Authorization: "Bearer {token}"
Content-Type: "application/json"
body:
name: "Atlas Play"
tags: ["jeu", "mobile"]

---

::

### Comment ça marche

1.  **Remplacement de Variable** : Remarquez comment `{projectId}` dans l'URL et `{token}` dans les en-têtes sont remplacés par les valeurs de la propriété `variables`.
2.  **Snippets Dynamiques** : Cliquez sur les onglets de langue (cURL, JavaScript, etc.) pour voir le code se mettre à jour en temps réel.
3.  **Exécuter Directement** : Cliquez sur "Exécuter la requête" pour envoyer une vraie requête fetch.

## Obtenir les Détails du Projet

Un exemple simple de requête `GET`.

## ::api-playground{method="GET" url="https://api.digishare.ma/v1/projects/all"}

## description: "Récupère une liste de tous les projets disponibles."

::

## Tester avec HttpBin

Vous pouvez également tester l'exécution en utilisant un service comme `httpbin.org`.

## ::api-playground{method="POST" url="https://httpbin.org/post"}

description: "Point de terminaison de test simple qui reflète votre requête."
body:
test: "bonjour"
source: "ApiPlayground"

---

::
