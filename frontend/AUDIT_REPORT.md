# Worksy – End-to-End Audit Report

Stack: **Next.js 14 (App Router, TypeScript, Tailwind)** frontend · **Spring Boot + JPA + PostgreSQL + JWT** backend.
Both projects are delivered with the fixes described here applied.

> **Verification limits.** The sandbox had no Maven, no `node_modules` and no network, so **neither project was built or run.**
> What *was* done: the frontend was type-checked with `tsc` (React typings were unavailable, so only errors unrelated to React typings are meaningful; none were reported in project code), the Java edits were reviewed symbol-by-symbol against the entities/repositories, and all 24 frontend API calls were matched mechanically against the controller annotations. Section 11 lists what you must test by running it.

---

## 1. Complete project audit (as received)

**Domain:** a home-services marketplace. Customers browse categories/services/providers, book a slot at a saved address, track the job, cancel, and review. Providers receive booking requests, accept/decline, start a job with the customer's OTP, complete it, and see reviews/earnings.

**Backend (real, ~70% of the core flow):** auth (register/login/JWT), categories, services + add-ons, provider profiles, addresses, bookings with a status machine (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED), reviews with rating recalculation.

**Frontend (was a static prototype):** ~40 components driven entirely by `lib/marketplace-data.ts` and `lib/provider-data.ts`. **It made zero HTTP requests** – no `fetch`, no base URL, no Authorization header. Login accepted any email/password (`setTimeout`), the role was chosen with a toggle, and no token existed. None of the 22 backend endpoints was reachable from the UI.

Data-model mismatch between the two halves: string ids (`'pro-ravi'`) vs numeric `Long`; UI statuses (`Upcoming/Ongoing…`) vs enums (`PENDING/CONFIRMED…`); rich UI fields (ratings per service, FAQs, portfolio, distance, tax, coupons, wallet) that have no column in the database.

---

## 2. Frontend functionality status

| Area | Before | After |
|---|---|---|
| Login / signup | Fake, any credentials | ✅ Real API, server-decided role, JWT stored, expiry checked |
| Route protection | None | ✅ `/customer` and `/provider` redirect when signed out / wrong role |
| Customer home / explore | Mock data | ✅ Categories, services, providers from API |
| Booking flow | Hardcoded dates ("Sept 5–7"), fake address, 10% tax, seeded problem text | ✅ Real dates, real addresses (add persists), price = backend price, POST /bookings, backend errors shown |
| My bookings / cancel | Local state | ✅ Loaded from API; cancel → PATCH |
| Reviews (customer) | Local, pre-filled text | ✅ POST /reviews, errors shown |
| Addresses | Local | ✅ Create / list / delete via API |
| Provider dashboard / jobs | Mock | ✅ Loaded from `/bookings/provider/{id}`; accept/decline/start/complete → API |
| Provider onboarding | Did not exist (new provider had no profile → dashboard unusable) | ✅ New form → POST provider-profile |
| Provider reviews | Mock (1,284 reviews) | ✅ From `/reviews/provider/{id}`, stats computed |
| Start-job OTP | Client-side check, backdoor `1234`/`4821`, "Demo OTP" shown | ✅ Verified by backend; provider never receives it |
| Role switching | Faked identity; provider link went to non-existent `/dashboard` | 🔧 Signs out and opens login for the other role (roles are fixed per account) |
| Modal open/close | 8 modals crashed on close (hooks after early `return null`) | ✅ Fixed with wrapper components |
| Messages, wallet, offers/coupons, favorites, notifications, earnings, analytics, calendar, customers CRM, settings, help | Mock | ❌ **No backend exists** – still client-side only (see §8) |

## 3. Backend functionality status

| Area | Status |
|---|---|
| Auth register/login, BCrypt, JWT filter | ✅ (fixed: 401 on bad credentials, persistent signing key) |
| Categories | ✅ read-only |
| Services | ✅ read; POST exists (any authenticated user – see §8) |
| Providers | ✅ **new** GET `/providers`, `/providers/{id}` |
| Provider profile | ✅ create/get · ❌ no update |
| Addresses | ✅ create/list · ✅ **new** delete, default handling |
| Bookings | ✅ create/list/accept/decline/start/complete/cancel (fixed: null add-ons, foreign address, past date, category rule, transactions, OTP) |
| Reviews | ✅ (now transactional) |
| Validation & errors | ✅ validation → 400 with field map; unreadable body → 400; integrity → 409; 401 entry point |
| Payments, chat, notifications, coupons, wallet/payouts, tracking | ❌ not implemented |

## 4. Frontend → Backend API mapping (verified against controllers)

