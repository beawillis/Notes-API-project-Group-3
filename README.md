# 📝 Notes API - Group 3 A production-ready REST API for managing personal notes with authentication, search, filtering, sorting, and pagination built using Node.js, Express.js, and MongoDB. --- # 🚀 Live Deployment 🌐 Live API URL: ADD_YOUR_RENDER_URL_HERE Example: https://notes-api-group-3.onrender.com --- # 📂 GitHub Repository 🔗 GitHub Repository: https://github.com/beawillis/Notes-API-project-Group-3 --- # 📌 Project Overview This project is a backend system for a “Second Brain” or Notion-style note-taking application. It allows users to securely create, organize, update, search, and manage personal notes using a RESTful API architecture. The system includes: - User Authentication (JWT) - CRUD Operations - Pagination - Search Functionality - Sorting - Filtering - MongoDB Atlas Integration - Input Validation - Security Middleware - Error Handling - Render Deployment --- # 🛠 Tech Stack | Technology | Purpose | |---|---| | Node.js | JavaScript Runtime | | Express.js | Backend Framework | | MongoDB Atlas | Cloud Database | | Mongoose | ODM for MongoDB | | JWT | Authentication | | Joi | Validation | | bcryptjs | Password Hashing | | Helmet | Security Middleware | | Morgan | Logging | | CORS | Cross-Origin Requests | | Nodemon | Development Server | --- # 📁 Project Structure
txt
.
├── app.js
├── server.js
├── package.json
├── README.md
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── auth.controller.js
│   └── note.controller.js
│
├── routes/
│   ├── auth.routes.js
│   └── note.routes.js
│
├── models/
│   ├── user.model.js
│   └── note.model.js
│
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── logger.js
│
└── validators/
    ├── auth.validator.js
    └── note.validator.js
