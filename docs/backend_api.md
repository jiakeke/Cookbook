# Backend API Documentation

This document provides a detailed overview of the backend API endpoints for the Cookbook application.

## Base URL

The base URL for all API endpoints is `/api`.

---

## Authentication

The API uses JSON Web Tokens (JWT) for authenticating users and protecting routes.

### How It Works

1.  **Registration/Login**: When a user successfully registers (`POST /auth/register`) or logs in (`POST /auth/login`), the server generates a JWT and returns it in the response body.

2.  **Token Storage**: The client-side application is responsible for storing this token securely (e.g., in `localStorage` or `sessionStorage`).

3.  **Authenticated Requests**: For any subsequent request to a protected endpoint, the client must include the JWT in the `Authorization` header with the `Bearer` scheme.

    **Example Header:**
    ```
    Authorization: Bearer <your_jwt_token>
    ```

4.  **Server Verification**: The server middleware intercepts incoming requests, validates the token from the header, and identifies the user. If the token is valid, the request proceeds; otherwise, a `401 Unauthorized` error is returned.

### Protected Routes

- Any route that requires a user to be logged in is protected.
- All routes under the `/admin` path have an additional layer of protection: the authenticated user must have the `admin` role.

### Endpoints

#### 1. Register User

- **Endpoint:** `POST /auth/register`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string (unique)",
    "password": "string (min 8 characters)"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "<jwt_token>"
  }
  ```

#### 2. Login User

- **Endpoint:** `POST /auth/login`
- **Description:** Authenticates a user.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "<jwt_token>"
  }
  ```

#### 3. Get Authenticated User

- **Endpoint:** `GET /auth/user`
- **Authentication:** Required.
- **Description:** Retrieves the profile of the currently logged-in user.
- **Response (200 OK):**
  ```json
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "user" | "admin"
  }
  ```

---

## Public Routes

### Recipes (`/recipes`)

- **Endpoint:** `GET /recipes`
  - **Description:** Retrieves a list of all recipes.
- **Endpoint:** `GET /recipes/:id`
  - **Description:** Retrieves a single recipe by its ID.

### Comments (`/comments`)

- **Endpoint:** `POST /comments/:recipeId`
  - **Description:** Adds a new comment to a recipe. Authentication is optional.

### Reports (`/reports`)

- **Endpoint:** `POST /reports/:commentId`
  - **Description:** Reports a comment. Authentication is required.

---

## Admin Routes (`/admin`)

All endpoints under this path require administrator privileges.

### General Notes

- **`GET` (List):** Supports `page`, `limit`, and `search` query parameters.
- **`GET /:id`**: Retrieves a single document by its ID.
- **`POST /`**: Creates a new document.
- **`PUT /:id`**: Updates a document by its ID.
- **`DELETE /:id`**: Deletes a document by its ID.

--- 

### Users (`/admin/users`)

- **`GET /admin/users`**: List all users.
- **`POST /admin/users`**: Create a new user.
- **`PUT /admin/users/:id`**: Update a user's details (name, email, role).
- **`DELETE /admin/users/:id`**: Delete a user.

--- 

### Methods (`/admin/methods`)

- **`GET /admin/methods`**: List all cooking methods.
- **`POST /admin/methods`**: Create a new method.
- **`PUT /admin/methods/:id`**: Update a method.
- **`DELETE /admin/methods/:id`**: Delete a method.

--- 

### Countries/Regions (`/admin/countries`)

- **`GET /admin/countries`**: List all countries/regions.
- **`POST /admin/countries`**: Create a new country/region.
- **`PUT /admin/countries/:id`**: Update a country/region.
- **`DELETE /admin/countries/:id`**: Delete a country/region.

--- 

### Stores (`/admin/stores`)

- **`GET /admin/stores`**: List all stores.
- **`POST /admin/stores`**: Create a new store.
- **`PUT /admin/stores/:id`**: Update a store.
- **`DELETE /admin/stores/:id`**: Delete a store.

--- 

### Allergens (`/admin/allergens`)

- **`GET /admin/allergens`**: List all allergens.
- **`POST /admin/allergens`**: Create a new allergen.
- **`PUT /admin/allergens/:id`**: Update an allergen.
- **`DELETE /admin/allergens/:id`**: Delete an allergen.

--- 

### Special Groups (`/admin/specialgroups`)

- **`GET /admin/specialgroups`**: List all special diet groups.
- **`POST /admin/specialgroups`**: Create a new special group.
- **`PUT /admin/specialgroups/:id`**: Update a special group.
- **`DELETE /admin/specialgroups/:id`**: Delete a special group.

--- 

### Ingredients (`/admin/ingredients`)

- **`GET /admin/ingredients`**: List all ingredients.
- **`POST /admin/ingredients`**: Create a new ingredient.
- **`PUT /admin/ingredients/:id`**: Update an ingredient.
- **`DELETE /admin/ingredients/:id`**: Delete an ingredient.

--- 

### Recipes (`/admin/recipes`)

- **`GET /admin/recipes`**: List all recipes.
- **`POST /admin/recipes`**: Create a new recipe.
- **`PUT /admin/recipes/:id`**: Update a recipe.
- **`DELETE /admin/recipes/:id`**: Delete a recipe.
- **`GET /admin/recipes/dependencies`**: Get a list of all dependencies (countries, ingredients, methods, etc.) needed for the recipe creation form.

--- 

### Reports (`/admin/reports`)

- **`GET /admin/reports`**: List all reports, sorted by status (`New` first) and creation date.
- **`PUT /admin/reports/:reportId`**: Update a report's status (`New`, `Accepted`, `Rejected`) and automatically update the associated comment's visibility.