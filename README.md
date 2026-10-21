# Syncpad

Syncpad is a browser-based collaborative code editor. Multiple people can join the same workspace, see who is online, and edit JavaScript together in real time.

The frontend is built with React, Vite, and Monaco Editor. Yjs and Socket.IO synchronize editor content and collaborator presence through the Node.js backend.

## Features

- Real-time, shared code editing
- Monaco Editor with JavaScript syntax highlighting
- Live collaborator list and connection status
- Join with a username

## Project structure

```text
.
├── Backend/      # Express and Socket.IO collaboration server
├── frontend/     # React + Vite web application
└── dockerfile    # Docker image for the backend
```

## Requirements

- Node.js 20 or later
- npm
- Docker (optional, for running the backend in a container)

## Run locally

Open two terminals from the project root.

### 1. Start the backend

```bash
cd Backend
npm install
npm run dev
```

The backend listens on port `3000`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`), enter a username, and join. Open the same URL in another browser or window with a different username to try collaborative editing.

By default, the frontend connects to the backend at the current hostname on port `3000`. To use a different backend URL, create `frontend/.env.local`:

```dotenv
VITE_SOCKET_URL=http://localhost:3000
```

Replace the example URL with the address reachable by the browser. Restart the Vite server after changing this setting.

## Run the backend with Docker

Build the backend image from the project root:

```bash
docker build -f dockerfile -t syncpad-backend .
```

Start the container:

```bash
docker run --rm -p 3000:3000 syncpad-backend
```

The frontend is not included in this image; start it separately using the frontend instructions above.

## Useful commands

Run these from the corresponding directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `Backend/` | `npm run dev` | Start the backend with Nodemon |
| `Backend/` | `npm start` | Start the backend |
| `frontend/` | `npm run dev` | Start the Vite development server |
| `frontend/` | `npm run build` | Create a production build in `frontend/dist/` |
| `frontend/` | `npm run lint` | Run ESLint |
| `frontend/` | `npm run preview` | Preview the production build locally |
