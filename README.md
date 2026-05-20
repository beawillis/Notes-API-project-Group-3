# Notes API — Group 3

A production-ready REST API for managing notes with authentication, role-based access control, analytics, and optional Redis caching.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Analytics & Caching](#analytics--caching)
- [Deployment Notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This backend API provides secure note management (create/read/update/delete) with production-focused features:

- Authentication (JWT)
- Role-based access control (`User`, `Editor`, `Admin`)
- Ownership protection for note resources
- Advanced querying (text search, filters, tags, date ranges)
- Pagination, sorting and validation
- Analytics via MongoDB aggregation
- Optional Redis caching for analytics responses

## Live Deployment

- Render URL: https://group3-g79l.onrender.com

## Features

- Register / Login with hashed passwords
- Note CRUD with ownership checks
- Querying: `q` (text search), `category`, `tags`, `pinned`, `startDate`, `endDate`, `sort`, `page`, `limit`
- Analytics endpoints: most-used categories, most-used tags, most-active users (Admin-only), category stats
- Rate limiting, Helmet, centralized error handling, and input validation

## Tech Stack

- Node.js, Express
- MongoDB (Mongoose)
- Redis (optional)
- JWT, bcryptjs, Joi

---

## Quick Start

Clone and install:

```bash
git clone https://github.com/beawillis/Notes-API-project-Group-3.git
cd Notes-API-project-Group-3
npm install
```

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3002
REDIS_URL=redis://your_redis_connection_string  # optional
```

Do not commit `.env` to source control.

---

## Running Locally

Development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server listens on `PORT` (default 3002).

---

## API Endpoints

Authentication

- `POST /api/auth/register` — Register a new user. Optional `role` permitted; `Admin` may only be assigned by an existing Admin.
- `POST /api/auth/login` — Login and receive a JWT.

Notes (protected — require `Authorization: Bearer <token>`)

- `POST /api/notes` — Create a note.
- `GET /api/notes` — List notes (supports `q`, `category`, `tags`, `pinned`, `startDate`, `endDate`, `sort`, `page`, `limit`).
- `GET /api/notes/:id` — Retrieve a single note (owner or Admin).
- `PUT /api/notes/:id` — Update a note (owner or Admin).
- `DELETE /api/notes/:id` — Delete a note (owner or Admin/Editor depending on route).

Analytics (protected)

- `GET /api/analytics/categories` — Most-used categories (per-user or Admin-wide).
- `GET /api/analytics/tags` — Most-used tags (per-user or Admin-wide).
- `GET /api/analytics/category-stats` — Category statistics (per-user or Admin-wide).
- `GET /api/analytics/active-users` — Most-active users (Admin-only).

Note: analytics endpoints may be cached in Redis if `REDIS_URL` is configured. Caches are invalidated on note writes.

### Search and Pagination Examples
![Search Feature](./screenshots/search-feature.png)
![Pagination Feature](./screenshots/pagination-png)
Use these examples to test the notes list endpoint:

```http
GET /api/notes?q=backend
```

Searches notes whose text matches `backend`.

```http
GET /api/notes?page=1&limit=5
```

Returns the first page with 5 notes per page.

```http
GET /api/notes?page=2&limit=10&sort=-createdAt
```

Returns page 2, 10 notes per page, sorted by newest first.

```http
GET /api/notes?q=node&category=Education&page=1&limit=3
```

Searches notes matching `node`, filters by `Education`, and returns 3 notes per page.

If you are testing in Postman or a browser, remember that `GET /api/notes` is protected and requires:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Analytics & Caching

- Analytics are implemented using MongoDB aggregation pipelines.
- Responses are cached in Redis under `analytics:*` keys for improved performance.
- Redis client implements fail-open behavior: if `REDIS_URL` is absent or the connection fails, caching is disabled to avoid retry storms.

---

## Deployment Notes

- Set `MONGO_URI`, `JWT_SECRET`, and `REDIS_URL` (optional) in your host's environment variables (Render, Heroku, etc.).
- Ensure MongoDB Atlas network access (IP allowlist) and credentials are correct.
- After deploy, check logs for `Database Connected:` and `Redis Connected (<host>)` messages.
- The app uses `PORT=3002` locally by default, so ensure that port is free before starting the server.

---

## Contributing

Contributions welcome — open issues or pull requests with descriptions and tests where possible.

---

## License

This project is provided as-is. No explicit license declared.
