
# LegalHealth Check — Frontend (React + Vite-like)

This is a minimal React skeleton that assumes Vite setup.
You can create a Vite app and then copy `src` and `index.html` or use this as a starting point.

## Quick start (recommended)
```bash
cd frontend
# if you don't have a vite project yet:
npm create vite@latest legalhealth-frontend -- --template react
cd legalhealth-frontend
# copy files from this folder's src and index.html over the generated ones
npm install
npm run dev
```

The app expects the backend on http://127.0.0.1:8000
You can change the API base in `src/api/client.js`.
