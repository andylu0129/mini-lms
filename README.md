# Mini LMS

A student-facing consultation portal that allows students to register, book consultations, and manage them from a personalised dashboard.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
  - [Node.js Setup](#nodejs-setup)
  - [Docker Setup](#docker-setup)
  - [Supabase Setup](#supabase-setup)
- [Running the Project](#running-the-project)
  - [Using Docker](#using-docker)
  - [Without Docker](#without-docker)
- [Stopping the Project](#stopping-the-project)
- [Running Tests](#running-tests)
  - [Unit Tests](#unit-tests)
  - [E2E Tests](#e2e-tests)
- [Summary of Overall Implementation](#summary-of-overall-implementation)
  - [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Student Dashboard](#student-dashboard)
  - [Consultation Booking](#consultation-booking)
  - [Database Design](#database-design)
  - [Security](#security)
  - [Testing](#testing)
  - [Assumptions and Considerations](#assumptions-and-considerations)
- [Future Improvements](#future-improvements)
- [Deployed Version](#deployed-version)

## Tech Stack

| Category          | Technology              | Version | Purpose                                               |
| ----------------- | ----------------------- | ------- | ----------------------------------------------------- |
| Framework         | Next.js                 | v16     | Full-stack React framework with App Router            |
| Language          | TypeScript              | v5      | Static typing across the entire codebase              |
| Database          | Supabase (PostgreSQL)   | -       | Hosted PostgreSQL with built-in Auth and RLS          |
| Supabase Client   | `@supabase/ssr`         | v0.8    | SSR-compatible Supabase client for Next.js            |
| Supabase Client   | `@supabase/supabase-js` | v2      | Core Supabase JS client                               |
| Form Management   | React Hook Form         | v7      | Performant form state management                      |
| Schema Validation | Zod                     | v4      | Runtime validation for forms and API boundaries       |
| UI Components     | Shadcn/UI + Radix UI    | -       | Accessible, unstyled primitives with Tailwind styling |
| Styling           | Tailwind CSS            | v4      | Utility-first CSS                                     |
| Date Handling     | Moment.js               | v2      | Date formatting and display                           |
| Unit Testing      | Vitest                  | v4      | Fast unit test runner with Jest-compatible API        |
| Coverage          | `@vitest/coverage-v8`   | v4      | V8-based code coverage                                |
| E2E Testing       | Cypress                 | v15     | End-to-end browser testing                            |
| Linting           | ESLint                  | v9      | Static analysis with Next.js config                   |

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/andylu0129/mini-lms.git
cd mini-lms
```

Install dependencies:

```bash
npm ci
```

---

## Prerequisites

### Node.js Setup

This project requires **Node.js v20**. It is recommend to use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

1. **Install nvm**

   **macOS / Linux:**

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```

   **Windows:**

   Download and install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) from the latest release (nvm-setup.exe can be found scrolling down to Assets section).

2. **Install and use Node.js v20**

   **macOS / Linux:**

   ```bash
   nvm install 20
   nvm use 20
   ```

   **Windows:**

   ```powershell
   nvm install 20
   nvm use 20
   ```

3. **Verify the installation**

   ```bash
   node -v
   ```

   You should see a version starting with `v20`.

### Docker Setup

1. **Install Docker Desktop and CLI**

   Download and install from the official site: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Configure Docker Desktop settings** (Settings > General)

   Enable the following options:
   - **Expose daemon on tcp://localhost:2375 without TLS**
   - **Use the WSL 2 based engine** (Windows Home can only run the WSL 2 backend)
   - **Add the \*.docker.internal names to the host's /etc/hosts file** (requires password)

### Supabase Setup

> **Note:** Supabase requires Docker to be installed and running.

1. **Install the Supabase CLI**

   **Windows (via Scoop):**

   If you don't have Scoop installed, run the following in PowerShell:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

   # Reverts the execution policy back to its default.
   Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser
   ```

   Then install the Supabase CLI:

   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **macOS / Linux (via Homebrew):**

   ```bash
   brew install supabase/tap/supabase
   ```

2. **Start Supabase at project level**

   ```bash
   supabase start
   ```

3. **Reset the database** (applies migrations and seed data if exist)

   ```bash
   supabase db reset
   ```

## Running the Project

### Using Docker Container

1. **Set up environment variables**

   Run `supabase status` to retrieve your local credentials:

   ```bash
   supabase status
   ```

   The output includes an **Authentication Keys** section.
   Create a copy of `.env.example` named `.env.local` and fill in the values below.

   Example `supabase status` output:

   ```
   🔑 Authentication Keys
   ├─────────────┬────────────────────────────────────────────────┤
   │ Publishable │ sb_publishable_xxxxxxxxxxxxxxxxxxxx            │
   ```

   Your completed `.env.local` should look like:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
   ```

2. Build and start the container:

   ```bash
   docker compose up --build
   ```

3. Access the app at [http://localhost:3000](http://localhost:3000)

### Without Docker Container

1.  **Set up environment variables**

    Run `supabase status` to retrieve your local credentials:

    ```bash
    supabase status
    ```

    The output includes an **APIs** section and an **Authentication Keys** section.
    Create a copy of `.env.example` named `.env.local` and fill in the values below.

    | Section             | Field         | Maps to                                |
    | ------------------- | ------------- | -------------------------------------- |
    | APIs                | `Project URL` | `NEXT_PUBLIC_SUPABASE_URL`             |
    | Authentication Keys | `Publishable` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

    Example `supabase status` output:

    ```
    🌐 APIs
    ├────────────────┬─────────────────────────────────────┤
    │ Project URL    │ http://127.0.0.1:54321              │

    🔑 Authentication Keys
    ├─────────────┬────────────────────────────────────────────────┤
    │ Publishable │ sb_publishable_xxxxxxxxxxxxxxxxxxxx            │
    ```

    Your completed `.env.local` should look like:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
    ```

2.  Build the app:

    ```bash
    npm run build
    ```

3.  Start the server:

    ```bash
    npm start
    ```

4.  Access the app at [http://localhost:3000](http://localhost:3000)

## Stopping the Project

- **Stop Supabase:**

  ```bash
  supabase stop
  ```

- **Stop the Docker container:**

  ```bash
  docker compose down
  ```

---

## Running Tests

### Unit Tests

Run all unit tests:

```bash
npm run test:unit
```

Run with coverage report:

```bash
npm run test:coverage
```

### E2E Tests

1. **Set up the Cypress environment file**

   Create a copy of `cypress.env.json.example` named `cypress.env.json` and fill in the credentials of an existing user in your local Supabase instance:

   ```json
   {
     "TEST_USER_EMAIL": "your-test-user@example.com",
     "TEST_USER_PASSWORD": "YourPassword1!"
   }
   ```

   > The test user must already exist in your local Supabase instance. You can register one via the sign-up page or create one directly through the Supabase dashboard at [http://127.0.0.1:54323](http://127.0.0.1:54323).

2. **Start the dev server**

   Cypress runs tests against the live application, so the Next.js dev server must be running first:

   ```bash
   npm run dev
   ```

3. **Open Cypress**

   In a separate terminal:

   ```bash
   npm run test:e2e
   ```

4. In the Cypress UI, select **E2E Testing** → choose a browser → click any spec file to run it.

---

## Overall Implementation

### Architecture

The application is built on Next.js 16's App Router with a clear separation between public and protected routes. All protected pages live under `src/app/(protected)/` and are guarded at two layers: the proxy middleware and individual server action calls.

All data mutations and fetching are handled via **Next.js Server Actions** (`actions.ts` files collocated with their routes). There are no separate API routes. This choice was deliberate as Server Actions eliminate the need for a traditional REST layer for this scale of application, keep data-fetching logic close to the UI that consumes it, and allow TypeScript to enforce the full call signature end-to-end without any manual type duplication.

### Authentication

Password-based authentication was chosen over magic link or OTP. Rationale: password-based auth is the most intuitive flow for a student portal where users return regularly, has no dependency on email delivery latency during the session, and is fully supported by Supabase's built-in auth.

Session management uses `@supabase/ssr`, which handles the Supabase auth token as an HTTP-only cookie and is the recommended approach for Next.js App Router. A proxy middleware (`src/proxy.ts`) runs on every request to refresh the session using `supabase.auth.getClaims()`, which is the JWT-verified approach to session validation that avoids an extra network round-trip to Supabase Auth servers on every middleware invocation.

On protected server actions, `getVerifiedUserData()` calls `supabase.auth.getUser()`, which performs a full server-side verification of the session. This is used instead of `getClaims()` in server actions to guarantee the token is still valid at the time of the mutation, not just at the time of the request.

On sign-out, `clearAuthCookies()` is called unconditionally regardless of if `supabase.auth.signOut()` fails to prevent auto-authentication from a stale cookie.

### Student Dashboard

The dashboard renders a list of the student's consultations, a stats panel (total, upcoming, pending, complete, incomplete), a search input, and a status filter.

**Infinite scroll pagination** is implemented using the `IntersectionObserver` API via a `lastItemRef` callback ref attached to the last consultation card. When it enters the viewport, the next page is fetched and appended to the list. This avoids traditional page controls and provides a seamless UX.

**Search** is debounced via a `useDebounce` hook before triggering a re-fetch, preventing unnecessary server action calls on every keystroke.

**State management** is handled by the `useConsultations` custom hook, which encapsulates all list state (items, pagination, loading, error), stats state, and the IntersectionObserver lifecycle. This keeps the dashboard component itself focused purely on rendering.

When a student marks a consultation complete or incomplete, the stats panel is immediately refreshed alongside the list to keep counts in sync without a full page reload.

### Consultation Booking

The booking form uses React Hook Form with a Zod schema resolver (`consultationBookingFormSchema`) for client-side validation. Fields collected: reason for consultation and scheduled datetime. First name and last name are sourced from the authenticated user's metadata captured at sign-up and stored on the consultation row at insertion time rather than joined at query time. This ensures the record is self-contained and not affected by future profile changes.

### Database Design

A single migration (`001_create_consultations_table.sql`) defines the full schema:

**`consultations` table** stores the core record. `is_completed` is nullable boolean (not a status enum) because the status is a derived concept:

| `is_completed` | `scheduled_at` | Derived status |
| -------------- | -------------- | -------------- |
| `true`         | any            | `complete`     |
| `false`        | any            | `incomplete`   |
| `null`         | future         | `upcoming`     |
| `null`         | past           | `pending`      |

**`get_consultation_status()`** - a PL/pgSQL function encapsulates this derivation logic in the database, making it the single source of truth.

**`consultations_with_status`** - a database view that projects all consultation columns plus the derived `status` field. All dashboard queries are run against this view, keeping SQL clean and avoiding repeated CASE expressions in application code.

**`get_consultation_counts_by_status()`** - a PL/pgSQL aggregate function that returns a single row of counts (total, complete, incomplete, upcoming, pending) for a given user. This collapses what would otherwise be five separate queries into one RPC call.

Indexes are defined on `user_id` for all user-based queries and `scheduled_at` for default table ordering for ordering.

### Security

Security is applied at multiple layers:

- **Row-Level Security (RLS)**: All three DML operations (SELECT, INSERT, UPDATE) on `consultations` are protected by RLS policies that enforce `user_id = auth.uid()`. There is no DELETE policy, which prevents data loss from client-side bugs or malicious calls.
- **Server-side user verification**: Every server action calls `getVerifiedUserData()`, which makes a verified auth check via the Supabase Auth server. Mutations are always scoped to the verified `userId`, so a client cannot forge a different `user_id` in the request body.
- **No sensitive logic on the client**: All Supabase queries run in server actions. The browser never holds a service role key.
- **Auth cookie hygiene**: Supabase auth cookies (`sb-*`) are explicitly cleared on sign-out via `clearAuthCookies()`, even if the Supabase sign-out call fails, preventing a stale token from auto-authenticating the next session.
- **Redirect error propagation**: A `rethrowRedirectError()` utility ensures that Next.js redirect errors thrown inside server actions (e.g., from `getVerifiedUserData()`) are not swallowed by `catch` blocks, preserving the intended navigation behaviour.
- **Account existence not disclosed on sign-up**: When Supabase returns a `422 user_already_exists` error during registration, the sign-up server action intentionally treats it as a success and displays the registration success page. This prevents account enumeration where an unauthenticated user from determining whether a given email address has an existing account.

### Testing

Unit tests are written with **Vitest** and co-located under `test/unit/`, mirroring the `src/` structure:

| Test file                                   | Coverage                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `schemas/form-schema.test.unit.ts`          | Sign-up, sign-in, and booking form Zod schemas                               |
| `utils/error-utils.test.unit.ts`            | `rethrowRedirectError` utility                                               |
| `actions/sign-in.test.unit.ts`              | `SignIn` server action                                                       |
| `actions/sign-up.test.unit.ts`              | `signUp` server action                                                       |
| `actions/dashboard.test.unit.ts`            | `signOut`, `getConsultationList`, `markConsultation`, `getConsultationStats` |
| `actions/consultation-booking.test.unit.ts` | `createConsultation` server action                                           |
| `lib/supabase-server.test.unit.ts`          | `clearAuthCookies`, `getVerifiedUserData`                                    |

All external dependencies (Supabase client, Next.js `cookies`, `redirect`) are mocked. Supabase's query builder chain is mocked via a thenable builder pattern that supports both chained calls and direct `await`.

E2E tests are written with **Cypress**.

### Assumptions and Considerations

1. **Consultation status is derived, not stored.** An enum column would require a migration every time the status definition changes. Deriving it from `is_completed` and `scheduled_at` in a PL/pgSQL function keeps the schema stable and the logic in one place.

2. **Consultations can only be marked complete or incomplete after their scheduled time has passed.** The `upcoming` status is intentionally read-only. Actioning a future consultation before it occurs is semantically incorrect and would immediately produce a misleading record. The mark complete/incomplete action is restricted to past consultations to preserve record integrity.

3. **First and last name fields in the booking form are pre-filled from the user's account and locked.** Since the person booking and the person attending are always the same authenticated student, these fields are sourced from sign-up metadata and made read-only. The values are stored directly on the `consultations` row rather than joined from `auth.users` at query time, so a future name change on the account cannot alter historical records.

4. **A confirmation prompt is shown before marking a consultation complete or incomplete.** Because this action updates persisted state, an intermediate confirmation step guards against accidental or premature changes, particularly given that the UI updates are reflected immediately after confirmation.

5. **Scheduled datetimes for new bookings are restricted to a future window of up to one year from today.** Allowing a past datetime would produce a `pending` consultation the moment it is created, which conflicts with the booking intent. The one-year upper bound prevents unreasonably far-future entries.

6. **All user-facing strings, such as labels, error messages, validation copy, and status names, are centralised in `src/constants/`.** Keeping every magic string in a single location establishes a source of truth, eliminates scattered literals, and lays the groundwork for future internationalisation (i18n) without requiring a codebase-wide search-and-replace.

7. **Passwords are required to be between 8 and 64 characters and meet complexity requirements (uppercase, lowercase, digit, special character).** The length range aligns with NIST SP 800-63B guidance, which treats length as the primary strength factor. The 64-character upper bound follows bcrypt convention (bcrypt truncates at 72 bytes; 64 characters provides a safe margin).

8. **Form validation is enforced at two layers using a shared Zod schema.** The same schema is used as the React Hook Form resolver (client-side, for immediate user feedback) and as the canonical definition of valid input. This ensures client and server validation cannot drift apart, and the schema serves as living documentation of the expected input limitations.

9. **The authenticated user's ID is never sent from the client in request payloads.** All server actions derive the acting user's identity by calling `getVerifiedUserData()` server-side. This eliminates a class of spoofing attacks where a malicious client substitutes another user's ID in the request body. The `userId` is also never exposed in client-accessible state.

10. **`supabase.auth.getUser()` is used for verification within server actions rather than `getClaims()`.** `getClaims()` reads the JWT locally without a network round-trip and is appropriate for the proxy middleware where performance is critical on every request. For server actions that perform mutations, `getUser()` is preferred as it validates the token against Supabase's Auth server, confirming the session has not been revoked even if the JWT has not yet expired. Note: while Supabase uses asymmetric signing by default in production, the local development environment uses symmetric keys, `getUser()` behaves consistently and correctly across both.

11. **The consultation list uses infinite scroll rather than traditional page-based pagination.** A sentinel element (the last card in the list) is observed via the `IntersectionObserver` API; when it enters the viewport, the next page is fetched and appended. This provides a seamless, mobile-friendly experience without requiring explicit page controls.

12. **Signing out in one tab signs out all other open tabs in the same browser.** A Supabase Realtime broadcast is used to detect sign-out events across tabs within the same browser session. When received, a redirect to the sign-in page is triggered for every open tab, ensuring no tab remains in an authenticated state after sign-out.

13. **No consultation deletion.** There is intentionally no DELETE RLS policy. Consultations are a factual record of what was booked.

14. **The application is student-facing only.** No admin or tutor interface is in scope for this project.

---

## Future Improvements

- **Multi-factor authentication (MFA).** Supabase supports TOTP-based MFA out of the box. Adding a second factor (authenticator app or SMS) would significantly enhance account security.

- **Real-time consultation updates via Supabase Realtime.** Rather than requiring a manual refresh, the dashboard could subscribe to `INSERT` and `UPDATE` events on the `consultations` table and reflect changes live.

- **Rate limiting on authentication endpoints.** Sign-in and sign-up server actions are currently unthrottled beyond Supabase's built-in limits. Adding application-level rate limiting (e.g., via an edge middleware or Supabase Edge Functions) would provide an additional layer of protection against brute-force attacks.

- **Consultation cancellation.** Currently there is no DELETE RLS policy and no cancellation workflow. A soft-delete approach such as an `is_cancelled` flag and a corresponding status would allow students to retract bookings without permanently erasing the record.

---

## Deployed Version

[Project URL](https://mini-mp25wqbh8-andylu0129s-projects.vercel.app/)
