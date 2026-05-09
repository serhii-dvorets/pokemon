# Pokemon Lists App

Small full-stack application for building and managing custom Pokemon lists with rule validation.

## Stack

- Backend: NestJS (Node.js)
- Frontend: React + TypeScript (Vite)
- Database: MongoDB

## Why This Architecture

- NestJS provides clear module structure, DTO validation, and maintainable REST APIs.
- React + Vite gives fast local iteration and simple stateful UI for list creation and management.
- MongoDB fits document-shaped list data (`name`, `items`, computed totals) and is easy to run in Docker.

## Features

- Browse Pokemon catalog from PokeAPI.
- Create list from selected Pokemon.
- Validation rules before save:
	- At least 3 different species.
	- Total weight must not exceed 1300 hectograms.
- View saved lists.
- Rename list.
- Remove a Pokemon from a saved list with rule re-validation.
- Delete a list.
- Export a saved list to JSON.
- Import list JSON (available from Create List page).

## Project Structure

- `nest_be` - backend API + Mongo persistence
- `react_fe` - frontend web app
- `META.md` - challenge/task description

## Prerequisites

- Docker + Docker Compose
- Node.js 20+
- npm

## Run Locally

### 1. Start backend + database (Docker)

```bash
cd nest_be
cp .env.registry .env
cp .env.defaults docker/env/.env.backend
```

Make sure `docker/env/.env.backend` contains Mongo settings:

```env
MONGO_URI=mongodb://mongo:27017
MONGO_DB_NAME=pokemon
PORT=8000
```

Start services:

```bash
cd docker
docker compose up -d --build
```

Backend will be available at `http://localhost:8000`.

### 2. Start frontend

```bash
cd ../../react_fe
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Optional API base override (if needed):

Create `react_fe/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Summary

- `GET /pokemon` - Pokemon catalog (pagination/search)
- `GET /pokemon-lists` - list summaries
- `GET /pokemon-lists/:id` - list details
- `POST /pokemon-lists` - create list
- `PATCH /pokemon-lists/:id` - rename list
- `DELETE /pokemon-lists/:id` - delete list
- `DELETE /pokemon-lists/:id/items/:pokemonId` - remove one Pokemon from list
- `GET /pokemon-lists/:id/export` - export JSON
- `POST /pokemon-lists/import` - import JSON

## Testing / Validation

Backend build:

```bash
cd nest_be
npm run build
```

Frontend checks:

```bash
cd react_fe
npm run lint
npm run build
```
