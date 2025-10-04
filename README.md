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
