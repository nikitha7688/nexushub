# NexusHub — Integrations Setup

End-to-end setup notes for the two external platforms the app depends on:

1. **Firebase Authentication** — replaces the in-house JWT/OAuth (Google + Microsoft + email/password) with Firebase as the single identity provider.
2. **Cloudflare** — R2 (file storage), Workers (edge functions), CDN, Access (private routes), Analytics.

> **Status:** this document is the *plan*. No code changes have been made yet. Each section ends with a "Code changes" subsection that lists exactly what to edit when you're ready to wire it up.

---

## 1. Firebase Authentication

### What it replaces

| Today (in-house) | After Firebase |
|---|---|
| `POST /api/auth/signup` + `verify-email` (OTP via console-stub email) | Firebase Web SDK `createUserWithEmailAndPassword` + Firebase sends the verification email |
| `POST /api/auth/login` + `mfa` | `signInWithEmailAndPassword`; MFA via Firebase MFA enrollment |
| `GET /api/auth/oauth/google` | `signInWithPopup(googleProvider)` (client-side) |
| `GET /api/auth/oauth/microsoft` | `signInWithPopup(microsoftProvider)` (client-side, `OAuthProvider("microsoft.com")`) |
| Refresh tokens table (`refreshtokens`) | Firebase refresh handled by the SDK |
| `requireAuth` middleware (verifies our HS256 JWT) | `requireAuth` verifies Firebase ID token via Firebase Admin SDK |
| `users.passwordHash`, `users.oauthProviders` | Dead — drop |

App data (`workspaceId`, `role`, `department`, etc.) **stays in Mongo**. Firebase owns identity only.

### Step-by-step

#### 1.1 Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it `nexushub` (or similar) → disable Analytics for now.
2. **Build → Authentication → Get started.**
3. **Sign-in method** tab — enable:
   - **Email/Password** (toggle on, leave "Email link" off unless you want passwordless).
   - **Google** — pick a project support email.
   - **Microsoft** — needs an Azure app registration (see 1.2).

#### 1.2 Microsoft provider (Azure app registration)

1. https://entra.microsoft.com → **App registrations → New registration**.
2. Name: `NexusHub Auth`. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**.
3. Redirect URI (Web): `https://<your-firebase-project>.firebaseapp.com/__/auth/handler` — Firebase shows the exact value on the provider config screen.
4. **Certificates & secrets → New client secret.** Save the **value** (not the ID).
5. Back in Firebase **Microsoft provider** form: paste `Application (client) ID` + the secret.

> Same redirect URI replaces the one currently registered in `server/.env.example`. Once Firebase is in, drop the per-provider entries from `.env`.

#### 1.3 Register the web app

1. Firebase Console → **Project Settings → General → Your apps → Add app → Web (`</>`).**
2. Nickname: `nexushub-web`. Skip Firebase Hosting.
3. Copy the config object — these become public env vars (safe in client bundle):

```env
# nexushub/.env.local (frontend, Next.js)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### 1.4 Create a service account for the backend

1. Firebase Console → **Project Settings → Service accounts → Generate new private key.**
2. Download the JSON file. **Do not commit it.**
3. Backend env — pick **one** of these formats:

```env
# Option A: path to the JSON file (simpler in local dev)
GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=nexushub

# Option B: inline the JSON (better for prod / containers — paste the entire JSON as a single line)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"nexushub",...}
```

#### 1.5 Authorized domains

Firebase Console → **Authentication → Settings → Authorized domains** — add `localhost` (already there) and your prod domain.

### Code changes

**Frontend (`/`, Next.js):**

```bash
npm i firebase
```

- New file `src/lib/firebase.ts`:
  ```ts
  import { initializeApp, getApps } from "firebase/app";
  import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
  const config = { /* paste NEXT_PUBLIC_* values */ };
  export const firebaseApp = getApps()[0] ?? initializeApp(config);
  export const auth = getAuth(firebaseApp);
  export const googleProvider = new GoogleAuthProvider();
  export const microsoftProvider = new OAuthProvider("microsoft.com");
  microsoftProvider.setCustomParameters({ tenant: "common" });
  ```
- Replace handlers in `src/app/(auth)/login/page.tsx`:
  - Email/password button → `signInWithEmailAndPassword(auth, email, password)`
  - Google button → `signInWithPopup(auth, googleProvider)`
  - Microsoft button → `signInWithPopup(auth, microsoftProvider)`
- After success, call `user.getIdToken()` → send as `Authorization: Bearer <idToken>` for every API request. Use an Axios/fetch interceptor so the token refreshes on 401.
- Drop these pages — Firebase owns them now:
  - `src/app/(auth)/verify-email/`
  - `src/app/(auth)/forgot-password/`
  - (or thin them out to call `sendEmailVerification` / `sendPasswordResetEmail`)

**Backend (`/server`):**

```bash
cd server && npm i firebase-admin
```

- New file `server/src/services/firebase-admin.service.ts`:
  ```ts
  import admin from "firebase-admin";
  import { env } from "../config/env.js";
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? admin.credential.cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON))
        : admin.credential.applicationDefault(),
    });
  }
  export const firebaseAuth = admin.auth();
  ```
- Rewrite `server/src/middleware/require-auth.ts` to verify a Firebase ID token:
  ```ts
  const decoded = await firebaseAuth.verifyIdToken(token);
  // decoded.uid = Firebase user id; decoded.email = email
  ```
- On first request from a Firebase uid, **provision** a Mongo `User` row (`firebaseUid`, default `role: Admin`, fresh `Workspace`) — mirrors what `oauthCallback` does today. Lift that logic out of `auth.controller.ts` into a `provisionUserFromFirebase(decodedToken)` helper.
- Update `User` model:
  - Add `firebaseUid: { type: String, unique: true, sparse: true, index: true }`.
  - Drop `passwordHash`, `oauthProviders`, `mfaEnabled` (Firebase owns these).
- Delete (or comment out) every handler in `auth.controller.ts` except `getMe`. Remove their routes from `auth.routes.ts`.
- Delete `services/token.service.ts`, `services/password.service.ts`, `services/otp.service.ts`, `services/oauth.service.ts`, `models/refresh-token.model.ts`, `models/one-time-code.model.ts`.
- Remove from `server/.env.example`: `JWT_*`, `*_CLIENT_ID`, `*_CLIENT_SECRET`, `MICROSOFT_TENANT`, `OAUTH_*`.
- Add to `server/src/config/env.ts`:
  ```ts
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  ```

### Verification checklist

- [ ] Web app boots, login page shows Firebase popup on Google click.
- [ ] After signing in, `firebase.auth().currentUser.getIdToken()` returns a JWT.
- [ ] `curl -H "Authorization: Bearer <idToken>" http://localhost:4000/api/users` returns `200`.
- [ ] First-time login provisions a Mongo `User` + `Workspace` (`db.users.findOne({firebaseUid})` exists).
- [ ] Email/password signup triggers a verification email from Firebase (check inbox or use the test phone in Console).
- [ ] Signing out clears `localStorage`/cookies + redirects to `/login`.

