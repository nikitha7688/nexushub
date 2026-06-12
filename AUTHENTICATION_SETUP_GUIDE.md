# Authentication Setup Guide - NexusHub

This guide provides step-by-step instructions to configure:
1. **Cloudflare Services** (R2 Storage, Turnstile, Email Workers)
2. **Firebase Authentication** (Google OAuth, Email verification)
3. **Email Service** (OTP delivery via Resend/SendGrid)

---

## Part 1: Cloudflare Setup

### 1.1 Cloudflare R2 Storage (File Uploads)

R2 is Cloudflare's S3-compatible object storage for handling file uploads.

#### Step 1: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com) and sign up
2. Verify your email address

#### Step 2: Get Account ID
1. Log into Cloudflare Dashboard
2. In the right sidebar, you'll see your **Account ID**
3. Copy it - this is your `R2_ACCOUNT_ID`

#### Step 3: Create R2 Bucket
1. Go to **R2 Object Storage** in the left sidebar
2. Click **Create bucket**
3. Enter bucket name (e.g., `nexushub-files`)
4. Choose a location (automatic or specific region)
5. Click **Create bucket**
6. This name is your `R2_BUCKET`

#### Step 4: Generate API Tokens
1. Go to **R2 Object Storage** → **Manage R2 API Tokens**
2. Click **Create API token**
3. Select permissions:
   - **Object Read & Write** (for your bucket)
4. Click **Create API token**
5. Copy the credentials shown:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
   - ⚠️ Save these immediately - they won't be shown again

#### Step 5: Configure Public Access (Optional)
1. Go to your bucket → **Settings**
2. Under **Public access**, click **Allow Access**
3. Copy the **Public bucket URL** → `R2_PUBLIC_URL`
4. Or set up a custom domain under **Custom domains**

#### Step 6: Update .env
```bash
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET=nexushub-files
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

---

### 1.2 Cloudflare Turnstile (Bot Protection)

Turnstile is Cloudflare's CAPTCHA alternative for protecting login/signup forms.

#### Step 1: Create Turnstile Site
1. Go to **Turnstile** in Cloudflare Dashboard
2. Click **Add site**
3. Enter:
   - **Site name**: NexusHub
   - **Domain**: `localhost` (for dev) or your production domain
   - **Widget mode**: Managed (recommended)
4. Click **Create**

#### Step 2: Get Keys
1. Copy the **Site Key** (public) → Add to frontend
2. Copy the **Secret Key** (private) → Add to backend .env

#### Step 3: Update .env
```bash
TURNSTILE_SECRET_KEY=your_secret_key_here
```

#### Step 4: Frontend Integration (Optional)
Add to your login/signup forms:
```typescript
// Install: npm install @marsidev/react-turnstile

import { Turnstile } from '@marsidev/react-turnstile'

<Turnstile
  siteKey="your_site_key_here"
  onSuccess={(token) => setTurnstileToken(token)}
/>
```

#### Step 5: Backend Verification
Add verification middleware:
```typescript
// server/src/middleware/turnstile.ts
import { env } from '../config/env.js'

export async function verifyTurnstile(token: string, ip: string) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  })

  const data = await response.json()
  return data.success === true
}
```

---

### 1.3 Cloudflare Email Workers (Email Sending)

Use Cloudflare Email Routing to send emails (alternative to Resend/SendGrid).

#### Step 1: Enable Email Routing
1. Add your domain to Cloudflare (or use an existing one)
2. Go to **Email** → **Email Routing**
3. Click **Get started**
4. Verify DNS records (automatic)

#### Step 2: Create Email Worker
1. Go to **Workers & Pages**
2. Click **Create application** → **Create Worker**
3. Name it `email-sender`
4. Replace code with email worker script (see Cloudflare docs)

#### Step 3: Configure Email Addresses
1. Under Email Routing → **Destination addresses**
2. Add your email for receiving notifications
3. Create **Custom addresses** for sending (e.g., `noreply@yourdomain.com`)

---

## Part 2: Firebase Authentication Setup

Firebase provides managed OAuth and email authentication.

### 2.1 Create Firebase Project

#### Step 1: Go to Firebase Console
1. Visit [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter project name: `NexusHub`
4. Disable Google Analytics (or enable if needed)
5. Click **Create project**

#### Step 2: Register Web App
1. In project overview, click **Web** icon (`</>`)
2. Enter app nickname: `NexusHub Web`
3. Check **Also set up Firebase Hosting** (optional)
4. Click **Register app**
5. Copy the Firebase config object

---

### 2.2 Enable Authentication Providers

#### Step 1: Enable Google Sign-In
1. Go to **Authentication** → **Sign-in method**
2. Click **Google** → **Enable**
3. Enter project support email
4. Click **Save**
5. Copy **Web Client ID** and **Web Client Secret**

#### Step 2: Enable Email/Password
1. Click **Email/Password** → **Enable**
2. Enable **Email/Password** (first toggle)
3. Enable **Email link (passwordless sign-in)** if needed
4. Click **Save**

#### Step 3: Enable Microsoft (Optional)
1. Click **Microsoft** → **Enable**
2. You'll need Microsoft App credentials (from Azure Portal)
3. Enter **Application (client) ID** and **Secret**
4. Click **Save**

---

### 2.3 Configure Authorized Domains

#### Step 1: Add Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `yourdomain.com` (production)
3. Click **Add domain**

---

### 2.4 Install Firebase SDK

#### Step 1: Install Dependencies
```bash
# Frontend (React/Next.js)
npm install firebase

