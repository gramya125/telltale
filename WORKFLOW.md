# Deployment Workflow

## 1. Push to GitHub

```bash
# From the project root (D:\TELLTALE PROJECT)
git init
git add .
git commit -m "initial commit"

# Create a repo on github.com, then:
git remote add origin https://github.com/<your-username>/telltale.git
git branch -M main
git push -u origin main
```

> The `.gitignore` at the root excludes `node_modules`, `.next`, `.env.local`, Python caches, and IDE files automatically.

---

## 2. Deploy to Vercel

### Option A — Vercel dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `telltale` repository
4. Set **Root Directory** to `telltale` (important — the Next.js app lives here, not the repo root)
5. Framework will be auto-detected as **Next.js**
6. Add all environment variables from the table below
7. Click **Deploy**

### Option B — Vercel CLI

```bash
npm i -g vercel
cd telltale
vercel --prod
```

---

## 3. Environment variables on Vercel

Add these in **Project Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Your Vercel deployment URL e.g. `https://telltale.vercel.app` |
| `NEXTAUTH_SECRET` | Any long random string (use `openssl rand -base64 32`) |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) |
| `GROQ_API_URL` | `https://api.groq.com/openai/v1` |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `GITHUB_CLIENT_ID` | GitHub OAuth (optional) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional) |
| `ML_SERVICE_URL` | URL of your deployed ML service (optional) |

---

## 4. MongoDB Atlas setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` in Network Access (allows Vercel's dynamic IPs)
4. Copy the connection string into `MONGODB_URI`

---

## 5. Seed the database

After deploying, hit this endpoint once to seed initial book data:

```
POST https://your-app.vercel.app/api/seed
```

Or locally:
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## 6. Updating the deployment

Every push to `main` triggers an automatic redeploy on Vercel.

```bash
git add .
git commit -m "your change"
git push
```

---

## 7. ML service (optional)

The ML recommendation engine is a separate Python service. You can deploy it to:

- **Railway** — connect the `ml/` folder, set start command to `python main.py`
- **Render** — free tier works fine for low traffic
- **Fly.io** — good for always-on services

Once deployed, set `ML_SERVICE_URL` in Vercel to point to it.
