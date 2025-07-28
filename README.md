# Portfolio Manager

A full-stack portfolio management application with a React frontend and Express backend.

## Quick Start

```bash
# Install dependencies for all packages
npm run install:all

# Start development servers (both frontend and backend)
npm run dev

# Or run individually:
npm run dev:web    # Frontend only
npm run dev:server # Backend only
```

## Project Structure

- `web/` - React frontend with TypeScript and Vite
- `server/` - Express backend with TypeScript
- `package.json` - Root workspace configuration

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run format` - Format code with Prettier

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, TypeScript, Supabase
- **Database**: Supabase (PostgreSQL)

## Development

Each package has its own README with specific setup instructions:

- [Web Frontend](./web/README.md)
- [API Server](./server/README.md)