# Backend (Node.js - Admin SDK)
cd server
npm install firebase-admin
```

#### Step 2: Initialize Firebase (Frontend)
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your_app_id"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

#### Step 3: Initialize Firebase Admin (Backend)
```typescript
// server/src/config/firebase.ts
import admin from 'firebase-admin'

// Download service account key from Firebase Console:
// Project Settings → Service Accounts → Generate new private key
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
})

export const auth = admin.auth()
```

#### Step 4: Update .env
```bash
# Backend .env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
```

---

### 2.5 Implement Google Sign-In

#### Frontend Implementation
```typescript
// src/components/auth/social-auth.tsx
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

export function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      // Send token to your backend
      const response = await fetch('http://localhost:4000/api/auth/firebase/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const { accessToken, refreshToken } = await response.json()
      // Store tokens and redirect

    } catch (error) {
      console.error('Google sign-in failed:', error)
    }
  }

  return <button onClick={handleGoogleSignIn}>Sign in with Google</button>
}
```

#### Backend Verification
```typescript
// server/src/controllers/auth.controller.ts
import { auth } from '../config/firebase.js'

export const verifyFirebaseToken: RequestHandler = async (req, res) => {
  const { idToken } = req.body

  try {
    // Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(idToken)
    const { uid, email, email_verified, name, picture } = decodedToken

    // Find or create user in your database
    let user = await User.findOne({ email: email?.toLowerCase() })

    if (!user) {
      // Create new user
      user = await User.create({
        email: email?.toLowerCase(),
        name: name || email,
        emailVerified: email_verified || false,
        avatarUrl: picture || '',
        oauthProviders: { google: uid },
      })
    }

    // Issue your app's tokens
    const tokens = await issueTokenPair(user, req)
    res.json(tokens)

  } catch (error) {
    throw new HttpError(401, 'Invalid Firebase token')
  }
}
```

---

## Part 3: Email Service Setup (OTP Delivery)

Currently, emails are logged to console. Let's integrate a real email service.

### Option A: Resend (Recommended)

#### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub/Google
3. Verify your email

#### Step 2: Get API Key
1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name it `NexusHub Production`
4. Copy the key → `RESEND_API_KEY`

#### Step 3: Add Domain (Production)
1. Go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Add the DNS records shown (SPF, DKIM, MX)
4. Wait for verification (~1 hour)

For development, use the default `onboarding@resend.dev` sender.

#### Step 4: Install SDK
```bash
cd server
npm install resend
```

#### Step 5: Update Email Service
```typescript
// server/src/services/email.service.ts
import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

