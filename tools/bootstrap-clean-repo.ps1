param(
  [string]$OldRepo = "C:\LegalHealthCheck",
  [string]$NewRepo = "C:\LegalHealthCheck_clean"
)

$ErrorActionPreference = "Stop"

# 0) Create new root and init git
if (-not (Test-Path $NewRepo)) { New-Item -ItemType Directory -Path $NewRepo | Out-Null }
Set-Location $NewRepo
if (-not (Test-Path ".git")) { git init | Out-Null }

# 1) Backend skeleton (FastAPI)
New-Item -ItemType Directory -Path "$NewRepo\backend\app" -Force | Out-Null
@'
[tool.ruff]
target-version = "py312"
line-length = 100
lint.select = ["E","F","W","I","UP","B"]

[project]
name = "legalhealthcheck"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi",
  "uvicorn[standard]",
  "pydantic",
  "pydantic-settings"
]
'@ | Set-Content -Encoding UTF8 "$NewRepo\backend\pyproject.toml"

@'
from fastapi import FastAPI
app = FastAPI(title="LegalHealthCheck API")

@app.get("/health")
def health():
    return {"status": "ok"}
'@ | Set-Content -Encoding UTF8 "$NewRepo\backend\app\main.py"

@'
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List

class Settings(BaseSettings):
    app_name: str = "LegalHealthCheck"
    app_env: str = "dev"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, v):
        if isinstance(v, str) and v and v[0] != "[":
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        env_file = ".env"

settings = Settings()
'@ | Set-Content -Encoding UTF8 "$NewRepo\backend\app\core.py"

# 2) Frontend skeleton (Vite + React)
New-Item -ItemType Directory -Path "$NewRepo\frontend\src" -Force | Out-Null
@'
{
  "name": "lhc-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --max-warnings=0",
    "lint:fix": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --fix"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.29.0",
    "vite": "^5.4.0"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0"
  }
}
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\package.json"

@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@api": path.resolve(__dirname, "src/api"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
    },
  },
});
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\vite.config.js"

@'
/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: ["eslint:recommended","plugin:react/recommended","plugin:react-hooks/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  plugins: ["react","react-hooks","import"],
  settings: {
    react: { version: "detect" },
    "import/resolver": { node: { extensions: [".js",".jsx",".ts",".tsx"] } }
  },
  rules: {
    "no-unused-vars": ["error",{ "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-undef": "error",
    "react/prop-types": "off",
    "react/jsx-key": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/no-unresolved": "error"
  },
  ignorePatterns: ["dist/","build/","node_modules/","vite.config.*","eslint.config.*"]
};
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\.eslintrc.cjs"

@'
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@api/*": ["api/*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"]
    }
  },
  "exclude": ["node_modules","dist"]
}
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\jsconfig.json"

@'
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "@pages/Home";
import Checkup from "@pages/Checkup";

function NavBar() {
  return (
    <nav style={{ display: "flex", gap: 16, padding: 12, borderBottom: "1px solid #eee" }}>
      <NavLink to="/" style={{ fontWeight: 700 }}>LegalHealthCheck</NavLink>
      <NavLink to="/checkup">Checkup</NavLink>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkup" element={<Checkup />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\src\main.jsx"

@'
import React from "react";
export default function Home() {
  return <div style={{ padding: 24 }}>Home</div>;
}
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\src\pages\Home.jsx"

@'
import http from "@api/http";
import React from "react";

export default function Checkup() {
  async function submit() {
    const answers = { has_employees: true, bhp_training: false };
    const payload = Object.entries(answers).map(([k,v]) => ({ question_id: k, value: v ? "yes" : "no" }));
    const res = await http.post("/api/v1/audit/checkup", payload);
    alert(JSON.stringify(res.data));
  }
  return <div style={{ padding: 24 }}><button onClick={submit}>Run Checkup</button></div>;
}
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\src\pages\Checkup.jsx"

@'
import axios from "axios";
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: false
});
export default http;
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\src\api\http.js"

@'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LegalHealthCheck</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@ | Set-Content -Encoding UTF8 "$NewRepo\frontend\index.html"

# 3) Root config: pre-commit
@'
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.5
    hooks:
      - id: ruff
        name: ruff (backend)
        files: ^backend/.*\.(py)$
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v9.9.0
    hooks:
      - id: eslint
        name: eslint (frontend)
        files: ^frontend/.*\.(js|jsx|ts|tsx)$
        args: ["--max-warnings=0"]
        additional_dependencies:
          - eslint@9
          - eslint-plugin-react@7
          - eslint-plugin-react-hooks@4
          - eslint-plugin-import@2
          - @eslint/js@9
'@ | Set-Content -Encoding UTF8 "$NewRepo\.pre-commit-config.yaml"

# 4) Copy only "czyste" katalogi ze starego repo (jeśli istnieją)
function Copy-IfExists($src, $dst) {
  if (Test-Path $src) {
    New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
    Copy-Item $src $dst -Recurse -Force
    Write-Host "Copied: $src -> $dst"
  }
}
Copy-IfExists "$OldRepo\frontend\src\components" "$NewRepo\frontend\src\components"
Copy-IfExists "$OldRepo\frontend\src\pages"      "$NewRepo\frontend\src\pages"
Copy-IfExists "$OldRepo\frontend\src\api"        "$NewRepo\frontend\src\api"
Copy-IfExists "$OldRepo\backend\app\api"         "$NewRepo\backend\app\api"
Copy-IfExists "$OldRepo\backend\app\models"      "$NewRepo\backend\app\models"
Copy-IfExists "$OldRepo\backend\app\schemas"     "$NewRepo\backend\app\schemas"
Copy-IfExists "$OldRepo\backend\app\services"    "$NewRepo\backend\app\services"

# 5) Basic gitignore
@'
# system
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Python
backend/.venv/
backend/.mypy_cache/
backend/__pycache__/

# Node
frontend/node_modules/
frontend/dist/
frontend/.vite/

# temp
**/_old/
**/_stash/
**/__trash/
**/tmp/
**/temp/
*.log
*.tmp
'@ | Set-Content -Encoding UTF8 "$NewRepo\.gitignore"

Write-Host "Bootstrap done. Next steps:"
Write-Host "1) cd $NewRepo\frontend && npm i"
Write-Host "2) cd $NewRepo\backend && pip install ruff fastapi uvicorn pydantic pydantic-settings"
Write-Host "3) cd $NewRepo && pip install pre-commit && pre-commit install"
Write-Host "4) Start: uvicorn app.main:app --reload  |  npm run dev"
