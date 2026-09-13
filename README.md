# Real-World Assistance & Verification Network (VeriTask) — Phase 1 MVP

A full-stack MERN web application connecting requesters who need something done or verified in a physical real-world location with trusted local taskers willing to complete those tasks for a reward.

> **Core Concept:** *"I cannot physically be somewhere or do something myself, so I can request help from a trusted person who can do it for me."*

---

## 1. Project Overview

### The Problem
People frequently encounter situations where they need physical verification or local assistance in another city or locality, but cannot be physically present themselves. Examples include:
- Verifying if a particular store has a specific laptop or medical product in stock.
- Checking whether a business or banquet hall is open for booking.
- Taking date-stamped photographs of a public venue or park.
- Collecting public timetables from bus stations or notice board announcements.

### The Solution
VeriTask provides a structured task network where users can post verification tasks with clear rewards, deadlines, location details, and proof requirements. Local taskers can accept open tasks, submit uploaded proof, receive approval from requesters, and mutually rate each other upon completion.

---

## 2. Features Implemented (Phase 1)

- **Authentication & User Management:**
  - JWT-based authentication with bcrypt password hashing.
  - Single-account dual-role model (any user can act as both Requester and Tasker).
  - Profile management displaying ratings received and activity stats.
  - Role-based authorization (`user` and `admin`).
- **Complete Controlled Task Lifecycle:**
  - `OPEN` $\rightarrow$ `ACCEPTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `SUBMITTED` $\rightarrow$ `COMPLETED`
  - Additional states: `CANCELLED`, `EXPIRED`, and `DISPUTED`.
  - Atomic acceptance handling on backend to prevent double-acceptance race conditions.
  - State transition timestamps (`acceptedAt`, `startedAt`, `completedAt`, `cancelledAt`).
- **Structured Location & Categories:**
  - Predefined safety categories (`verification`, `photo_collection`, `information_collection`, `pickup`, `local_assistance`, `inspection`, `other`).
  - Structured location form (Country, State, City, Locality, Additional Details).
  - Search & multi-filter by Category, Location (State/City), Reward Range, and Status.
- **Proof & Submissions:**
  - Task completion proof uploads supported via Node/Multer (images, documents, videos).
  - Requester review with **Approve** or **Dispute** actions.
- **Mutual Rating System:**
  - 1–5 star rating + text feedback after completion.
  - Unique compound index ensuring one review per user per task.
- **Safety, Moderation & Reporting:**
  - Prohibited task safety notice against illegal, dangerous, stalking, or privacy-violating activities.
  - Task safety violation reporting modal for community reporting.
  - Admin management portal for platform stats, user activation toggling, dispute review, and report handling.

---

## 3. Technology Stack

- **Frontend:** React (Vite), JavaScript, React Router DOM, Axios, Lucide React Icons, Vanilla CSS Design System.
- **Backend:** Node.js, Express.js, REST API.
- **Database:** MongoDB, Mongoose ODM.
- **Security & Uploads:** JWT, bcryptjs, Multer file upload middleware, CORS.

---

## 4. Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/social-helper
JWT_SECRET=real_world_assistance_super_secret_jwt_key_2026
JWT_EXPIRE=30d
NODE_ENV=development
```

Run database seed script to generate sample test users & tasks:
```bash
npm run seed
```

Start backend API server:
```bash
npm start
# or development watch mode:
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 5. Development Test Credentials

The database seed script initializes ready-to-use accounts for testing the complete end-to-end flow:

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Admin** | `admin@example.com` | `password123` | Admin Portal access, user management, dispute/report review |
| **User A (Requester)** | `dinesh@example.com` | `password123` | Posts store verification tasks in Vijayawada |
| **User B (Tasker)** | `priya@example.com` | `password123` | Accepts and fulfills tasks in Vijayawada |
| **User C (Dual)** | `ramesh@example.com` | `password123` | Active tasker & requester in Hyderabad |
| **User D (Tasker)** | `sunita@example.com` | `password123` | Tasker operating in Visakhapatnam |

---

## 6. Main REST API Endpoints

### Auth Endpoints (`/api/auth`)
- `POST /register` — Register new user
- `POST /login` — Login user & return JWT
- `GET /me` — Get current profile
- `PUT /profile` — Update name & bio

### Task Endpoints (`/api/tasks`)
- `GET /` — Browse tasks (supports `q`, `category`, `state`, `city`, `status`, `minReward`, `maxReward`)
- `POST /` — Create task
- `GET /my-posted` — Get tasks created by user
- `GET /my-accepted` — Get tasks accepted by user
- `GET /:id` — Get task detail
- `POST /:id/accept` — Accept task (`OPEN` $\rightarrow$ `ACCEPTED`)
- `POST /:id/start` — Start task (`ACCEPTED` $\rightarrow$ `IN_PROGRESS`)
- `POST /:id/submit` — Submit proof & description (`IN_PROGRESS` $\rightarrow$ `SUBMITTED`)
- `POST /:id/approve` — Approve submission (`SUBMITTED` $\rightarrow$ `COMPLETED`)
- `POST /:id/dispute` — Dispute submission (`SUBMITTED` $\rightarrow$ `DISPUTED`)
- `POST /:id/cancel` — Cancel task (`OPEN`/`ACCEPTED` $\rightarrow$ `CANCELLED`)
- `POST /:id/report` — Report safety violation

### Rating Endpoints (`/api/ratings`)
- `POST /` — Submit rating for completed task
- `GET /user/:userId` — Fetch user ratings & average score

### Admin Endpoints (`/api/admin`)
- `GET /stats` — Overall system analytics
- `GET /users` — List users
- `PUT /users/:id/toggle-active` — Activate/deactivate user
- `GET /disputes` — List disputed tasks
- `GET /reports` — List safety reports

---

## 7. Future Roadmap (Post-Phase 1)

The following features are intentionally **excluded** from Phase 1 and will be introduced in subsequent phases:
- Interactive Maps & Live GPS location tracking
- Payment gateway integration & real-money escrow
- Real-time push notifications
- AI task classification & automated safety detection
- AI matching algorithms & vector embeddings
- Advanced automated reputation scoring
