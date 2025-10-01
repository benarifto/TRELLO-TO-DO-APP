## Running with Docker

You can run the entire Trello TODO application stack using Docker and Docker Compose. This setup ensures consistent environments for both development and production.

### Requirements
- **Docker** (latest recommended)
- **Docker Compose** (v2 or higher)

### Service Overview
- **Frontend (js-client):**
  - Built with Node.js `22.13.1-slim`
  - Exposes port **8080** (Vite preview server)
- **Backend (js-server):**
  - Built with Node.js `22.13.1-slim`
  - Exposes port **3000** (Fastify API server)
  - Requires a `.env` file in `server/` (see [Environment Configuration](#3-environment-configuration))
- **Database (mysql-db):**
  - Uses the official `mysql:latest` image
  - Exposes port **3306**
  - Credentials and database name must match those in your `server/.env`

### Environment Variables
- The backend (`js-server`) loads environment variables from `server/.env`.
- Example variables:
  ```env
  DB_HOST=mysql-db
  DB_PORT=3306
  DB_USER=trello_user
  DB_PASSWORD=example_password
  DB_NAME=trello_todo_db
  PORT=3000
  NODE_ENV=production
  # ...other variables as needed
  ```
- The MySQL root/user passwords and database name are set in the `docker-compose.yml` file. **Change these for production use.**

### Build and Run Instructions

1. **Copy and configure environment variables:**
   ```bash
   cd server
   cp env.example .env
   # Edit .env as needed (see above)
   cd ..
   ```

2. **Build and start all services:**
   ```bash
   docker compose up --build
   ```
   This will build the frontend and backend images and start the MySQL database.

3. **Access the application:**
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - MySQL: `localhost:3306` (for direct DB access)

### Special Notes
- The database data is persisted in a Docker volume (`mysql-data`).
- The backend and frontend run as non-root users for security.
- The backend expects the database host to be `mysql-db` (the service name in Compose).
- If you do not have a `.env` file in `server/`, comment out the `env_file` line in `docker-compose.yml`.
- For production, update all default passwords and review environment variables for security.

---
