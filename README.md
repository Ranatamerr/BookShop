# 📚 BookShop API

A full-featured RESTful API for managing a bookshop with multi-language support (English & Arabic). Built with Hono.js, PostgreSQL, and Redis.

## ✨ Features

- 🔐 **Authentication System** - JWT-based with Redis token storage
- 📖 **Books Management** - Full CRUD operations for books
- 🔍 **Advanced Search** - Search by title with case-insensitive matching
- 🏷️ **Filtering** - Filter by category and price range
- 📊 **Sorting** - Sort books by title (A-Z / Z-A)
- 🌍 **Multi-Language Support** - English and Arabic with automatic detection
- 👤 **User Management** - User registration and authentication
- 🏢 **Categories & Authors** - Auto-creation when adding books
- 🏷️ **Tags System** - Many-to-many relationship with books
- 📄 **Pagination** - Efficient data retrieval with pagination

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Hono.js v4.11.7
- **Database:** PostgreSQL with Drizzle ORM
- **Cache:** Redis
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Internationalization:** i18next
- **Testing:** Vitest with Supertest
- **Dev Tools:** ts-node-dev, ESLint, Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ranatamerr/BookShop.git
cd BookShop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookshop
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### 4. Database Setup

#### Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE bookshop;
\q
```

#### Run Migrations (if needed)

```bash
npm run migrate
```

#### Seed the Database

Populate the database with sample data (users, categories, authors, books with Arabic translations):

```bash
npm run seed
```

**Test User Credentials:**
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`
- Email: `booklover@example.com` / Password: `password123`

### 5. Start Redis

Make sure Redis is running:

```bash
# Windows (if installed as service)
redis-server

# Linux/Mac
redis-server
```

### 6. Run the Application

#### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:3000`

#### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints
> 🔐 **Authentication Note:**  
> All protected endpoints require a valid JWT token sent via  
> `Authorization: Bearer <token>`


#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Books Endpoints

#### List All Books (Public)
```http
GET /books?page=1&limit=10&search=harry&category=Fiction&minPrice=10&maxPrice=50&sortBy=title_asc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by title (case-insensitive)
- `category` - Filter by category name (case-insensitive)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort by title: `title_asc` or `title_desc` (default: title_asc)
- `lang` - Language: `en` or `ar` (default: en)

#### Get Book by ID
```http
GET /books/:id?lang=ar
```

#### Get My Books (Authenticated)
```http
GET /books/my?page=1&limit=10&search=book&category=Fiction&sortBy=title_desc
Authorization: Bearer <token>
```

#### Create Book (Authenticated)

**English:**
```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to AI",
  "description": "A comprehensive guide to AI",
  "price": "39.99",
  "thumbnail": "https://example.com/ai-book.jpg",
  "authorName": "Sarah Johnson",
  "categoryName": "Technology"
}
```

**Arabic:**
```http
POST /books?lang=ar
Authorization: Bearer <token>
Content-Type: application/json

{
  "titleAr": "مقدمة في الذكاء الاصطناعي",
  "descriptionAr": "دليل شامل للذكاء الاصطناعي",
  "price": "39.99",
  "thumbnail": "https://example.com/ai-book.jpg",
  "authorNameAr": "سارة جونسون",
  "categoryNameAr": "تكنولوجيا"
}
```

#### Update Book (Authenticated)
```http
PUT /books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": "29.99"
}
```

#### Delete Book (Authenticated)
```http
DELETE /books/:id
Authorization: Bearer <token>
```

## 🌍 Multi-Language Support

### Language Detection Priority

1. **Query Parameter:** `?lang=ar`
2. **Accept-Language Header:** `Accept-Language: ar`
3. **Default:** English (`en`)
> Query parameter takes precedence over the `Accept-Language` header.


### Usage Examples

#### Using Query Parameter
```http
GET /books?lang=ar
GET /books/1?lang=ar
GET /books/my?lang=ar
```

#### Using Header
```http
GET /books
Accept-Language: ar
```

### Response Structure

When requesting Arabic (`?lang=ar`), all content returns in Arabic:

```json
{
  "success": true,
  "message": "تم استرجاع الكتب بنجاح",
  "data": {
    "id": 1,
    "title": "هاري بوتر وحجر الفيلسوف",
    "description": "رواية فانتازيا عن صبي ساحر...",
    "author": {
      "name": "ج.ك. رولينج"
    },
    "category": {
      "name": "خيال"
    }
  }
}
```

When requesting English (default), all content returns in English:

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "id": 1,
    "title": "Harry Potter and the Philosopher's Stone",
    "description": "A fantasy novel about a young wizard...",
    "author": {
      "name": "J.K. Rowling"
    },
    "category": {
      "name": "Fantasy"
    }
  }
}
```

## 📋 HTTP Status Codes & Error Responses

### Success Responses

| Status Code | Description |
|------------|-------------|
| `200 OK` | Request succeeded (GET, PUT, DELETE) |
| `201 Created` | Resource created successfully (POST) |

### Client Error Responses

| Status Code | Description |
|------------|-------------|
| `400 Bad Request` | Invalid request body or validation errors |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | User doesn't have permission to perform action |
| `404 Not Found` | Requested resource doesn't exist |

### Server Error Responses

| Status Code | Description |
|------------|-------------|
| `500 Internal Server Error` | Unexpected server error |

### Common Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Error Examples

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

#### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden - Unauthorized Action
```json
{
  "success": false,
  "message": "You are not authorized to delete this book"
}
```

