# Editor Service - Y.js Collaboration Backend

This service provides real-time collaborative editing capabilities using [Yjs](https://yjs.dev/) and [
`@y/hub`](https://github.com/yjs/y-hub). It consists of two separate Node.js processes:

- **`editor-server`** – WebSocket server that accepts client connections and serves real‑time collaboration.
- **`editor-worker`** – Background worker that handles persistence and compaction tasks.

Both components share the same Docker image and codebase, but run different entry points.

## Architecture Overview

- **Redis** – Used as a message broker and ephemeral store for Yjs updates (configured via `REDIS` env var).
- **PostgreSQL** – Stores Yjs document snapshots, metadata, and history (configured via `POSTGRES` env var).
- **Y‑Hub** – Manages room lifecycle, authentication, and the persistence layer.

The `editor-server` exposes a WebSocket server on port `3000`. The `editor-worker` runs continuously, processing tasks
like document compaction and garbage collection.

## Dockerfile Notes

**Base image:** `ubuntu:24.04` (not a Node.js official image).

**Reason:** The `@y/hub` package transitively depends on `uws` (a native WebSocket library), which requires a specific
version of `gcc` and `g++` that is not available in the slim Node.js Alpine or Debian‑based images. Using a full Ubuntu
image guarantees that the required build toolchain is present, ensuring a successful `npm install` of all native
dependencies.

## Prerequisites

- Docker & Docker Compose
- A running Redis container (the main compose file includes one)
- A running PostgreSQL container (the main compose file includes one)

## Environment Variables

All environment variables are set in the root `.env` file. Relevant variables for the editor service:

| Variable             | Description                       | Example                                        |
|----------------------|-----------------------------------|------------------------------------------------|
| `EDITOR_DB_NAME`     | Name of the PostgreSQL database   | `editor`                                       |
| `EDITOR_DB_USER`     | Database user                     | `yhub`                                         |
| `EDITOR_DB_PASSWORD` | Database password                 | `yhub`                                         |
| `EDITOR_DB_URL`      | Full PostgreSQL connection string | `postgresql://yhub:yhub@editor-db:5432/editor` |
| `REDIS_URL`          | Redis connection string           | `redis://redis:6379`                           |

Make sure these are properly defined in the project’s `.env` file (copy from `.env.example`).