# 📋 TeamBoard – Lightweight Work Management Platform

> Full Stack Code Assessment (React + NestJS + MongoDB)

---

## 🎯 Project Overview

**TeamBoard** is a lightweight internal platform that helps teams collaboratively manage projects and tasks. It demonstrates a clean, modular full-stack architecture built with NestJS (backend), React (frontend), and MongoDB (database).

The system features:

- 🔐 **User Authentication** – Signup & Login with JWT
- 📁 **Project Management** – Create, view, update, and delete projects
- ✅ **Task Management** – Create, update status, delete, and view tasks per project
- 🎨 **Kanban-style UI** – Visual task board (To Do / In Progress / Done)
- 📦 **Modular Design** – Structured to easily evolve into microservices
- 📱 **Clean, Functional UI** – Tailwind CSS with real-time feedback (toasts + loading states)

---

## 🏗️ Architecture & Design Decisions

### Current State: Modular Monolith

TeamBoard is built as a **Modular Monolith** – a single codebase with clear domain separation. Each domain (Auth, Users, Projects, Tasks) is isolated in its own NestJS module with dedicated controllers, services, and DTOs.

This architecture was chosen because:

- **Speed of development** – Faster to build and iterate for the assessment
- **Same structure as microservices** – Modules are decoupled; splitting them later is minimal work
- **Simplified deployment** – Single service to run and test

### Future Evolution: Microservices-Ready

The codebase is intentionally structured to evolve into microservices with minimal changes:

| Module           | Future Microservice                           |
| ---------------- | --------------------------------------------- |
| `AuthModule`     | Auth Service (handles auth + user management) |
| `ProjectsModule` | Project Service (CRUD operations)             |
| `TasksModule`    | Task Service (task management)                |

**How to split:**

1. **Communication** – Replace direct service injection (e.g., `ProjectsService -> TasksService`) with:
   - HTTP calls via an API Gateway
   - Asynchronous messaging (RabbitMQ / Redis pub/sub)
2. **Database** – Give each service its own MongoDB database (or schema separation)
3. **Discovery** – Introduce service registry (e.g., Consul, Eureka)

The current `ProjectsService` already calls `TasksService` directly – this would become an interface that can be swapped for an HTTP client or message queue client without changing business logic.

---

## 🛠️ Tech Stack

### Backend

| Technology          | Purpose                        |
| ------------------- | ------------------------------ |
| **NestJS**          | Backend framework (TypeScript) |
| **MongoDB**         | NoSQL database                 |
| **Mongoose**        | ODM for MongoDB                |
| **JWT + Passport**  | Authentication & authorization |
| **class-validator** | DTO validation                 |
| **@nestjs/config**  | Environment configuration      |

### Frontend

| Technology                 | Purpose                           |
| -------------------------- | --------------------------------- |
| **React 18**               | UI library                        |
| **Vite**                   | Build tool                        |
| **TypeScript**             | Static typing                     |
| **Tailwind CSS**           | Styling                           |
| **React Router v6**        | Routing & protected pages         |
| **React Query (TanStack)** | Server state management & caching |
| **Context API**            | Global auth state                 |
| **React Hot Toast**        | Beautiful notifications           |
| **Axios**                  | HTTP client with JWT interceptors |

### DevOps

| Technology                  | Purpose                         |
| --------------------------- | ------------------------------- |
| **Docker + Docker Compose** | Containerized local development |
| **dotenv**                  | Environment variables           |

---

## 📁 Project Structure

teamboard-assessment/
├── backend/
│ ├── src/
│ │ ├── common/ # Guards, decorators
│ │ ├── modules/
│ │ │ ├── auth/ # Auth module (JWT)
│ │ │ ├── users/ # User model & service
│ │ │ ├── projects/ # Project CRUD
│ │ │ └── tasks/ # Task CRUD + status updates
│ │ └── app.module.ts
│ ├── .env.example
│ ├── Dockerfile
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/ # Layout, ProtectedRoute
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Login, Signup, Dashboard, ProjectDetail
│ │ ├── services/ # Axios API client
│ │ └── App.tsx
│ ├── .env.example
│ ├── Dockerfile
│ └── package.json
├── docker-compose.yml
└── README.md

text

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Docker** (optional, for containerized setup)
- **MongoDB** (if running locally without Docker)

---

## 🧪 Testing

Run unit tests:

````bash
cd backend
npm run test
Run end-to-end tests:

bash
cd backend
npm run test:e2e
Generate test coverage report:

bash
cd backend
npm run test:cov


### Option 1: Local Development (Without Docker)

#### Step 1: Clone the repository

