# API Playground Example

Explore our interactive API playground. You can view endpoint details, see code snippets in multiple languages, and execute requests directly.

## Create a New Project

This example shows how to use the `::api-playground` component to document a `POST` endpoint with URL variables and a request body.

::api-playground{method="POST" url="https://api.digishare.ma/v1/projects/{projectId}"}

description: "Initializes a new project container with the specified name and tags."
variables:
projectId: "12345"
token: "your-secret-token"
headers:
Authorization: "Bearer {token}"
Content-Type: "application/json"
body:
name: "Atlas Play"
tags: ["game", "mobile"]

---

::

### How it works

1.  **Variable Replacement**: Notice how `{projectId}` in the URL and `{token}` in the headers are replaced by the values in the `variables` property.
2.  **Dynamic Snippets**: Click the language tabs (cURL, JavaScript, etc.) to see the code update in real-time.
3.  **Execute Directly**: Click "Execute Request" to send a real fetch request. (Note: The API must support CORS for this to work from your browser).

## Get Project Details

A simple `GET` request example.

::api-playground{method="GET" url="https://api.digishare.ma/v1/projects/all"}

## description: "Retrieves a list of all available projects."

::

## Testing with HttpBin

You can also test the execution using a service like `httpbin.org`.

::api-playground{method="POST" url="https://httpbin.org/post"}

description: "Simple test endpoint that mirrors your request."
body:
test: "hello"
source: "ApiPlayground"

---

::