export interface Email {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(email: Email): Promise<void> {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM || 'NexusHub <onboarding@resend.dev>',
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html || email.text,
    })
    console.log(`📧 Email sent to ${email.to}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendOtpEmail(to: string, code: string, purpose: string): Promise<void> {
  const subjectByPurpose: Record<string, string> = {
    verify_email: 'Verify your NexusHub email',
    mfa_login: 'Your NexusHub sign-in code',
    password_reset: 'Reset your NexusHub password',
  }

  const subject = subjectByPurpose[purpose] ?? 'NexusHub verification code'

  await sendEmail({
    to,
    subject,
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code expires in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  })
}
```

#### Step 6: Update .env
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=NexusHub <noreply@yourdomain.com>
```

---

### Option B: SendGrid

#### Step 1: Create Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up (free tier: 100 emails/day)
3. Verify your email

#### Step 2: Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Select **Restricted Access**
4. Enable **Mail Send** permission
5. Click **Create & View**
6. Copy the key → `SENDGRID_API_KEY`

#### Step 3: Verify Sender
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details
4. Verify the email sent to you

#### Step 4: Install SDK
```bash
cd server
npm install @sendgrid/mail
```

#### Step 5: Update Email Service
```typescript
// server/src/services/email.service.ts
import sgMail from '@sendgrid/mail'
import { env } from '../config/env.js'

sgMail.setApiKey(env.SENDGRID_API_KEY!)

export async function sendEmail(email: Email): Promise<void> {
  try {
    await sgMail.send({
      to: email.to,
      from: env.EMAIL_FROM || 'noreply@yourdomain.com',
      subject: email.subject,
      text: email.text,
      html: email.html || email.text,
    })
    console.log(`📧 Email sent to ${email.to}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
```

#### Step 6: Update .env
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

### Option C: AWS SES (Production Scale)

#### Step 1: AWS Setup
1. Create AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Go to **SES** (Simple Email Service)
3. Request production access (if needed)

#### Step 2: Verify Email/Domain
1. Go to **Verified identities**
2. Click **Create identity**
3. Choose **Email address** (for testing) or **Domain** (for production)
4. Complete verification

#### Step 3: Create IAM User
1. Go to **IAM** → **Users** → **Add user**
2. Username: `nexushub-ses`
3. Attach policy: **AmazonSESFullAccess**
4. Create access key → Copy **Access Key ID** and **Secret Access Key**

#### Step 4: Install SDK
```bash
cd server
npm install @aws-sdk/client-ses
```

#### Step 5: Update Email Service
```typescript
// server/src/services/email.service.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { env } from '../config/env.js'

const sesClient = new SESClient({
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function sendEmail(email: Email): Promise<void> {
  const command = new SendEmailCommand({
    Source: env.EMAIL_FROM || 'noreply@yourdomain.com',
    Destination: { ToAddresses: [email.to] },
    Message: {
      Subject: { Data: email.subject },
      Body: {
        Text: { Data: email.text },
        Html: { Data: email.html || email.text },
      },
    },
  })

  try {
    await sesClient.send(command)
    console.log(`📧 Email sent to ${email.to}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
```

#### Step 6: Update .env
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

## Part 4: Update Environment Configuration

### Step 1: Update server/src/config/env.ts

Add new environment variables to the schema:

```typescript
const schema = z.object({
  // ... existing fields ...

  // Resend (choose one email provider)
  RESEND_API_KEY: z.string().optional(),

  // SendGrid (alternative)
  SENDGRID_API_KEY: z.string().optional(),

  // AWS SES (alternative)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Email sender
  EMAIL_FROM: z.string().default("NexusHub <noreply@localhost>"),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // ... existing R2 fields ...
})
```

---

## Part 5: Testing

### Test Email OTP
```bash
# Start server
cd server
npm run dev

# Test signup endpoint (watch console for OTP)
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "workspaceName": "Test Workspace"
  }'

# Check your email inbox for the OTP
# Or check server console logs if using stub
```

### Test Google OAuth (Firebase)
1. Open your app at `http://localhost:5174/login`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Verify token is sent to backend
5. Check if user is created in database

### Test Cloudflare R2
1. Upload a file through your app
2. Verify it appears in R2 bucket
3. Access file via public URL

---

## Troubleshooting

### Email not sending
- **Resend**: Check API key is valid, domain is verified
- **SendGrid**: Verify sender email, check daily limit
- **SES**: Check AWS SES is out of sandbox mode

### Firebase OAuth failing
- Verify `authDomain` matches in Firebase console
- Check redirect URIs are whitelisted
- Ensure Firebase config is correct

### Cloudflare R2 upload failing
- Verify API token has write permissions
- Check bucket name is correct
- Ensure CORS is configured if uploading from browser

### Google OAuth "redirect_uri_mismatch"
- Add exact redirect URI to Google Console
- Format: `http://localhost:4000/api/auth/oauth/google/callback`

---

## Security Checklist

- [ ] All API keys are in `.env` (not committed to git)
- [ ] `.env` is added to `.gitignore`
- [ ] Production uses strong secrets (not dev defaults)
- [ ] Email templates don't expose sensitive data
- [ ] OAuth redirect URIs are whitelisted
- [ ] Cloudflare R2 bucket has appropriate permissions
- [ ] Firebase service account key is kept secure
- [ ] Rate limiting is enabled on auth endpoints
- [ ] CORS is configured correctly

---

## Production Deployment

### Before deploying:

1. **Replace all dev secrets** in production `.env`:
   ```bash
   JWT_SECRET=<strong-random-64-char-string>
   JWT_REFRESH_SECRET=<strong-random-64-char-string>
   OAUTH_STATE_SECRET=<strong-random-32-char-string>
   ```

2. **Update URLs**:
   ```bash
   PUBLIC_API_URL=https://api.yourdomain.com
   OAUTH_SUCCESS_REDIRECT=https://yourdomain.com/auth/oauth/callback
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Re-register OAuth redirect URIs** with Google/Microsoft using production URLs

4. **Set up domain for email** (Resend/SendGrid/SES)

5. **Configure Cloudflare** for production domain

6. **Enable Firebase production mode**

---

## Summary

You now have:
- ✅ Cloudflare R2 for file storage
- ✅ Cloudflare Turnstile for bot protection (optional)
- ✅ Firebase Authentication for OAuth providers
- ✅ Email service (Resend/SendGrid/SES) for OTP delivery
- ✅ Secure environment configuration

All authentication flows (email OTP, Google OAuth, Microsoft OAuth) are now fully functional.