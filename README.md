# FixitHub

Full-stack platform to find teammates for hackathons, projects, and events based on skills, roles, goals, and availability.

**Stack:** Next.js 14 · TypeScript · Prisma · PostgreSQL · NextAuth · Socket.io · Zod · Tailwind CSS · Framer Motion · SWR

## Features

* Authentication & user profiles
* Skills, roles & availability
* Search, filters & match scoring
* Connection requests
* Teams & team chat
* Events
* Realtime 1:1 & group messaging
* Typing indicators & presence
* Notifications
* Reporting & moderation

## Run

```bash
git clone https://www.github.com/samoff04/FixItHub.git
cd FixItHub
npm install
cp .env.example .env
```

## Project Structure

```text
FixItHub/
├── server.ts
├── prisma/
└── src/
    ├── middleware.ts
    ├── lib/
    ├── types/
    ├── hooks/
    ├── components/
    └── app/
        ├── login/
        ├── register/
        ├── dashboard/
        ├── discover/
        ├── profile/
        ├── teams/
        ├── events/
        ├── messages/
        ├── notifications/
        ├── settings/
        ├── admin/
        └── api/
```

## Author

Samarth Varshney