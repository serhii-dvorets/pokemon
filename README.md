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

## Run Locally

### 1. Start all services with one command

```bash
docker compose up --build
```

This starts:

- Frontend at `http://localhost:5173`
- Backend at `http://localhost:8000`
- MongoDB at `mongodb://localhost:27017`

### 2. Stop all services

```bash
docker compose down
```

To remove containers and Mongo volume data:

```bash
docker compose down -v
```

### Notes

- Compose reads backend env vars from `nest_be/docker/env/.env.backend`.
- `MONGO_URI`, `MONGO_DB_NAME`, and `PORT` are also set in `docker-compose.yml` for predictable local startup.
- Frontend API base URL is injected in the frontend container as `VITE_API_BASE_URL=http://localhost:8000`.

## Optional: Run Without Docker

### Backend (NestJS)

```bash
cd nest_be
npm install
npm run start:dev
```

### Frontend (React)

```bash
cd react_fe
npm install
npm run dev
```

Optional frontend API base override in `react_fe/.env`:

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