| Frontend function | Method + path | Backend mapping | Auth | Match |
|---|---|---|---|---|
| `api.register` | POST `/auth/register` | AuthController | public | ✅ |
| `api.login` | POST `/auth/login` | AuthController | public | ✅ |
| `api.getCategories` | GET `/categories` | ServiceCategoryController | public | ✅ |
| `api.getServices` | GET `/services[?categoryId]` | ServiceController | public | ✅ |
| `api.getService` | GET `/services/{id}` | ServiceController | public | ✅ |
| `api.getProviders` | GET `/providers[?category]` | ProviderController (new) | public | ✅ |
| `api.getProvider` | GET `/providers/{id}` | ProviderController (new) | public | ✅ |
| `api.getMyProviderProfile` | GET `/users/{id}/provider-profile` | ProviderProfileController | JWT | ✅ |
| `api.createProviderProfile` | POST `/users/{id}/provider-profile` | ProviderProfileController | JWT | ✅ |
| `api.getAddresses` | GET `/users/{id}/addresses` | AddressController | JWT | ✅ |
| `api.createAddress` | POST `/users/{id}/addresses` | AddressController | JWT | ✅ |
| `api.deleteAddress` | DELETE `/users/{id}/addresses/{aid}` | AddressController (new) | JWT | ✅ |
| `api.createBooking` | POST `/bookings` | BookingController | JWT | ✅ |
| `api.getCustomerBookings` | GET `/bookings/customer/{id}` | BookingController | JWT | ✅ |
| `api.getProviderBookings` | GET `/bookings/provider/{id}` | BookingController | JWT | ✅ |
| `api.acceptBooking` | PATCH `/bookings/{id}/accept` | BookingController | JWT | ✅ |
| `api.declineBooking` | PATCH `/bookings/{id}/decline` | BookingController | JWT | ✅ |
| `api.startBooking` | PATCH `/bookings/{id}/start` body `{otp}` | BookingController | JWT | ✅ |
| `api.completeBooking` | PATCH `/bookings/{id}/complete` | BookingController | JWT | ✅ |
| `api.cancelBooking` | PATCH `/bookings/{id}/cancel` | BookingController | JWT | ✅ |
| `api.submitReview` | POST `/reviews` | ReviewController | JWT | ✅ |
| `api.getProviderReviews` | GET `/reviews/provider/{id}` | ReviewController | public | ✅ |

