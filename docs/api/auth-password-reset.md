# POST /api/auth/password-reset

Sends a password reset email to the user with the given email address.

## Request

- Method: POST
- Path: `/api/auth/password-reset`

### Body

```json
{
  "email": "user@example.com"
}
```

- `email` (string, required): The email address for the account.

## Responses

- 200 OK

  ```json
  { "message": "Password reset email sent" }
  ```

- 400 Bad Request

  ```json
  { "errors": [{ "path": ["email"], "message": "Invalid email address" }] }
  ```

  or

  ```json
  { "error": "Invalid JSON body" }
  ```

- 404 Not Found

  ```json
  { "error": "Email not found" }
  ```

- 429 Too Many Requests

  ```json
  { "error": "Too Many Requests" }
  ```

- 500 Internal Server Error
  ```json
  { "error": "Internal Server Error" }
  ```

## Rate Limiting

Max 3 requests per minute per IP address.
