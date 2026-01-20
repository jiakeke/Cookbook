# Cookbook Project

This project is a full-stack web application with a React frontend and a Node.js/Express backend.

## Configuration

Configuration for both the frontend and backend is managed using `.env` files. You will need to create or modify the `.env` files in both the `frontend` and `backend` directories.

### Frontend Configuration

Create a file named `.env` in the `/frontend` directory.

**File:** `frontend/.env`

```
# The host address for the frontend development server.
# 0.0.0.0 allows access from other devices on the same network.
HOST=0.0.0.0

# The port for the frontend development server.
PORT=3000

# The base URL of the backend API.
# This is used by the frontend to make API requests.
VITE_API_BASE_URL=http://localhost:5001
```

### Backend Configuration

Create a file named `.env` in the `/backend` directory.

**File:** `backend/.env`

```
# The connection string for your MongoDB database.
MONGO_URI=mongodb://localhost:27017/cookbook

# A secret key for signing JWT (JSON Web Tokens).
# Should be a long, random string for production environments.
JWT_SECRET=a8d4f7b2e0c9a1b3f5d6e7c8a9b0d1c2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8

# The port for the backend API server.
PORT=5001

# The origin URL of the frontend application.
# This is used for CORS (Cross-Origin Resource Sharing) to allow API requests from the frontend.
CORS_ORIGIN=http://localhost:3000
```

## Getting Started

To run the project, you will need to start both the backend and frontend servers.

### Running the Backend

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node server.js
   ```
   The backend will be running on the port specified in `backend/.env` (e.g., http://localhost:5001).

### Running the Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The frontend will be running on the host and port specified in `frontend/.env` (e.g., http://localhost:3000).

## Utility Scripts

The project includes scripts for database maintenance and data seeding, located in the `backend/scripts` directory.

### User Migration and Admin Seeding

The `updateUserSchema.js` script performs two main functions:

1.  **User Schema Migration**: It updates existing user documents in the database to conform to the latest schema, adding new fields like `role` with default values.
2.  **Admin User Seeding**: It ensures that a default administrator account exists. If not found, it creates one with the following credentials:
    - **Email**: `admin@example.com`
    - **Password**: `admin`

**When to Run This Script:**

- After a fresh database setup to create the default admin user.
- After pulling schema changes related to the User model to update existing records.

**Usage:**

Ensure your `backend/.env` file is correctly configured with your database connection string. Then, navigate to the backend directory and run the script:

```sh
cd backend
npm run migrate
```

### Database Management

These scripts allow you to manage the database content, such as backing up all data to a single file or restoring the database from that file. This is useful for creating a consistent development environment or for backup purposes.

- **`npm run db:export`**: Connects to the database and exports all collections into a single `backend/scripts/db_export.json` file. This file contains a complete snapshot of the database.

- **`npm run db:import`**: Imports data from `backend/scripts/db_export.json`. **Warning**: This is a destructive operation. It will completely wipe all existing data from the database before importing the data from the file.

- **`npm run db:destroy`**: Wipes all data from the relevant collections in the database. **Warning**: This is a destructive operation and will result in an empty database.

**Usage:**

```sh
# Navigate to the backend directory
cd backend

# To export the current database state to db_export.json
npm run db:export

# To wipe the database and restore it from db_export.json
npm run db:import

# To completely clear the database
npm run db:destroy
```

---

## Docker & CI/CD

This project is equipped with Docker for containerization and GitHub Actions for Continuous Integration (CI) and Continuous Deployment (CD).

### Local Development with Docker

You can run the entire application stack (frontend, backend, database) locally using Docker Compose. This is the recommended way to run the project for development as it ensures a consistent environment.

1.  **Create an environment file:** In the project root, create a file named `.env`. This file will provide the necessary secrets to the Docker containers.
    ```plaintext
    # .env (at project root)

    # A secret key for signing JWTs
    JWT_SECRET=your_super_secret_jwt_key_for_local_dev

    # The public URL of the frontend, for CORS
    CORS_ORIGIN=http://localhost

    # The public URL of the backend, for the frontend to connect to
    VITE_API_BASE_URL=http://localhost:5000
    ```

2.  **Run Docker Compose:** From the project root, run the following command:
    ```sh
    docker compose up --build
    ```
    This will build the images and start all services. The frontend will be available at `http://localhost` and the backend at `http://localhost:5000`.

### Continuous Integration (CI)

The CI pipeline is defined in `.github/workflows/ci.yml`. It automatically triggers on every push or pull request to the `main` branch. It performs the following checks on the `frontend` application:
- Installs dependencies (`npm ci`)
- Runs the linter (`npm run lint`)
- Runs the build process (`npm run build`)

### Continuous Deployment (CD)

The CD pipeline is defined in `.github/workflows/cd.yml`. It automatically triggers on every push to the `main` branch, after the CI pipeline has successfully completed.

The process is as follows:
1.  Builds Docker images for the frontend and backend.
2.  Pushes the images to GitHub Container Registry (ghcr.io).
3.  Connects to a target EC2 server via SSH and deploys the application using `docker compose`.

#### CD Setup: EC2 Server

Your target EC2 server must be prepared with the following:
1.  **Docker Installed**: Follow the official guide to install Docker Engine.
2.  **User Permissions**: The SSH user (e.g., `ubuntu`) must be added to the `docker` group to run Docker commands without `sudo`.
    ```sh
    sudo usermod -aG docker $USER
    ```
    You will need to log out and log back in for this change to take effect.

#### CD Setup: GitHub Secrets

The CD workflow requires the following secrets to be set in your GitHub repository under `Settings > Secrets and variables > Actions`:

| Secret Name           | Description                                                                                             | Example Value                      |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `EC2_HOST`            | The public IP address or DNS name of your EC2 instance.                                                 | `3.14.15.92`                       |
| `EC2_USERNAME`        | The username for logging into the EC2 instance.                                                         | `ubuntu` or `ec2-user`             |
| `EC2_SSH_PRIVATE_KEY` | The private SSH key (the full content of the `.pem` file) to access the EC2 instance.                     | `-----BEGIN OPENSSH PRIVATE KEY...` |
| `JWT_SECRET`          | A long, random string used by the backend to sign JSON Web Tokens.                                      | `a_very_long_and_secure_random_string` |
| `CORS_ORIGIN`         | The public URL where the frontend will be hosted, for the backend's CORS policy.                        | `http://your_ec2_ip_address`       |
| `VITE_API_BASE_URL`   | The public URL of the backend API, for the frontend to connect to.                                      | `http://your_ec2_ip_address:5000`  |

---

## API Documentation

For detailed information about the backend API, please see the [Backend API Documentation](./docs/backend_api.md).