Conventions checked: JSON is camelCase both ways; ids are `Long` (frontend converts `String(id)` ↔ `Number(id)`); dates are `yyyy-MM-dd`; enums are upper-case (`CUSTOMER`, `PENDING`, `HOME`…); header is `Authorization: Bearer <jwt>`; error bodies are `{status, error, message, fieldErrors?}` and parsed into `ApiError`; base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api/v1`); CORS origin from `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`).
Backend endpoints not used by UI: `POST /services` (admin-style), `GET /health/db`, `GET /providers/{id}` (client function exists; UI uses the list).

## 5. Database integration status

Chain verified by reading code: Controller → Service → Repository → JPA entity → PostgreSQL, and back through DTOs.

* Keys/relations: users 1—1 provider_profiles; users 1—N addresses; categories 1—N services 1—N service_addons; bookings → customer, provider, service, address; booking_addons snapshot price; reviews 1—1 booking. All consistent.
* ⚠️ **No provider ↔ service relation.** A "provider offers service X" fact does not exist. Interim rule (frontend and backend): a provider offers every service whose category name equals the provider's `category`; booking creation rejects mismatches. Proper fix = join table.
* ⚠️ `ddl-auto=update` – fine for development; use migrations (Flyway) for production.
* ✅ `data.sql` runs on **every** start; category inserts were idempotent, service inserts were missing – **added with `NOT EXISTS` guards** so restarts don't duplicate.
* ✅ Bookings/reviews now `@Transactional` (complete-booking + rating recalculation were multi-write without a transaction).
* No DB indexes beyond PKs/FKs; acceptable at this size.

## 6. Authentication / security status

Flow: login form → `POST /auth/login` → JWT (24 h, HS256) → stored in `localStorage` (`worksy_token_v1`) → `Authorization: Bearer` on every call → `JwtAuthenticationFilter` → `SecurityConfig` rules → ownership checks in controllers.

Fixed: CORS was missing from the Security chain (browser preflights would 403); signing key was random per start (all sessions died on restart) – now `JWT_SECRET`; bad credentials returned 409 – now 401; unauthenticated returned Spring's default 403 – now JSON 401; `permitAll` on `/services/**` covered POST – now GET only; provider OTP leaked to provider – now hidden and server-verified; expired token now clears the session and returns to login.

Still open (see §8): tokens in `localStorage` (XSS exposure), no rate limiting on login/OTP (4-digit OTP is brute-forceable), `/health/db` is public and returns raw exception text, no password rules beyond min length, no refresh token/logout invalidation, DB password default in `application.properties`.

## 7. All identified issues

### A. Critical (application could not work)
1. Frontend had no API layer at all; nothing reached the backend. → **fixed** (`lib/api.ts`, mappers, pages rewired)
2. Fake login / no JWT / no guards. → **fixed**
3. No CORS in the Security filter chain. → **fixed**
4. JWT key regenerated each start. → **fixed**
5. Services table empty (no seed) → nothing bookable. → **fixed**
6. Provider accounts had no onboarding → no `provider_profiles` row → dashboard/bookings impossible. → **fixed**
7. Modals crashed on close (rules-of-hooks): Review, Location, Payments, LiveTracking, ServiceDetail, CompleteJob, OngoingJob, provider NotificationsDrawer. → **fixed**
8. Frontend ids like `pro-ravi`, `addr-custom` would become `NaN` in requests. → **fixed** (all lists come from API)

### B. Functional
1. Booking modal: hardcoded dates in the past relative to today; backend rejects past dates. → fixed
2. Price mismatch: UI added 10% tax and coupon math; backend charges base + add-ons. → fixed (UI shows backend price; tax row/coupon input hidden)
3. Bad-credentials 409 vs 401. → fixed
4. `addonIds` null → NPE. → fixed
5. Booking accepted another user's `addressId`. → fixed (403)
6. Provider could be booked for a service outside their category. → fixed (409)
7. OTP verified client-side with backdoors. → fixed
8. Provider jobs were filtered client-side by skill string match (`AC Care` ≠ `AC Repair`) hiding real jobs. → removed
9. Cancel confirm promised a refund; no payments exist. → text corrected
10. Review modal pre-filled a fake review; success shown before the server answered. → fixed
11. Provider "switch to customer" → 404 route. → fixed
12. Address delete: none in backend → added; default flag now consistent.
13. Login page: social buttons and "forgot password" pretended to work. → now say "not available yet"
14. Hardcoded identities (Charan, Ravi Sharma, phone numbers, "1,284 reviews") → replaced by real user data / computed stats
15. Simulated chat replies and tracking stepper → removed/hidden (no backend)
16. `HomeTab` featured providers/categories/"recently viewed" were hardcoded with fake ids. → derived from API

### C. Improvements / remaining work
See §8.

## 8. Remaining / pending work (NOT done)

**Backend features that do not exist, so their UI is still client-side mock:**
messaging, notifications, payments & payment status, wallet, payouts/withdrawals, earnings history & analytics, coupons/offers (customer + provider), favorites, customer CRM, working hours/calendar, live tracking/ETA, provider review replies, password reset, social login, profile edit (provider or customer), phone number capture at signup, provider photo/avatar upload.

**Backend hardening:**
* Provider ↔ Service join table (real "services offered", per-provider price).
* `PUT /provider-profile`, `PUT /users/{id}`.
* Restrict `POST /services` to an admin role (currently any logged-in user).
* Booking: slot-conflict check (double booking of a provider), max add-ons, timezone handling for "past date".
* Rate-limit login and OTP attempts; OTP expiry; longer OTP.
* Lock down `/health/db`; move DB credentials to env only; Flyway migrations; unit/integration tests (none exist).
* `Review.createdAt`, `Booking.createdAt` columns (UI shows booking date in place of "created at").
* Add `customerAvatar`, review `serviceTitle`, provider `reviewsCount` to DTOs.

**Frontend:**
* Fields the UI shows that the database does not store are given neutral values, not invented ones: service rating/reviews count/included/FAQs, provider distance/portfolio/reviews list/phone, booking tax/discount, payment status (always "Pending"), job distance. Cards therefore show `0.0`, empty lists or "—".
* Provider "complete job" collects parts and a final price, but the backend records completion only; the earned amount is the booking total. Parts/notes are not persisted.
* Provider balance is *derived* (90% of completed jobs minus local withdrawals) – not a ledger.
* Token in `localStorage` → consider httpOnly cookie.
* Dead code: `components/auth/AuthCard.tsx` (fake login, unused), `components/ui/*` demo components, the two mock data files (still imported for types and `MARKETPLACE_SKILLS`/`popularLocations`).
* Provider `ProviderSidebar` still contains hardcoded "Ravi Sharma" (component is only used for its exported types).
* ESLint `react-hooks/rules-of-hooks` will still warn in the 8 modals (inner components keep a never-true guard for TypeScript narrowing); refactor to pass a non-null prop to remove it.

## 9. Changes made

**Backend** (`worsi-backend`)
* `config/SecurityConfig` – CORS bean + `.cors()`, JSON 401 entry point, GET-only public catalogue, permit `OPTIONS`.
* `security/JwtUtil` – key from `app.jwt.secret`.
* `Exception/*` – `UnauthorizedException`, `BadRequestException`; handlers for validation, unreadable body, integrity, 401, 400.
* `AuthService` – 401 for bad credentials.
* `BookingService` – transactional; null-safe add-ons; address ownership; past-date and provider/service-category checks; OTP verify in `startJob`; OTP hidden from provider responses; review info in responses.
* `BookingResponse` – adds address fields, `customerPhone`, `providerPhone`, `reviewed`, `ratingGiven`, `reviewGiven`.
* `BookingController` – `/start` takes `StartJobRequest {otp}`.
* `AddressService/Controller` – default-address logic, DELETE endpoint.
* `ProviderController` (new), `ProviderProfileService/Repository` – directory endpoints.
* `ReviewService` – transactional.
* `application.properties` – env-configurable DB, JWT secret, CORS origins; `data.sql` – idempotent sample services/add-ons.

**Frontend** (`antigravity-main`)
* New: `lib/api.ts`, `lib/mappers.ts`, `components/provider/ProviderOnboarding.tsx`, `.env.example`.
* Rewritten: `lib/auth-context.tsx`, `app/login/page.tsx`, `app/customer/page.tsx`, `app/provider/page.tsx`.
* Edited: `BookingFlowModal`, `ReviewModal`, `OngoingJobModal`, `CompleteJobModal`, `LiveTrackingModal`, `ServiceDetailModal`, `LocationModal`, `PaymentsModal`, provider `NotificationsDrawer`, `HomeTab`, `ReviewsTab`, `ProfileTab` (both), `ProviderHeader`, `CustomerHeader`, `MessagesTab`, `OffersTab`, `HelpSupportTab`, `ExploreTab`.

No dependencies were added to either project. Architecture is unchanged.

## 10. Final end-to-end trace (by code reading; not executed)

| Workflow | Chain | Result |
|---|---|---|
| Register + login (customer) | form → `api.register` → AuthService (BCrypt, unique email) → `api.login` → JWT → `tokenStore` → `/customer` | ✅ |
| Register + login (provider) | same → `GET /users/{id}/provider-profile` → 404 → onboarding → POST profile → `refreshProviderProfile` → dashboard | ✅ |
| Browse | `/categories`, `/services`, `/providers` (public) → mappers → Home/Explore | ✅ |
| Add address | modal → `POST /users/{id}/addresses` → default logic → list refetched | ✅ |
| Book | modal → `POST /bookings` (customer id from JWT-checked path, address ownership, category rule, price calc) → `PENDING` → UI list | ✅ |
| Provider accepts | `PATCH /accept` (provider ownership check) → `CONFIRMED` → job moves to Upcoming | ✅ |
| Start with OTP | customer sees OTP (booking response) → provider types it → `PATCH /start {otp}` → `IN_PROGRESS` / 400 on wrong OTP | ✅ |
| Complete | `PATCH /complete` → `COMPLETED`, provider `completedJobs++` | ✅ |
| Review | customer → `POST /reviews` → rating recalculated → provider Reviews tab | ✅ |
| Cancel | `PATCH /cancel` → `CANCELLED` | ✅ |
| Expired token | any 401 with token → session cleared → guard sends to `/login` | ✅ |

## 11. Needs manual testing

1. Start PostgreSQL (DB `worksy`), run `mvn spring-boot:run` (watch for compile errors – Java was not compiled here). Confirm categories **and** services appear after two restarts without duplicates.
2. `npm install && npm run dev`; copy `.env.example` to `.env.local` if the API is not on `localhost:8080`. Run `npm run build` (ESLint hook warnings may appear).
3. Preflight/CORS from `http://localhost:3000`; set `CORS_ALLOWED_ORIGINS` for any other origin.
4. Full happy path with two browsers: customer books → provider (same category as the service) accepts → OTP start → complete → customer reviews.
5. Negative cases: wrong password (401 message), duplicate email (409), wrong OTP, booking a service in another provider's category, booking with another user's address (use a REST client), cancel a completed booking, review twice, expired/invalid token.
6. Delete an address that has bookings (expect a 409 message, not a crash).
7. Check the modal close paths (review, location, payments, service detail, complete/ongoing job) for console errors.
8. Verify Jackson accepts `defaultAddress` and returns `verified`, `reviewed` as expected (Lombok boolean naming).
9. Empty states: no providers in a category, no services, provider with no jobs/reviews.
