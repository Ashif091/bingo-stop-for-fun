# Bingo Game - Split Deployment Guide

## Architecture
```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│    Vercel       │  ───────────────→  │    Railway      │
│  (Frontend)     │                    │  (Socket.io)    │
│   Next.js App   │  ←───────────────  │   Backend       │
└─────────────────┘                    └─────────────────┘
```

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your `bingo-stop-for-fun` repository

4. Set these in **Settings → Deploy**:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:socket`

5. Set **Environment Variables**:
   - `ALLOWED_ORIGINS` = `*` (or your Vercel URL later)

6. Deploy and copy your Railway URL (e.g., `https://bingo-xxxxx.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repo

2. Set in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SOCKET_URL` = `https://bingo-xxxxx.up.railway.app`  
     (Replace with your Railway URL from Step 1)

3. Deploy with defaults:
   - Build Command: `npm run build`
   - Output Directory: `.next`

---

## Step 3: Update Railway CORS (Optional)

After Vercel deployment, update Railway env var:
- `ALLOWED_ORIGINS` = `https://your-app.vercel.app`

---

## Local Development

Run both in separate terminals:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:socket
```

Or run combined (original):
```bash
npm run dev:socket
```

---

## Environment Variables Summary

### Vercel (Frontend)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SOCKET_URL` | Your Railway URL |

### Railway (Backend)
| Variable | Value |
|----------|-------|
| `PORT` | `3001` (Railway sets this automatically) |
| `ALLOWED_ORIGINS` | `*` or your Vercel URL |
