# SyncUp Backend — Local setup

This document explains how to run the backend locally for development, including a Docker-based MySQL option.

Prerequisites
- Node.js (v16+), npm
- Docker (optional, recommended for local DB)
- Git

Quick start (Docker MySQL)

1. Start a MySQL container for local development:

```bash
docker run --name syncup-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=syncup_dev \
  -e MYSQL_USER=syncup_user \
  -e MYSQL_PASSWORD=syncup_pass \
  -p 3306:3306 -d mysql:8
```

2. Copy the example env and edit values if needed:

```bash
cd backend
cp .env.example .env
# Edit .env and replace placeholders (DATABASE_URL, JWT_SECRET) if required
```

Example `.env` values (do NOT commit `.env`):

```
PORT=5001
JWT_SECRET=change_this_to_a_secure_secret
DATABASE_URL="mysql://syncup_user:syncup_pass@127.0.0.1:3306/syncup_dev"
```

3. Install dependencies and generate Prisma client:

```bash
npm install
npx prisma generate
```

4. Apply migrations (create schema in your DB):

```bash
npx prisma migrate deploy
# or, for development schema push (no migrations):
# npx prisma db push
```

5. Start the backend:

```bash
PORT=5001 npm start
```

6. Test endpoints (signup + login):

Create a demo user:
```bash
curl -i -X POST http://localhost:5001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","password":"password123"}'
```

Login:
```bash
curl -i -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

Frontend setup
- The frontend reads the backend URL from `REACT_APP_API_URL` or from the hardcoded default in `frontend/src/context/AuthContext.jsx`.
- To run the frontend against the local backend:

```bash
cd ../frontend
REACT_APP_API_URL=http://localhost:5001 npm start
```

Stop and cleanup
- Stop the backend: kill the node process (or Ctrl+C if foreground)
- Stop and remove the Docker container:
```bash
docker stop syncup-mysql && docker rm syncup-mysql
```

Notes & best practices
- Keep `.env` out of version control (it's already listed in `backend/.gitignore`).
- Use a strong `JWT_SECRET` for any non-local testing.
- If macOS reserves port 5000 (AirPlay/Control Center), either disable AirPlay Receiver in System Settings or use a different port (5001 is used in this project).
- When ready for production, remove any dev-only fallbacks and ensure proper secrets/DB hosting.

Troubleshooting
- CORS errors: the backend uses `cors()` middleware. Ensure frontend origin and backend port match and the backend is running.
- Prisma errors about `DATABASE_URL`: ensure `.env` has DATABASE_URL and the DB is reachable.

If you'd like, I can add a `backend/README.md` section for running the DB via Docker Compose or add a `Makefile` with common commands.
