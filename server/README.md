# API Server

Express.js backend server with TypeScript for the Portfolio Manager application.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

## API Endpoints

<!-- todo -->

- `/health` - Health check
- `/auth/*` - Authentication routes
- `/users/*` - User management
- `/stocks/*` - Stock data
- `/portfolio/*` - Portfolio management
- `/profiles/*` - User profiles
- `/price-history/*` - Stock price history

## Environment Variables

See `.env.example` for required environment variables including Supabase configuration.

## Tech Stack

- Express.js
- TypeScript
- Supabase (Database & Auth)
- Swagger (API Documentation)