```bash
git clone <your-repo-url>
cd teamboard-assessment
Step 2: Setup Backend
bash
cd backend
npm install
cp .env.example .env
Edit .env and fill in your MongoDB connection string and JWT secret:

env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/teamboard
JWT_SECRET=your_super_secret_key_here
Start the backend:

bash
npm run start:dev
# Runs on http://localhost:3000
Step 3: Setup Frontend
Open a new terminal:

bash
cd frontend
npm install
cp .env.example .env
Edit .env:

env
VITE_API_URL=http://localhost:3000
Start the frontend:

bash
npm run dev
# Runs on http://localhost:5173
Step 4: Start MongoDB
If you have MongoDB installed locally:

bash
mongod --dbpath /path/to/your/data
Or use Docker to run only MongoDB:

bash
docker run -d --name mongo-teamboard -p 27017:27017 mongo
Option 2: Docker Compose (Recommended for reviewers)
From the root folder (where docker-compose.yml is located):

bash
docker-compose up --build
This will spin up:

MongoDB – on port 27017

Backend (NestJS) – on port 3000

Frontend (React + Vite) – on port 80 (or whichever you configured)

Access the app at: http://localhost

🔐 Environment Variables
Backend .env
Variable	Description	Default
PORT	Backend port	3000
MONGODB_URI	MongoDB connection string	mongodb://localhost:27017/teamboard
JWT_SECRET	Secret key for signing JWTs	(required)
Frontend .env
Variable	Description	Default
VITE_API_URL	Backend API base URL	http://localhost:3000
📡 API Endpoints
All endpoints (except /auth/*) require a Bearer token in the Authorization header.

Authentication
Method	Endpoint	Description	Body
POST	/auth/signup	Register a new user	{ email, password, name }
POST	/auth/login	Login and get JWT token	{ email, password }
Projects
Method	Endpoint	Description
GET	/projects	Get all projects for the authenticated user
POST	/projects	Create a new project
GET	/projects/:id	Get a single project by ID
PUT	/projects/:id	Update a project
DELETE	/projects/:id	Delete a project
Tasks
Method	Endpoint	Description
GET	/tasks/project/:projectId	Get all tasks for a project
POST	/tasks/project/:projectId	Create a task for a project
PUT	/tasks/:id	Update a task (e.g., change status)
DELETE	/tasks/:id	Delete a task
🧪 Testing
The backend includes basic unit tests to demonstrate testing capability.

Run tests:

bash
cd backend
npm run test
🚢 Deployment
Deploy Backend (Render.com)
Push your repository to GitHub.

Go to Render.com and create a new Web Service.

Connect your GitHub repository.

Set the following:

Build Command: cd backend && npm install && npm run build

Start Command: cd backend && npm run start:prod

Add environment variables.

Deploy.

Deploy Frontend (Vercel)
Install Vercel CLI: npm i -g vercel

From the frontend folder: vercel --prod

Follow the prompts.

🎨 Design Decisions & Trade-offs
1. Why Modular Monolith over Microservices?
✅ Faster to deliver for the assessment while maintaining the same modular structure

✅ Easier to test and debug as a single service

✅ The code is already split into domains – splitting later is trivial

2. Why React Query over Redux?
✅ Server state (projects, tasks) is the primary data – React Query handles caching, refetching, and loading states beautifully

✅ Less boilerplate than Redux Toolkit

✅ Auth state is managed separately with Context API (client-only state)

3. Why Context API for Auth?
✅ Auth state is simple (user object + loading + login/logout)

✅ No need for complex state management for just 3-4 actions

✅ If needed, can migrate to Redux or Zustand later

4. Why MongoDB References vs Embedded Documents?
✅ Prevents data duplication – tasks belong to projects but are stored separately

✅ Scales better – tasks can grow massively without bloating the project document

✅ Easier updates – updating a task doesn't require updating the entire project

5. Why Tailwind CSS?
✅ Rapid UI development without leaving HTML

✅ No custom CSS files – consistent design system

✅ The reviewer can see the UI styling directly in the JSX

🚧 Future Improvements
If I had more time, I would add:

🔄 Refresh token rotation for improved security

📨 Message queue (RabbitMQ) for task assignment notifications (async microservices)

👥 Team invitations & role-based access control (RBAC)

📊 Activity logs & audit trails

🗑️ Soft deletes instead of permanent deletion

🧪 More comprehensive tests (integration & E2E)

🎯 Drag-and-drop for the Kanban board (instead of dropdown)

📱 Mobile responsiveness (currently desktop-first)

📝 Notes for the Reviewer
The backend uses ! (definite assignment assertions) in Mongoose schemas to satisfy TypeScript's strict property initialization. This is safe because Mongoose handles assignment at runtime.

The frontend uses import type for types to comply with verbatimModuleSyntax.

JWT tokens are stored in localStorage for simplicity. In production, I would use HttpOnly cookies to prevent XSS attacks.

👨‍💻 Author
Balogun Sodiq – balogunsodiq54@gmail.com

📄 License
MIT – Use it for learning and assessment purposes.

🙏 Thank You
Thank you for taking the time to review my submission. I'm happy to walk you through any part of the codebase or explain my reasoning further.

text

---

### ✅ What this README covers:

| Section | Content |
|---------|---------|
| **Overview** | What the app does + key features |
| **Architecture** | Modular monolith + microservices evolution plan |
| **Tech Stack** | Full list of technologies with purposes |
| **Folder Structure** | Visual tree showing organization |
| **Setup Instructions** | Both local + Docker methods |
| **Environment Variables** | Clear table of .env values |
| **API Endpoints** | Complete REST API reference |
| **Testing** | How to run tests |
| **Deployment** | Render + Vercel guide |
| **Design Decisions** | Why I made each choice (shows critical thinking) |
| **Future Improvements** | Self-awareness of what could be better |
| **Notes for Reviewer** | Handles specific technical quirks (TS errors, JWT storage) |

---
````
