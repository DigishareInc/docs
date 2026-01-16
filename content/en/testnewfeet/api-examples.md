---
title: API Playground
description: Interactive API reference with live testing capabilities
---

# API Playground

Explore our interactive API playground. View endpoint details, generate code snippets in multiple languages, and execute requests directly from your browser.

::callout{icon="i-lucide-sparkles" color="primary"}
**Pro Tip:** Press `Ctrl+Enter` (or `⌘+Enter` on Mac) to quickly send a request!
::

---

## Authentication

All API requests require authentication via Bearer token in the `Authorization` header.

### Get Authentication Token

Authenticate with your credentials to receive an access token.

::api-playground{method="POST" url="https://api.digishare.ma/v1/auth/login"}

description: "Exchange credentials for an access token. Returns a JWT valid for 24 hours."
headers:
Content-Type: "application/json"
body:
email: "developer@example.com"
password: "your-password"

---

::

---

## Projects

### Create a New Project

Initialize a new project container with the specified configuration.

::api-playground{method="POST" url="https://api.digishare.ma/v1/projects"}

description: "Creates a new project with the given name and tags. Returns the created project object."
variables:
token: "eyJhbGciOiJIUzI1NiIs..."
headers:
Authorization: "Bearer {token}"
Content-Type: "application/json"
body:
name: "Atlas Mobile App"
description: "Cross-platform mobile application"
tags: ["mobile", "react-native", "production"]

---

::

### List All Projects

Retrieve a paginated list of all projects in your workspace.

::api-playground{method="GET" url="https://api.digishare.ma/v1/projects"}

description: "Returns an array of project objects with pagination metadata."
variables:
token: "eyJhbGciOiJIUzI1NiIs..."
headers:
Authorization: "Bearer {token}"

---

::

### Get Project by ID

Retrieve detailed information about a specific project.

::api-playground{method="GET" url="https://api.digishare.ma/v1/projects/{projectId}"}

description: "Returns the full project object including settings and team members."
variables:
projectId: "proj_abc123"
token: "eyJhbGciOiJIUzI1NiIs..."
headers:
Authorization: "Bearer {token}"

---

::

### Update Project

Modify an existing project's configuration.

::api-playground{method="PATCH" url="https://api.digishare.ma/v1/projects/{projectId}"}

description: "Partially updates project fields. Only include fields you want to change."
variables:
projectId: "proj_abc123"
token: "eyJhbGciOiJIUzI1NiIs..."
headers:
Authorization: "Bearer {token}"
Content-Type: "application/json"
body:
name: "Atlas Mobile App v2"
status: "active"

---

::

### Delete Project

Permanently remove a project and all associated data.

::api-playground{method="DELETE" url="https://api.digishare.ma/v1/projects/{projectId}"}

description: "Deletes a project. This action cannot be undone."
variables:
projectId: "proj_abc123"
token: "eyJhbGciOiJIUzI1NiIs..."
headers:
Authorization: "Bearer {token}"

---

::

---

## Testing with HTTPBin

Use `httpbin.org` to test the playground functionality. These endpoints echo your request data back.

### POST Request Test

::api-playground{method="POST" url="https://httpbin.org/post"}

description: "Echo endpoint that mirrors your request. Great for testing the playground!"
headers:
Content-Type: "application/json"
X-Custom-Header: "test-value"
body:
message: "Hello from ApiPlayground!"
timestamp: "2024-01-16T12:00:00Z"
nested:
level: 1
active: true

---

::

### GET Request Test

::api-playground{method="GET" url="https://httpbin.org/get"}

description: "Simple GET request that returns request metadata."

---

::
