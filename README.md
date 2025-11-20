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

## API Documentation

For detailed information about the backend API, please see the [Backend API Documentation](./docs/backend_api.md).