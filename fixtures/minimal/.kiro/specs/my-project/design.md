---
inclusion: auto
---

# Design — My Project

The system uses a REST API backend with a React frontend.
Authentication uses JWT tokens stored in httpOnly cookies.
The database layer uses parameterized queries to prevent SQL injection.

WHEN the API receives a request SHALL validate the JWT token first.
WHEN the token is invalid SHALL return HTTP 401 with an error message.
WHEN the database query fails SHALL log the error and return HTTP 500.
