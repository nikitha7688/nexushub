# NexusHub — Project Tracker

> Single source of truth for build status. Tick items as they're completed.
> Build order: **Frontend UI → Complete Frontend Pages → API Integration → Backend → Testing → Deployment**

---

## Phase 1 — Frontend

### 1. Project Bootstrap

- [x] Initialize Next.js (App Router) + TypeScript
- [x] Install & configure Tailwind CSS
- [ ] Set up project folder structure (`app/`, `components/`, `lib/`, `styles/`, `hooks/`, `types/`) — only `app/`, `components/`, `lib/` exist; `styles/`, `hooks/`, `types/` missing
- [x] Configure path aliases (`@/*`)
- [ ] Add ESLint + Prettier — ESLint only; no Prettier config
- [ ] Add `.gitignore`, `.env.example` — `.gitignore` only; `.env.example` missing
- [x] Verify dev server runs

### 2. Design System Setup  

**Tokens**
- [x] Color palette (primary, secondary, success, warning, error, background, border)
- [x] Typography scale (heading, body, small)
- [x] Spacing scale (padding, margin, card, container width)
- [x] Radii, shadows, z-index

**Theme**
- [x] Light mode
- [x] Dark mode
- [x] Theme toggle + system preference

**Reusable Components**
- [x] Button
- [x] Input
- [x] Textarea
- [x] Modal / Dialog
- [x] Card
- [x] Badge
- [x] Dropdown
- [x] Sidebar
- [x] Navbar
- [x] Table
- [x] Loader / Skeleton
- [x] Empty State
- [x] Toast / Sonner

**Responsive**
- [ ] Mobile breakpoint pass — deferred until pages exist
- [ ] Tablet breakpoint pass — deferred until pages exist
- [ ] Desktop breakpoint pass — deferred until pages exist

### 3. Landing Page

- [x] Hero (tagline, CTA, dashboard preview, highlights)
- [x] Features section (Docs, Tasks, Collab, Notes, Files, Analytics)
- [x] How It Works (6 steps)
- [x] Testimonials
- [x] Pricing
- [x] FAQ
- [x] Footer

### 4. Authentication Pages

- [x] Signup (Name, Email, Password, Confirm, Workspace Name)
  - [x] Password strength indicator
  - [x] Email verification UI
  - [x] Google / Microsoft buttons (UI only)
- [x] Login
  - [x] Remember Me
  - [x] Forgot Password link
  - [x] MFA UI
- [x] Forgot Password flow (Email → OTP → Verify → Reset)
- [x] Email Verification page

### 5. Onboarding Flow

- [ ] Step 1 — Workspace Setup (name, team size, department)
- [ ] Step 2 — Select Features (Docs/Notes/Tasks/Collab/Files)
- [ ] Step 3 — Invite Team (Admin / Manager / Developer / Viewer)
- [ ] Step 4 — Theme Selection (Light / Dark / System)

### 6. Dashboard Shell

- [ ] App layout (sidebar + topbar + content area)
- [ ] Sidebar nav with route highlighting
- [ ] Topbar (search, notifications, profile menu)
- [ ] Mobile responsive shell

### 7. Dashboard Pages

- [ ] Dashboard Home (analytics overview)
- [ ] Documents
- [ ] Notes
- [ ] Tasks
- [ ] Files
- [ ] Team
- [ ] Notifications
- [ ] Analytics
- [ ] Profile
- [ ] Settings

### 8. Task Module

- [ ] Kanban Board (drag-and-drop UI)
- [ ] Calendar View
- [ ] Task Details modal/page
- [ ] Filters (priority, assignee, due date)

### 9. Documentation Module

- [ ] Rich Text Editor (with markdown + code blocks)
- [ ] Templates
- [ ] Version history UI
- [ ] Search
- [ ] Categories sidebar

### 10. Notes Module

- [ ] Personal / Team / Meeting notes tabs
- [ ] Auto-save indicator
- [ ] Pin notes

### 11. File Manager Module

- [ ] Grid + list view
- [ ] Folder navigation
- [ ] Preview (image / PDF / video)
- [ ] Upload UI

### 12. Team Collaboration Module

- [ ] Members list
- [ ] Mentions UI
- [ ] Comments thread
- [ ] Activity feed

### 13. Notifications Module

- [ ] Notifications center
- [ ] Mark read / unread
- [ ] Filter by type (mention / task / alert)

### 14. Account / Settings

- [ ] Profile (Name, Email, Image, Department, Role)
- [ ] Change password
- [ ] Notification preferences
- [ ] Theme settings
- [ ] API tokens
- [ ] Activity history

---

## Phase 2 — Backend

### Stack
- [ ] Node.js + Express scaffolding
- [ ] MongoDB connection
- [ ] Project structure (`routes/`, `controllers/`, `models/`, `middleware/`)
- [ ] Env config + secrets

### API Implementation Order
1. [ ] Authentication APIs (Signup, Login, OAuth, MFA, Forgot Password)
2. [ ] User Management
3. [ ] Workspace APIs
4. [ ] Documents APIs
5. [ ] Notes APIs
6. [ ] Tasks APIs
7. [ ] File Upload APIs (Cloudflare R2)
8. [ ] Notifications APIs (Socket.io)
9. [ ] Analytics APIs

### Cloudflare Integration
- [ ] R2 Storage
- [ ] Workers
- [ ] CDN
- [ ] Access
- [ ] Analytics

### Auth
- [ ] JWT issuance + refresh
- [ ] OAuth (Google, Microsoft)

---

## Phase 3 — Integration

- [ ] Replace mock data with API calls (React Query)
- [ ] Auth context + protected routes
- [ ] Socket.io real-time wiring
- [ ] Error boundaries + toast on API failures

---

## Phase 4 — Testing

- [ ] Unit tests (utils, hooks)
- [ ] Component tests
- [ ] API integration tests
- [ ] E2E smoke tests

---

## Phase 5 — Deployment

- [ ] Frontend deploy (Vercel/Cloudflare Pages)
- [ ] Backend deploy
- [ ] MongoDB Atlas
- [ ] Cloudflare R2 + Workers
- [ ] Domain + SSL
- [ ] Monitoring / Analytics

---

## Working Notes

- Frontend uses **Next.js App Router** (the spec mentions React; Next.js with App Router is the chosen framework).
- State: **Zustand** for client state, **React Query** for server state.
- UI: **Shadcn UI** primitives on Tailwind.
- All UI built first with mock data — no backend calls until Phase 3.