### Migration of existing users

If there are real users in Mongo already:

1. Export `email` + `name` from `db.users.find({})`.
2. Use Firebase **Auth → Users → Import users** (CSV) — Firebase generates temporary passwords; users reset via the email link.
3. Match imported uids back into Mongo: write a one-shot script that fills `firebaseUid` on each `User` by email.

---

## 2. Cloudflare

The tracker has five Cloudflare items: **R2, Workers, CDN, Access, Analytics**. They split cleanly into "do this now" vs "later" — laid out below.

### 2.1 R2 — Object storage (file uploads) — *do this with Phase 2 item #7*

R2 is S3-compatible, no egress fees. Backs the file upload API.

#### Console setup

1. Cloudflare dashboard → **R2 → Create bucket** → name `nexushub-uploads` (or per-env: `nexushub-uploads-dev`, `nexushub-uploads-prod`). Pick the closest region.
2. **Manage R2 API Tokens → Create API token**:
   - Permissions: **Object Read & Write**.
   - Specify bucket: select the bucket(s) above.
   - TTL: forever.
   - Save **Access Key ID** + **Secret Access Key**.
3. Note the **Account ID** (top of the R2 page).
4. Optional public access: **Settings → Public access → Allow access** + map a custom domain (`files.yourapp.com`). Without this, files are private; you serve them via signed URLs (preferred).

#### Env vars (already stubbed in `server/.env.example`)

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=nexushub-uploads
R2_PUBLIC_URL=https://files.yourapp.com   # optional, only if you set a custom domain
```

#### Code changes (when File Upload APIs ship)

```bash
cd server && npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- New file `server/src/services/r2.service.ts`:
  ```ts
  import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { env } from "../config/env.js";

  export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });

  export const presignUpload = (key: string, contentType: string) =>
    getSignedUrl(r2, new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType }), { expiresIn: 300 });

  export const presignDownload = (key: string) =>
    getSignedUrl(r2, new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }), { expiresIn: 300 });
  ```
- API surface:
  - `POST /api/files/upload-url` → returns `{ key, uploadUrl }`. Client `PUT`s the file directly to R2 (no proxy through the API).
  - `POST /api/files` → save `{ key, name, size, ownerId, workspaceId }` row.
  - `GET /api/files/:id/download-url` → presigned `GET` URL.

### 2.2 Workers + CDN — *later, only when you have a Cloudflare-fronted domain*

- Today, the Next.js app + Express API run side by side, no Cloudflare in front. CDN/Workers light up once you put the app behind Cloudflare.
- Steps when you're ready:
  1. Move DNS to Cloudflare (NS records).
  2. Proxy (orange-cloud) the records — automatic CDN caching for static assets.
  3. If you want edge compute (image resizing, geo routing, redirects), `npm i -g wrangler` and scaffold a Worker.
- **Skip until needed.** No code changes today.

### 2.3 Cloudflare Access — *only if you want a private staging environment*

- Use case: lock `staging.yourapp.com` behind your team's email / Google Workspace.
- Setup: Cloudflare Zero Trust → **Access → Applications → Add an application → Self-hosted** → identity provider (Google / Microsoft / one-time PIN).
- No code changes — purely DNS / proxy.

### 2.4 Analytics

- **Web Analytics** (free, cookieless): Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → paste the snippet into `src/app/layout.tsx`.
- **Workers Analytics Engine** if/when you write Workers — emit metrics from a Worker, query with SQL.

### Verification checklist

- [ ] R2 bucket exists, API token created, env vars set in `server/.env`.
- [ ] `npm run dev` (server) — no env validation errors.
- [ ] Test upload: `curl -X POST http://localhost:4000/api/files/upload-url -H "Authorization: Bearer …"` returns a signed URL.
- [ ] `curl -X PUT --data-binary @some-file.png "<signed url>"` returns `200`.
- [ ] File is visible in the R2 bucket browser.

---

## Cross-cutting: secrets hygiene

- `.env`, `.env.local`, `serviceAccountKey.json` — all in `.gitignore`. Verify with `git check-ignore -v <path>` before adding any secret.
- In production, use a secrets manager (Vercel Env, Cloudflare Secrets, Doppler, etc.), not a `.env` file.
- The two **public** Firebase keys (`apiKey`, `authDomain`) are safe in the client bundle. Everything else (Admin SDK service account, R2 secret) is **server-only**.