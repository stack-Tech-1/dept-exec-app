# IESA Exec Portal

An executive management portal for the Department of Industrial & Production Engineering (IPE), University of Ibadan. Built for the IESA executive committee to manage tasks, goals, meetings, minutes, and reports from a single dashboard.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + Shadcn/ui (Radix UI)
- **Animations:** Framer Motion
- **Auth:** NextAuth + custom JWT credential provider
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios with request/response interceptors
- **Charts:** Chart.js + Recharts
- **Real-time:** Socket.io-client (notifications)
- **Testing:** Vitest + React Testing Library

---

## Prerequisites

- Node.js 18 or higher
- npm
- A running backend API (see [Backend Expectations](#backend-api-expectations))

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd IESA/dept-exec-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the `dept-exec-app/` directory:

```env
# URL of the backend REST API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth secret — generate one with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here

# Base URL of this Next.js app
NEXTAUTH_URL=http://localhost:3000
```

> **Important:** Never commit `.env.local` to version control. Generate a unique `NEXTAUTH_SECRET` for each environment.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app will redirect to `/login`.

### 5. Build for production

```bash
npm run build
npm start
```

---

## Running Tests

```bash
# Interactive watch mode
npm test

# Single run (CI)
npm run test:run
```

---

## Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| `ADMIN` | Executive leadership | Full access: create tasks, invite users, approve minutes, view all data |
| `EXEC` | Executive members | View and update assigned tasks, view meetings and goals |

---

## Positions

Members are assigned one of the following positions when invited:

- President
- Vice President
- General Secretary
- Assistant General Secretary
- Treasurer
- Financial Secretary
- Public Relations Officer
- Sports Director
- Assistant Sports Director
- Social Director
- Executive Member

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of stats, upcoming meetings, recent tasks, and goal progress |
| **Tasks** | Create, assign, filter, and update task status (ADMIN only can create) |
| **Goals** | Set and track departmental goals with progress indicators |
| **Meetings** | Schedule meetings and record attendance |
| **Minutes** | Write and manage meeting minutes; extract action items as tasks |
| **Reports** | Generate executive reports with charts |
| **Users** | View all members; invite new members (ADMIN only) |
| **Notifications** | Real-time notification bell with badge count |
| **Search** | Global search across tasks, goals, meetings, and users |

---

## How the Invite System Works

1. An **ADMIN** navigates to **Users** and clicks **Invite Member**
2. Fills in the member's email, role (`ADMIN` or `EXEC`), and position
3. The backend sends an invitation email with a unique token
4. The invited member visits `/register?token=<token>` and sets their name and password
5. Their account is created and they can log in

---

## Backend API Expectations

All API calls go to `NEXT_PUBLIC_API_URL`. The frontend expects:

### Authentication header
```
Authorization: Bearer <jwt-token>
```

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Login — returns `{ token, user }` |
| `POST` | `/auth/register` | Register with invite token |
| `POST` | `/auth/invite` | Send invite email (ADMIN) |
| `GET` | `/dashboard/stats` | Dashboard statistics |
| `GET` | `/tasks` | List tasks |
| `POST` | `/tasks` | Create task |
| `PATCH` | `/tasks/:id/status` | Update task status |
| `GET` | `/goals` | List goals |
| `POST` | `/goals` | Create goal |
| `GET` | `/meetings` | List meetings |
| `POST` | `/meetings` | Create meeting |
| `GET` | `/minutes` | List minutes |
| `POST` | `/minutes` | Create minutes |
| `GET` | `/reports` | Get reports |
| `GET` | `/users` | List users (ADMIN) |
| `GET` | `/notifications` | Get notifications |
| `GET` | `/search?q=<query>` | Global search |

### Expected user object

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "ADMIN" | "EXEC",
  "position": "President" | "Vice President" | "...",
  "department": "string (optional)",
  "lastLogin": "ISO date string (optional)"
}
```

### Error responses

The API should return errors in this format:

```json
{
  "message": "Human-readable error description"
}
```

A `401` response automatically clears the session and redirects to `/login`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with auth + error boundary
│   ├── login/              # Login page
│   ├── register/           # Invite-based registration
│   ├── profile/            # User profile
│   └── dashboard/          # Protected dashboard
│       ├── layout.tsx      # Dashboard layout (sidebar, header, auth check)
│       ├── page.tsx        # Dashboard home
│       ├── tasks/
│       ├── goals/
│       ├── meetings/
│       ├── minutes/
│       ├── reports/
│       └── users/
├── components/             # React components
│   ├── auth/               # Login form, user switcher
│   ├── dashboard/          # Stats, recent tasks, meetings, goal progress
│   ├── layout/             # Sidebar and header
│   ├── ui/                 # Shadcn/ui primitives
│   └── ErrorBoundary.tsx   # Error boundary with fallback UI
├── context/
│   └── AuthContext.tsx     # Auth state (user, token, login, logout)
├── services/               # API abstraction layer
│   ├── api.ts              # Axios instance with interceptors
│   ├── auth.ts             # Auth service
│   ├── tasks.ts            # Tasks service
│   └── ...                 # Other services
└── lib/
    ├── constants.ts        # Role constants
    ├── utils.ts            # Tailwind class merger (cn)
    └── role-utils.ts       # Role helper functions
```
