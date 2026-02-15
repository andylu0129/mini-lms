# Mini LMS

## Table of Contents

- [Prerequisites](#prerequisites)
  - [Node.js Setup](#nodejs-setup)
  - [Docker Setup](#docker-setup)
  - [Supabase Setup](#supabase-setup)
- [Running the Project](#running-the-project)
  - [Using Docker](#using-docker)
  - [Without Docker](#without-docker)
- [Stopping the Project](#stopping-the-project)
- [Deployed Version](#deployed-version)

## Prerequisites

### Node.js Setup

This project requires **Node.js v20**. It is recommend to use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

1. **Install nvm**

   **macOS / Linux:**

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```

   **Windows:**

   Download and install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) from the latest release.

2. **Install and use Node.js v20**

   **macOS / Linux:**

   ```bash
   nvm install 20
   nvm use 20
   ```

   **Windows:**

   ```powershell
   nvm install 20
   nvm use 20
   ```

3. **Verify the installation**

   ```bash
   node -v
   ```

   You should see a version starting with `v20`.

### Docker Setup

1. **Install Docker Desktop and CLI**

   Download and install from the official site: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Configure Docker Desktop settings** (Settings > General)

   Enable the following options:
   - **Expose daemon on tcp://localhost:2375 without TLS**
   - **Use the WSL 2 based engine** (Windows Home can only run the WSL 2 backend)
   - **Add the \*.docker.internal names to the host's /etc/hosts file** (requires password)

### Supabase Setup

> **Note:** Supabase requires Docker to be installed and running.

1. **Install the Supabase CLI**

   **Windows (via Scoop):**

   If you don't have Scoop installed, run the following in PowerShell:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

   # Reverts the execution policy back to its default.
   Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser
   ```

   Then install the Supabase CLI:

   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **macOS / Linux (via Homebrew):**

   ```bash
   brew install supabase/tap/supabase
   ```

2. **Start Supabase**

   ```bash
   supabase start
   ```

3. **Reset the database** (applies migrations and seed data)

   ```bash
   supabase db reset
   ```

## Running the Project

### Using Docker Container

1. Build and start the container:

   ```bash
   docker compose up --build
   ```

2. Access the app at [http://localhost:3000](http://localhost:3000)

### Without Docker Container

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Build the app:

   ```bash
   npm run build
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Access the app at [http://localhost:3000](http://localhost:3000)

## Stopping the Project

- **Stop Supabase:**

  ```bash
  supabase stop
  ```

- **Stop the Docker container:**

  ```bash
  docker compose down
  ```

## Deployed Version

[https://placeholder-url.com]()
