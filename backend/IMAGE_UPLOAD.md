# Worksy – booking photo upload

## API
`POST /api/v1/bookings` (JWT required, same as before)
- No photos: unchanged JSON body (`Content-Type: application/json`).
- With photos: `multipart/form-data`
  - part `booking` – `application/json`, same fields as the JSON body
  - part `images` – 0..5 files, repeat the part name once per file (JPEG/PNG/WEBP, ≤ 5 MB each)
- 201 → `BookingResponse` now includes `images: [{ id, fileName, contentType, sizeBytes, url }]`
  (`url` is a path under `/api/v1`, e.g. `/bookings/12/images/34`).

`GET /api/v1/bookings/{bookingId}/images/{imageId}` (JWT required) – image bytes. Allowed only for the
booking's customer or its assigned provider; anyone else gets 403.

| Status | When |
|---|---|
| 400 | more than 5 images, unreadable/empty file, missing `booking` part, validation errors |
| 403 | `customerId` is not the logged-in user; image requested by someone else |
| 413 | image over 5 MB (or request over the multipart limit) |
| 415 | not a real JPEG/PNG/WEBP (checked from the file bytes, not the client MIME type) |
| 503 | storage failed (details only in server logs) |

## Database
Flyway `V3__add_booking_images.sql` creates `booking_images` (FK → `bookings`, ON DELETE CASCADE). Nothing else changes.

## Configuration
| Variable | Default | Purpose |
|---|---|---|
| `UPLOAD_DIR` | `./uploads` | Where image files are written. **Must be a persistent disk in production.** |

Limits live in `application.properties` (`app.booking.images.*`, `spring.servlet.multipart.*`).
Add `uploads/` to `.gitignore`.

## Storage
Files go through the `ImageStorage` interface (`LocalImageStorage` today). To use Cloudinary/S3/GCS later,
add another implementation and make it the active bean; no booking code changes.

## Run locally
1. Backend: `./mvnw spring-boot:run` (Flyway applies V3). Frontend: `npm run dev`.
2. Log in as a customer → book a service → step 4 → add photos → confirm.
3. Log in as the provider → job details → “Customer Photos”. Customer: booking details → “Photos you attached”.

---

# Profile pictures (customers and providers) and "My Customers"

## Profile pictures
Both roles use the same endpoints; the user is always the one in the JWT (no user id in the URL or body), so nobody can change another account's picture.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/profile/me/avatar` | `multipart/form-data`, one part named `image` (JPEG/PNG/WEBP, max `PROFILE_AVATAR_MAX_BYTES`, default 2 MB). Type is decided from the file's magic bytes. Replaces any previous picture. |
| `DELETE` | `/api/v1/profile/me/avatar` | Removes the picture (back to the default avatar). |
| `GET` | `/api/v1/users/{id}/avatar` | Public image bytes, so plain `<img>` tags work. Only the picture the user chose to upload is served. |

Stored as: file in `ImageStorage` (key `avatars/{userId}/{uuid}.ext`) + `users.avatar_storage_key` / `users.avatar_url` (`?v=` changes on every upload so browsers never show a stale picture). No new migration is needed (`V5` already adds `avatar_storage_key`).

The avatar URL is now also returned in: `ProviderProfileResponse.avatarUrl` and `NearbyProviderResponse.avatarUrl` (provider lists / profiles shown to customers), `BookingResponse.customerAvatarUrl` / `providerAvatarUrl`, and `ReviewResponse.customerAvatarUrl`.

**Production storage:** `LocalImageStorage` writes to `UPLOAD_DIR`. Point `UPLOAD_DIR` at a persistent volume, or pictures vanish on redeploy. To use S3/Cloudinary/GCS, add another `ImageStorage` implementation and make it the active bean; no other code changes.

## GET /api/v1/provider/customers (provider only)
The signed-in provider's real customers: everyone with at least one non-cancelled booking (cancelled / declined bookings are ignored) with that provider. The provider is taken from the JWT; the path has no provider id. A non-provider gets 403; a provider who has not finished onboarding gets 404. It is intentionally NOT under `/providers/**`, which is public in `SecurityConfig`.

Each entry: `customerId, name, avatarUrl, phone, totalBookings, completedBookings, totalSpent (completed bookings only), lastBookingDate, lastServiceTitle, lastStatus, lastLocation ("Area, City")`. Email, auth ids and the full street address are never included.
