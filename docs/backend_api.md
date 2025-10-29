# Backend API Documentation

This document provides a detailed overview of the backend API endpoints and data models for the Cookbook application.

## Base URL

The base URL for all API endpoints is `/api`.

---

## Authentication & User Model

The API uses JSON Web Tokens (JWT) for authenticating users and protecting routes.

### User Data Model

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed in the database
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Timestamps for creation and updates are automatically added.
}
```

### How It Works

1.  **Registration/Login**: When a user successfully registers (`POST /auth/register`) or logs in (`POST /auth/login`), the server generates a JWT and returns it in the response body.
2.  **Token Storage**: The client-side application is responsible for storing this token securely (e.g., in `localStorage`).
3.  **Authenticated Requests**: For any subsequent request to a protected endpoint, the client must include the JWT in the `Authorization` header with the `Bearer` scheme.
    **Example Header:** `Authorization: Bearer <your_jwt_token>`
4.  **Server Verification**: The server middleware intercepts incoming requests, validates the token, and identifies the user. If the token is valid, the request proceeds; otherwise, a `401 Unauthorized` error is returned.

### Authentication Endpoints (`/auth`)

#### 1. Register User
- **Endpoint:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string (unique)",
    "password": "string (min 8 characters)"
  }
  ```
- **Response (201 Created):** Returns a JWT token.

#### 2. Login User
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200 OK):** Returns a JWT token.

#### 3. Get Authenticated User
- **Endpoint:** `GET /auth/user`
- **Authentication:** Required (JWT).
- **Response (200 OK):** Returns the user object (without password).

---

## Public API Routes

### Recipes (`/recipes`)

- **Endpoint:** `GET /recipes`
  - **Description:** Retrieves a list of all public recipes.
- **Endpoint:** `GET /recipes/:id`
  - **Description:** Retrieves a single recipe by its ID, with populated details.

### Comments (`/comments`)

- **Endpoint:** `POST /comments/:recipeId`
  - **Description:** Adds a new comment to a recipe. Authentication is optional.
  - **Request Body:** `multipart/form-data` including `content`, `rating` (optional), `nickname` (optional for guests), and `images` (optional).

### Reports (`/reports`)

- **Endpoint:** `POST /reports/:commentId`
  - **Description:** Reports a comment.
  - **Authentication:** Required (JWT).
  - **Request Body:** `{ "reason": "string" }`

---

## Admin API Routes (`/admin`)

All endpoints under this path require administrator privileges.

### Data Models

<details>
<summary>Click to view Data Models</summary>

#### Recipe Model
```javascript
{
  _id: ObjectId,
  name: { en: String, fi: String, zh: String },
  description: { en: String, fi: String, zh: String },
  image: String,
  country_or_region: { type: ObjectId, ref: 'CountryOrRegion' },
  creator: { type: ObjectId, ref: 'User' },
  calorie: Number,
  protein: Number,
  carbohydrate: Number,
  fat: Number,
  preparation: { en: String, fi: String, zh: String },
  cookingTime: Number, // in minutes
  servings: Number,
  remark: { en: String, fi: String, zh: String },
  ingredients: [ { /* ... */ } ],
}
```

#### Comment Model
```javascript
{
  _id: ObjectId,
  recipe: { type: ObjectId, ref: 'Recipe' },
  user: { type: ObjectId, ref: 'User' },
  nickname: String,
  rating: { type: Number, min: 1, max: 5 },
  content: String,
  images: [String],
  approved: { type: Boolean, default: true },
}
```

#### Ingredient Model
```javascript
{
  _id: ObjectId,
  name: { en: String, fi: String, zh: String },
  image: String,
  link: [ { /* ... */ } ],
  allergens: [{ type: ObjectId, ref: 'Allergen' }],
  specials: [{ type: ObjectId, ref: 'SpecialGroup' }],
}
```

#### Report Model
```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User' },
  comment: { type: ObjectId, ref: 'Comment' },
  reason: String,
  status: { type: String, enum: ['New', 'Accepted', 'Rejected'], default: 'New' },
}
```

#### Supporting Models
- **Method**: `{ name: { en, fi, zh } }`
- **CountryOrRegion**: `{ name: { en, fi, zh }, description: { en, fi, zh } }`
- **Store**: `{ name: { en, fi, zh }, logo: String }`
- **Allergen**: `{ name: { en, fi, zh }, description: { en, fi, zh } }`
- **SpecialGroup**: `{ name: { en, fi, zh }, description: { en, fi, zh } }`

</details>

### Users (`/admin/users`)
- **`GET /`**: List all users with pagination and search.
- **`POST /`**: Create a new user.
- **`PUT /:id`**: Update a user's details.
- **`DELETE /:id`**: Delete a user.

### Recipes (`/admin/recipes`)
- **`GET /`**: List all recipes.
- **`POST /`**: Create a new recipe.
- **`PUT /:id`**: Update a recipe.
- **`DELETE /:id`**: Delete a recipe.
- **`GET /dependencies`**: Get data needed for recipe forms.

### Ingredients (`/admin/ingredients`)
- **`GET /`**: List all ingredients.
- **`POST /`**: Create a new ingredient.
- **`PUT /:id`**: Update an ingredient.
- **`DELETE /:id`**: Delete an ingredient.

### Reports (`/admin/reports`)
- **`GET /`**: List all reports, sorted by status and date.
- **`PUT /:reportId`**: Update a report's status.

### Other Resources
Full CRUD support is also available for:
- `/admin/methods`
- `/admin/countries`
- `/admin/stores`
- `/admin/allergens`
- `/admin/specialgroups`