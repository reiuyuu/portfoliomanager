# Colors API

Simple RESTful API for colors CRUD operations.

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start API server**
   ```bash
   npm run server
   ```

Server runs at `http://localhost:3001`

## API Endpoints

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | `/api/health`     | Health check    |
| GET    | `/api/colors`     | Get all colors  |
| GET    | `/api/colors/:id` | Get color by ID |
| POST   | `/api/colors`     | Create color    |
| PUT    | `/api/colors/:id` | Update color    |
| DELETE | `/api/colors/:id` | Delete color    |

## Examples

**Create color**

```bash
curl -X POST http://localhost:3001/api/colors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Blue", "hex": "#4285F4"}'
```

**Get all colors**

```bash
curl http://localhost:3001/api/colors
```

**Update color**

```bash
curl -X PUT http://localhost:3001/api/colors/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Blue"}'
```

**Delete color**

```bash
curl -X DELETE http://localhost:3001/api/colors/1
```