--- # ⚙️ Installation & Setup Instructions ## 1️⃣ Clone Repository
bash
git clone https://github.com/beawillis/Notes-API-project-Group-3.git
--- ## 2️⃣ Navigate into Project
bash
cd Notes-API-project-Group-3
--- ## 3️⃣ Install Dependencies
bash
npm install
--- ## 4️⃣ Create Environment Variables Create a .env file in the root directory.
env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
REDIS_URL=redis://your_redis_connection_string   # optional: cloud Redis URL; if omitted caching is disabled
--- ## 5️⃣ Run Development Server
bash
npm run dev
--- ## 6️⃣ Run Production Server
bash
npm start
--- # 🔐 Authentication Endpoints ## Register User
http
POST /api/auth/register
### Example Body
json
{
  "name": "Elisha",
  "email": "elisha@gmail.com",
  "password": "123456"
}
--- ## Login User
http
POST /api/auth/login
### Example Body
json
{
  "email": "elisha@gmail.com",
  "password": "123456"
}
--- # 📝 Notes API Endpoints --- ## Create Note
http
POST /api/notes
### Headers
http
Authorization: Bearer YOUR_TOKEN
### Example Body
json
{
  "title": "Backend Development",
  "content": "Learning Express and MongoDB",
  "category": "Education",
  "tags": ["Node.js", "MongoDB"]
}
--- ## Get All Notes
http
GET /api/notes
--- ## Get Single Note
http
GET /api/notes/:id
--- ## Update Note
http
PUT /api/notes/:id
--- ## Delete Note
http
DELETE /api/notes/:id
--- # 🔎 Advanced Query Features The API supports advanced querying for better note management. --- # 📄 Pagination Example Retrieve page 2 with 5 notes per page:
http
GET /api/notes?page=2&limit=5
--- # 🔍 Search Example Search notes containing “backend”:
http
GET /api/notes?q=backend
This searches within: - title - content --- # 🗂 Filter by Category
http
GET /api/notes?category=Education
--- # ⏱ Sorting Example Newest notes first:
http
GET /api/notes?sort=-createdAt
Oldest notes first:
http
GET /api/notes?sort=createdAt
--- # 🧪 Example Combined Query
http
GET /api/notes?page=1&limit=5&sort=-createdAt&q=node
This: - Searches notes containing “node” - Sorts newest first - Returns only 5 results - Starts from page 1 --- # 🛡 Security Features - Password hashing using bcryptjs - JWT Authentication - Helmet.js security headers - Joi validation - Protected routes - Centralized error handling --- # Additional Features - Role-based Access Control (RBAC): role field on User model with values User, Editor, Admin. Use the authorize middleware to protect routes. - Rate limiting: express-rate-limit is applied to authentication and notes endpoints to reduce abuse. - Ownership protection: controllers verify that only the note owner or an Admin can view/update/delete a note. # Analytics & Caching - Analytics endpoints use MongoDB aggregation pipelines to provide: - Most-used categories - Most-active users - Most-used tags - Category statistics (counts, etc.) - Redis caching: analytics responses are cached via Redis to improve performance; caches are invalidated on note create/update/delete. - Redis behavior: if REDIS_URL is not set or the connection fails the app "fails open" and disables caching to avoid noisy retry loops. ## Current status - Local .env appears to contain a REDIS_URL entry (cloud Redis). Do not commit .env or paste the URL publicly. - Recommended next steps: run the local Redis connectivity test and ensure the same REDIS_URL is configured in your Render environment variables before redeploying. --- ## Changes added on 2026-05-20 The items implemented or updated in the project today are listed below. File links point to their locations in the repository. - **RBAC:** added role on the User model and an authorize middleware to restrict routes — [models/user.model.js](models/user.model.js), [middlewares/authorize.js](middlewares/authorize.js) - **Rate limiting:** added rate-limit middleware and applied it to auth/notes/general routes — [middlewares/rateLimiter.js](middlewares/rateLimiter.js) - **Ownership protection:** controllers now enforce that only note owners or Admin users can read/update/delete notes — [controllers/note.controller.js](controllers/note.controller.js) - **Advanced filtering:** added query filters and search for notes (category, tags, startDate, endDate, pinned, q, sort, page, limit) — [controllers/note.controller.js](controllers/note.controller.js) - **Analytics (MongoDB aggregation):** implemented aggregation endpoints for most-used categories, most-active users, most-used tags, and category stats — [controllers/analytics.controller.js](controllers/analytics.controller.js), [routes/analytics.routes.js](routes/analytics.routes.js) - **Redis caching & helpers:** added config/redis.js with connectRedis, getCacheData, setCacheData, deleteCacheByPattern and fail-open behavior when Redis is not available — [config/redis.js](config/redis.js) - **Cache invalidation:** analytics caches are invalidated on note create/update/delete via deleteCacheByPattern('analytics:*') — [controllers/note.controller.js](controllers/note.controller.js) - **Server startup:** server.js updated to await DB and Redis connections before listening — [server.js](server.js) - **Environment template:** updated .env.example / documentation to include REDIS_URL for cloud deployment — [.env.example](.env.example) - **README updated:** project README now documents these additions and includes Redis test instructions — [README.md](README.md) If you'd like, I can also add a small /health endpoint that returns { mongo: boolean, redis: boolean } for quick post-deploy checks. I can implement that now. # 📸 Screenshots Section ## 📌 Search Feature Screenshot Add screenshot here. Example:
md
![Search Feature](./screenshots/search-feature.png)
--- ## 📌 Pagination Feature Screenshot
md
![Pagination Feature](./screenshots/pagination-feature.png)
--- # 📂 How to Add Screenshots ## Step 1 Create a folder called:
txt
screenshots
inside the root project folder. Example:
txt
Notes-API-project-Group-3/
│
├── screenshots/
│   ├── search-feature.png
│   └── pagination-feature.png
--- ## Step 2 Take screenshots of: - Postman search requests - Pagination requests - Render deployment - MongoDB collections --- ## Step 3 Paste images inside the screenshots/ folder. --- ## Step 4 Reference them inside README using:
md
![Image Name](./screenshots/image-name.png)
--- # 🌐 Deployment on Render The API is deployed using Render.com. ## Deployment Steps 1. Push project to GitHub 2. Open Render.com 3. Create New Web Service 4. Connect GitHub Repository 5. Add Environment Variables 6. Deploy --- # 📦 Environment Variables | Variable | Description | |---|---| | MONGO_URI | MongoDB Atlas Connection String | | PORT | Server Port | | JWT_SECRET | Secret Key for JWT | --- # 📊 HTTP Status Codes Used | Code | Meaning | |---|---| | 200 | Success | | 201 | Resource Created | | 400 | Bad Request | | 401 | Unauthorized | | 404 | Not Found | | 500 | Server Error | --- # 👨‍💻 Contributors ## Group 3 Members - Elisha Alvin Bifandhuba - Add Other Members --- # 📜 License ISC License --- # 🎯 Future Improvements - Frontend Integration - Swagger Documentation - File Uploads - AI-powered Notes - Real-time Collaboration - Role-based Access Control
