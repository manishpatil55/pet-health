# Pet Health Tracker — Project Memory

## What We're Building
A **responsive web application** (React + TypeScript) for pet health management.
Mobile-first layouts from Stitch MCP design, scaled up for tablet and desktop.

The app enables pet owners to:
- Track vaccinations, deworming, medications, and vet visits
- Manage multiple pet profiles
- Dashboard overview of each pet's health status
- Upload and store health documents
- Track weight over time with graphs

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Global State | Zustand |
| Server State | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Dates | date-fns |
| Icons | Lucide React |
| HTTP | Axios |
| Toasts | react-hot-toast |
| Build | Vite + TypeScript |

---

## Design System (from approved Stitch MCP design)

### Color Tokens
```
Primary:         #4FB6B2
Primary Light:   #CFEDEA
Background:      #F7FAFA
Card:            #FFFFFF
Text:            #2F3A3A
Secondary Text:  #7A8A8A
Divider:         #E6EEEE
Success:         #6BCB77
Warning:         #F2B544
Error:           #E76F51
```

### Design Rules
- Mobile-first (match Stitch design exactly on mobile), then adapt for tablet + desktop
- Teal/mint healthcare palette — friendly, clean, not sterile
- White cards on off-white background (`#FFFFFF` on `#F7FAFA`)
- `rounded-xl` for cards, `rounded-lg` for inputs and buttons
- `shadow-sm` only — no heavy shadows
- Status colours applied consistently everywhere
- Font: **DM Sans** (Google Fonts)
- Status mapping: `completed` → #6BCB77 | `upcoming` → #F2B544 | `overdue` → #E76F51

### Breakpoints
- Mobile (< 768px): Single column, bottom nav bar (4 tabs)
- Tablet (768–1023px): 2-column grid, collapsible sidebar
- Desktop (≥ 1024px): Fixed 240px sidebar, multi-column layouts

---

## Backend API

### Base URL
```
Dev:    http://localhost:5001/api/v1
Env:    VITE_API_BASE_URL
```

### Auth System — DUAL TOKEN (CRITICAL FOR WEB)

| Token | Where to store | Lifetime |
|---|---|---|
| `accessToken` | Zustand store ONLY — NEVER localStorage/sessionStorage | 15 min |
| `refreshToken` | HttpOnly cookie set by server automatically — never touch it | 90 days |

**Auth flow:**
1. Login → save `accessToken` to Zustand, ignore `refreshToken` (cookie is set by server)
2. Every API call → `Authorization: Bearer <accessToken>`
3. 401 with `code: "TOKEN_EXPIRED"` → `POST /auth/refresh-token` (no body, cookie auto-sent) → get new `accessToken` → retry
4. Any other 401 code → clear Zustand → redirect `/login`
5. Logout → `POST /auth/logout` → clear Zustand

**401 error codes:**
```
TOKEN_EXPIRED         → refresh and retry
TOKEN_INVALID         → redirect to /login
WRONG_TOKEN_TYPE      → redirect to /login
NO_TOKEN              → redirect to /login
USER_NOT_FOUND        → redirect to /login
REFRESH_TOKEN_REUSE   → redirect to /login (all sessions revoked by server)
```

---

## API Status — What's Built

### ✅ Auth `/api/v1/auth` — FULLY BUILT
```
POST /auth/signup           → sends OTP to email; returns { email, otpExpiresAt }
POST /auth/verify-email     → { email, otp } → verifies account
POST /auth/resend-otp       → resends OTP (rate limited 1/min)
POST /auth/google           → { name, email, email_verified, picture } → returns tokens + user
POST /auth/login            → { email, password } → returns tokens + user
POST /auth/refresh-token    → no body (cookie sent auto) → returns new accessToken
POST /auth/logout           → clears session + cookie
POST /auth/logout-all       → clears all sessions
POST /auth/change-password  → { currentPassword, newPassword }
POST /auth/forgot-password  → { email } → sends reset link
POST /auth/reset-password   → { token, newPassword }
DELETE /auth/delete-account → deletes account
```

### ✅ Pets `/api/v1/pets` — FULLY BUILT
```
POST   /pets          → create pet
GET    /pets          → get all pets (paginated: page, limit)
GET    /pets/:id      → get single pet
PUT    /pets/:id      → update pet
DELETE /pets/:id      → delete pet
```

### 🔄 Vaccinations `/api/v1/vaccinations` — BUILT (team still working on it)
```
POST  /vaccinations/pet/:petId/auto-generate  → auto-generate schedule from pet type+age
POST  /vaccinations                           → manual vaccination entry
GET   /vaccinations/pet/:petId               → all vaccinations for pet
GET   /vaccinations/pet/:petId/upcoming      → upcoming only
GET   /vaccinations/pet/:petId/overdue       → overdue only
GET   /vaccinations/:id                      → single record
PUT   /vaccinations/:id                      → update record
DELETE /vaccinations/:id                     → delete record
PATCH /vaccinations/:id/complete             → mark as completed
```

### ⏳ NOT YET BUILT — use mock data + placeholder service stubs
```
Medications, Deworming, Vet Visits, Weight, Documents
```

---

## TypeScript Interfaces (src/types/index.ts)

```ts
interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
}

interface Pet {
  _id: string;
  owner: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Other';
  breed: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  initialWeight: number;
  photo?: string;
  microchipId?: string;
}

interface Vaccination {
  _id: string;
  pet: string;
  vaccineTemplate?: string;
  vaccineName: string;
  dateAdministered?: string;
  nextDueDate: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
  documents?: Array<{ url: string; type: 'image' | 'pdf'; uploadedAt: string }>;
  createdBy: string;
  status: 'completed' | 'upcoming' | 'overdue';
}

interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  page: number;
  pages: number;
  total: number;
}

interface ApiError {
  success: false;
  code: string;
  message: string;
}
```

---

## UX Rules
1. **Overdue first** — always pinned at top, in `#E76F51`
2. **3-state lists** — loading skeleton → empty state with CTA → data
3. **Mutations** — optimistic update + toast (react-hot-toast) on success/error
4. **Delete** — always requires confirmation modal first
5. **accessToken** — NEVER localStorage. Memory (Zustand) only.
6. **Unbuilt APIs** — render mock data but stub the service layer properly so real data can be swapped in later

---

## Build Status Checklist
- [ ] Vite + React + TS + Tailwind scaffolded
- [ ] Tailwind config with all design tokens
- [ ] UI component library (Button, Card, Input, Badge, Modal, Avatar, Skeleton, EmptyState)
- [ ] Axios instance with interceptor + auto token refresh on 401
- [ ] Zustand auth store (in-memory accessToken)
- [ ] Zustand pet store (active pet ID)
- [ ] Auth pages: Login, Signup, OTP verify, Forgot Password, Reset Password
- [ ] App layout shell (Sidebar desktop, BottomNav mobile)
- [ ] React Router with all routes
- [ ] Dashboard (real pets + vaccinations API, mock for rest)
- [ ] Pet List + Add Pet + Pet Profile (real API)
- [ ] Vaccination Tracker (real API)
- [ ] Medication Tracker (mock)
- [ ] Deworming Tracker (mock)
- [ ] Vet Visit History (mock)
- [ ] Weight Tracking + Recharts graph (mock)
- [ ] Document Storage (mock)
- [ ] Settings page