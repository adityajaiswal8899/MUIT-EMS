# MUIT Event Management System — Full-Stack Deployment Guide

This guide provides step-by-step instructions to host both the **Frontend** (React + Vite) and **Backend API** (Express + Node.js) on **GitHub** and **Vercel** with a cloud **MongoDB Atlas** database, ensuring all features (Registration, QR Passes, Live Camera Scanner, Certificates) work 100% in production.

---

## Part 1: Push Code to GitHub

Your local git repository has been initialized with the `main` branch, `.gitignore`, and the initial commit.

### Step 1: Create a New GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Enter Repository name: `muit-event-management-system`
3. Set visibility to **Public** or **Private**
4. **Do not** check "Initialize with README", .gitignore, or license (we already have them)
5. Click **Create repository**

### Step 2: Push Local Code to GitHub
Run the following commands in your terminal:

```bash
# Add your GitHub repository as origin remote (replace with your actual GitHub username)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/muit-event-management-system.git

# Push the code to main branch
git push -u origin main
```

---

## Part 2: Cloud Database Setup (MongoDB Atlas)

> [!IMPORTANT]  
> Local MongoDB (`127.0.0.1:27017`) only runs on your local machine. In order for Vercel to allow users to register, log in, view events, and generate QR passes online, you must connect to a cloud MongoDB Atlas database (Free tier).

### Step 1: Create Free MongoDB Atlas Cluster
1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **Free Shared Cluster (M0)** (Select AWS / closest region, e.g. Mumbai `ap-south-1`)
3. **Database Access**:
   - Create a database user (e.g. `muit_admin` and a strong password)
   - Save the username and password!
4. **Network Access**:
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** (Required for Vercel serverless edge functions)
5. **Get Connection String**:
   - Go to Database -> Click **Connect** -> Choose **Drivers (Node.js)**
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/muit_event_db?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

### Step 2: Seed Cloud Database with Demo Events & Accounts
In your local project terminal, run the seed script targeting your cloud MongoDB Atlas URL:

```powershell
# Windows PowerShell:
$env:MONGO_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/muit_event_db?retryWrites=true&w=majority"
cd server
node utils/seed.js
```

This immediately creates the 15 events (including Byte Bash, SIH 2026, MIIF Seed Fund, Sports Day, Tech-Sutra) and demo accounts (`student@muit.edu`, `organizer@muit.edu`, `admin@muit.edu`).

---

## Part 3: Deploy to Vercel (One-Click Monorepo)

The repository already includes `vercel.json` and `api/index.js` configured for seamless full-stack deployment on Vercel.

### Step 1: Import Project into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Under **Import Git Repository**, find your `muit-event-management-system` repo and click **Import**.

### Step 2: Configure Project Settings
- **Project Name**: `muit-event-management-system`
- **Framework Preset**: `Vite` (or `Other`)
- **Root Directory**: `./` (leave default as root)
- **Build Command**: `cd client && npm install && npm run build` (pre-configured in `vercel.json`)
- **Output Directory**: `client/dist` (pre-configured in `vercel.json`)

### Step 3: Add Environment Variables
Expand the **Environment Variables** section in Vercel and add:

| Variable Key | Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.../muit_event_db` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `muit_super_secret_jwt_key_2026_production_grade` | Secret key for signing login JWTs |
| `CLIENT_URL` | `https://<your-project-name>.vercel.app` | Your Vercel frontend URL |
| `NODE_ENV` | `production` | Production mode |

### Step 4: Click Deploy
Click **Deploy**!
Vercel will:
1. Build the Vite client into static assets at `client/dist`
2. Bundle the backend API as a Serverless Function at `/api/index.js`
3. Serve all pages (`/events`, `/dashboard/student`, etc.) with client-side SPA routing
4. Provide your live HTTPS domain (e.g. `https://muit-event-management-system.vercel.app`)

---

## Part 4: Verification Checklist (Sab Option Kaam Kar Rahe Hain)

Once deployed, verify that all features work:

- [ ] **Home Page**: Featured events with uploaded posters (Byte Bash, SIH Hackathon, MIIF Fund, Sports Day, Tech-Sutra)
- [ ] **Event Details**: Click any card -> check duration badge, venue, and "View Official Poster" button
- [ ] **Authentication**: Log in with `student@muit.edu` / `Password123!`
- [ ] **Event Registration**: Register for an open event -> receive instant dynamic QR Pass modal
- [ ] **Organizer Dashboard**: Log in with `organizer@muit.edu` / `Password123!` -> test camera QR Scanner
- [ ] **Certificate Verification**: Check `/verify/MUIT-CERT-2026-PL981` -> verifies credential on live blockchain-style ledger
