# MUIT-EMS

**MUIT Event Management System** — full-stack web app for managing college events: event creation, registrations, QR-code based attendance and reporting.

Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend), deployable on Vercel.

## Features

- Event management (create, update, list, delete)
- Student registration & login with JWT authentication
- QR-code based attendance scanning
- Admin dashboard with attendance analytics
- Certificate generation (PDF)
- Role-based access control (student / faculty / admin)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, JWT |
| Database | MongoDB (local or Atlas) |
| QR / PDF | qrcode.react, html5-qrcode, jsPDF |
| Hosting | Vercel |

## Project Structure

```
.
├── api/            # Vercel serverless functions
├── client/         # React frontend (Vite)
├── server/         # Express backend API
├── database/       # Seed scripts / DB helpers
├── docs/           # Documentation & decks
├── images/         # Static assets
├── vercel.json     # Vercel build + rewrite config
└── package.json    # Root scripts
```

## Getting Started

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/muit_event_db
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

`client/.env`:

```env
VITE_API_URL=/api
```

> Never commit real secrets. `.env*` files are already git-ignored.

### 3. Seed the database (optional)

```bash
npm run seed
```

### 4. Run in development

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step GitHub, MongoDB Atlas and Vercel deployment instructions.

## Current Scope & Future Enhancements

> **Viewport & Device Support:**  
> Our project is currently responsive for desktop and laptop screens. Mobile responsiveness is part of the future enhancement.

### Planned Roadmap Items:
- **Mobile Responsiveness & Progressive Web App (PWA):** Mobile-first layouts, collapsible drawer navigation, and installable mobile PWA for student convenience.
- **Offline Attendance Scanner:** IndexedDB local caching for gate check-ins during weak campus connectivity.
- **Automated Alerts & Reminders:** Automated email and SMS notifications for registered events and schedule updates.
- **Payment Gateway Integration:** Support for online registration fee processing for paid workshops and competitions.

## License

MIT
