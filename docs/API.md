# API Documentation

## Base URL

- **Production**: `https://api.nfinnite.ai`
- **Local Development**: `http://localhost:3000`

## Authentication

All API requests require a Bearer token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.nfinnite.ai/api/v1/generate
```

## Endpoints

### Health Check

#### `GET /health`

Check if the engine is operational.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00Z",
  "engine": {
    "ready": true
  }
}
```

#### `GET /health/ready`

Check if the engine is ready (Kubernetes liveness probe compatible).

**Response (Ready):**
```json
{
  "ready": true
}
```

**Response (Not Ready):**
```json
{
  "ready": false
}
```
Status: 503

---

### Code Generation

#### `POST /api/v1/generate`

Generate code based on a prompt.

**Request:**
```json
{
  "prompt": "Create a function that validates email addresses",
  "language": "typescript"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "code": "function validateEmail(email: string): boolean { ... }",
    "language": "typescript"
  }
}
```

**Parameters:**
- `prompt` (string, required): Description of what code to generate
- `language` (string, optional): Programming language (default: "typescript")

**Response:**
- `status` (string): "success" or "error"
- `data.code` (string): Generated code
- `data.language` (string): Language used

---

### Code Analysis

#### `POST /api/v1/analyze`

Analyze code for quality, performance, and issues.

**Request:**
```json
{
  "code": "function add(a, b) { return a + b; }"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "analysis": {
      "language": "javascript",
      "symbols": [
        {
          "name": "add",
          "type": "function",
          "line": 1,
          "column": 10
        }
      ],
      "dependencies": [],
      "complexity": 1,
      "issues": []
    }
  }
}
```

**Parameters:**
- `code` (string, required): Code to analyze

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required parameter: prompt",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Missing authorization header",
  "statusCode": 401
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "statusCode": 429
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "statusCode": 500
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: `X-RateLimit-*` headers included in response

---

## Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: 'Bearer YOUR_API_KEY'
  }
});

// Generate code
const result = await api.post('/api/v1/generate', {
  prompt: 'Create a React button component',
  language: 'typescript'
});

console.log(result.data.data.code);
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.post(
    'http://localhost:3000/api/v1/generate',
    json={
        'prompt': 'Create a Python function that reverses a string',
        'language': 'python'
    },
    headers=headers
)

print(response.json()['data']['code'])
```

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a Rust struct for a user profile",
    "language": "rust"
  }'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request |
| 401  | Unauthorized |
| 429  | Too Many Requests |
| 500  | Internal Server Error |
| 503  | Service Unavailable |

---

## Versioning

API versioning is done via URL path (e.g., `/api/v1/`, `/api/v2/`). Current version is `v1`.

---

## Support

For API issues or questions:
- Check [Architecture Guide](./ARCHITECTURE.md)
- Open a GitHub Issue
- Review code examples in the repository