#### 404 Not Found - Resource Not Found
```json
{
  "success": false,
  "message": "Book not found"
}
```

#### 404 Not Found - No Search Results
```json
{
  "success": false,
  "message": "No books found matching your search: 'xyz'"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create book"
}
```

### Endpoint-Specific Status Codes

#### Authentication Endpoints

**POST /auth/register**
- `201` - User registered successfully
- `400` - Validation error (invalid email format, weak password, etc.)
- `409` - User already exists
- `500` - Registration failed

**POST /auth/login**
- `200` - Login successful (returns token)
- `400` - Validation error
- `401` - Invalid credentials
- `500` - Login failed

**POST /auth/logout**
- `200` - Logout successful
- `401` - Unauthorized (missing/invalid token)
- `500` - Logout failed

#### Books Endpoints

**GET /books** (Public)
- `200` - Books retrieved successfully
- `404` - No books found matching filters
- `500` - Failed to retrieve books

**GET /books/:id** (Public)
- `200` - Book retrieved successfully
- `404` - Book not found
- `500` - Failed to retrieve book

**GET /books/my** (Authenticated)
- `200` - User's books retrieved successfully
- `401` - Unauthorized (missing/invalid token)
- `404` - No books found
- `500` - Failed to retrieve books

**POST /books** (Authenticated)
- `201` - Book created successfully
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `500` - Failed to create book

**PUT /books/:id** (Authenticated)
- `200` - Book updated successfully
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - User doesn't own this book
- `404` - Book not found
- `500` - Failed to update book

**DELETE /books/:id** (Authenticated)
- `200` - Book deleted successfully
- `401` - Unauthorized (missing/invalid token)
- `403` - User doesn't own this book
- `404` - Book not found
- `500` - Failed to delete book

## 🧪 Manual Testing with Postman

### Using Postman

1. Import the API endpoints into Postman
2. Register a new user or use test credentials
3. Login to get JWT token
4. Add token to Authorization header: `Bearer <token>`
5. Test all endpoints with different languages

### Sample Test Flow

1. **Register:** POST `/auth/register`
2. **Login:** POST `/auth/login` (save the token)
3. **List Books:** GET `/books?lang=ar`
4. **Create Book:** POST `/books` (with token)
5. **Get My Books:** GET `/books/my` (with token)
6. **Update Book:** PUT `/books/:id` (with token)
7. **Delete Book:** DELETE `/books/:id` (with token)

## 📁 Project Structure

```
BookShop/
├── src/
│   ├── config/
│   │   ├── db.ts              # Database configuration
│   │   └── i18n.ts            # i18next configuration
│   ├── db/
│   │   └── schema/            # Database schemas
│   │       ├── authors.schema.ts
│   │       ├── books.schema.ts
│   │       ├── categories.schema.ts
│   │       ├── users.schema.ts
│   │       ├── tags.schema.ts
│   │       ├── book-tags.schema.ts
│   │       ├── relations.ts
│   │       └── index.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   └── language.middleware.ts  # Language detection
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.test.ts   # Auth API tests
│   │   └── books/             # Books module
│   │       ├── books.controller.ts
│   │       ├── books.routes.ts
│   │       ├── books.schema.ts
│   │       ├── books.service.ts
│   │       └── books.test.ts  # Books API tests
│   ├── locales/               # Translation files
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── ar/
│   │       └── translation.json
│   ├── scripts/
│   │   ├── migrate.ts         # Database migration
│   │   └── seed.ts            # Database seeding
│   ├── utils/
│   ├── app.ts                 # Hono app setup
│   └── server.ts              # Server entry point
├── .env                       # Environment variables
├── vitest.config.ts           # Vitest configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Build
npm run build        # Build TypeScript to JavaScript

# Production
npm start            # Start production server

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## 🧪 Automated Testing

The project uses **Vitest** for testing with **Supertest** for HTTP API testing.

### Test Structure

```
src/
├── modules/
│   ├── auth/
│   │   └── auth.test.ts       # Authentication tests
│   └── books/
│       └── books.test.ts      # Books API tests
```

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

Tests cover:
- ✅ User registration and validation
- ✅ User login and authentication
- ✅ Token-based authorization
- ✅ Book CRUD operations
- ✅ Search and filtering
- ✅ Multi-language support
- ✅ Error handling and validation

### Example Test

```typescript
describe('GET /books', () => {
  it('should list all books successfully', async () => {
    const response = await request(app.fetch)
      .get('/books')
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('should return books in Arabic', async () => {
    const response = await request(app.fetch)
      .get('/books?lang=ar')
      .expect(200)

    expect(response.body.message).toMatch(/[\u0600-\u06FF]/)
  })
})
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Token blacklisting with Redis
- Input validation with Zod
- SQL injection prevention with Drizzle ORM

## 🧠 Design Decisions

- **Feature-based folder structure with MVC pattern** - Each module (auth, books) follows the Model-View-Controller design pattern with controllers, services, routes, and schemas organized by feature for better scalability and maintainability
- Public book browsing APIs to allow users to explore books without authentication
- Authentication required only for user-specific and write operations
- Redis used for token invalidation and logout handling
- Multi-language support implemented using `Accept-Language` header with query parameter override


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Rana Tamer**
- GitHub: [@Ranatamerr](https://github.com/Ranatamerr)

## 🙏 Acknowledgments

- Hono.js for the amazing web framework
- Drizzle ORM for type-safe database operations
- i18next for internationalization support

---

**Happy Coding! 🚀**

