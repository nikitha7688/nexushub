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

- [x] Step 1 — Workspace Setup (name, team size, department)
- [x] Step 2 — Select Features (Docs/Notes/Tasks/Collab/Files)
- [x] Step 3 — Invite Team (Admin / Manager / Developer / Viewer)
- [x] Step 4 — Theme Selection (Light / Dark / System)

### 6. Dashboard Shell

- [x] App layout (sidebar + topbar + content area)
- [x] Sidebar nav with route highlighting
- [x] Topbar (search, notifications, profile menu)
- [x] Mobile responsive shell

### 7. Dashboard Pages

- [x] Dashboard Home (analytics overview)
- [x] Documents
- [x] Notes
- [x] Tasks
- [x] Files
- [x] Team
- [x] Notifications
- [x] Analytics
- [x] Profile
- [x] Settings

### 8. Task Module

- [x] Kanban Board (drag-and-drop UI)
- [x] Calendar View
- [x] Task Details modal/page
- [x] Filters (priority, assignee, due date)

### 9. Documentation Module

- [x] Rich Text Editor (with markdown + code blocks)
- [x] Templates
- [x] Version history UI
- [x] Search
- [x] Categories sidebar

### 10. Notes Module

- [x] Personal / Team / Meeting notes tabs
- [x] Auto-save indicator
- [x] Pin notes

### 11. File Manager Module

- [x] Grid + list view
- [x] Folder navigation
- [x] Preview (image / PDF / video)
- [x] Upload UI

### 12. Team Collaboration Module

- [x] Members list
- [x] Mentions UI
- [x] Comments thread
- [x] Activity feed

### 13. Notifications Module

- [x] Notifications center
- [x] Mark read / unread
- [x] Filter by type (mention / task / alert)

### 14. Account / Settings

- [x] Profile (Name, Email, Image, Department, Role)
- [x] Change password
- [x] Notification preferences
- [x] Theme settings
- [x] API tokens
- [x] Activity history

---

## Phase 2 — Backend

### Stack
- [x] Node.js + Express scaffolding
- [x] MongoDB connection
- [x] Project structure (`routes/`, `controllers/`, `models/`, `middleware/`)
- [x] Env config + secrets

### API Implementation Order
1. [x] Authentication APIs (Signup, Login, OAuth, MFA, Forgot Password)
2. [x] User Management
3. [ ] Workspace APIs
4. [ ] Documents APIs
5. [ ] Notes APIs
6. [ ] Tasks APIs
7. [ ] File Upload APIs (Cloudflare R2)
8. [ ] Notifications APIs (Socket.io)
9. [ ] Analytics APIs

### Cloudflare Integration
See **[INTEGRATIONS.md §2](./INTEGRATIONS.md#2-cloudflare)** for setup steps and code-change list.
- [ ] R2 Storage — do this with API item #7 (File Upload APIs)
- [ ] Workers — later, after the app is behind Cloudflare DNS
- [ ] CDN — automatic once DNS is proxied through Cloudflare
- [ ] Access — only if a private staging env is needed
- [ ] Analytics — drop-in snippet (Web Analytics) or Workers Analytics Engine

### Auth
See **[INTEGRATIONS.md §1](./INTEGRATIONS.md#1-firebase-authentication)** for the Firebase migration plan.
- [x] JWT issuance + refresh *(in-house — replaced when Firebase lands)*
- [x] OAuth (Google, Microsoft) — authorization-code flow wired *(in-house — replaced when Firebase lands)*
- [ ] Firebase Authentication (Google + Microsoft + email/password) — replaces in-house auth; doc'd in INTEGRATIONS.md

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