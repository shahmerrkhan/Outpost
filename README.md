# Outpost

**Command Center for student-run organizations.**

Outpost is a team management platform built for organizations like hackathon teams, clubs, and student-led initiatives. It combines team coordination, a CRM for outreach, activity tracking, and leaderboards into one place — so founders can manage their org and members can track their own contributions, without juggling five different tools.

Built for [NGN Hacks](https://github.com/) and designed to scale to any small team running sponsor outreach, partnerships, or community building.

## Features

- **Team management** — create a team, browse and request to join others, founder approval workflow for join requests
- **Founder/Member context switching** — seamlessly switch between teams you lead and teams you're a member of, with role-scoped views
- **CRM Pipeline** — Kanban-style contact tracker (Lead → Contacted → Responded → Meeting Scheduled → Negotiating → Confirmed / Lost)
- **Activity logging** — log outreach work (emails, calls, meetings, sponsor/partnership outreach, dev/design work, etc.)
- **Live Feed** — real-time team activity stream
- **Leaderboard** — team-wide ranking by activities logged
- **Analytics** — role-aware dashboards: members see their own performance, founders see full team + per-member breakdowns
- **Announcements & shared credentials** — founder-postable team announcements, shared login/credential storage for team tools
- **Founder admin panel** — member management, role assignment, oversight into member activity
- **Participant CRM** — separate registrant tracker for event/hackathon participants
- **Notifications** — join requests, approvals, and team updates

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Database:** [Neon](https://neon.tech/) (Postgres) via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Clerk](https://clerk.com/)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Email:** [Resend](https://resend.com/) (via a custom mail helper)
- **Icons:** Lucide

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) Postgres database
- A [Clerk](https://clerk.com/) application (for auth)
- A [Resend](https://resend.com/) API key (for transactional emails)

### Setup

1. Clone the repo:
```bash
   git clone https://github.com/yourusername/outpost.git
   cd outpost
```

2. Install dependencies:
```bash
   npm install
```

3. Create a `.env` file in the root with the following variables:
```env
   DATABASE_URL=your_neon_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Push the database schema:
```bash
   npx drizzle-kit push
```

5. Run the dev server:
```bash
   npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure
src/app/
├── actions/          # Server actions (teams, CRM, outreach, admin, onboarding)
├── components/       # Shared UI components
├── dashboard/         # Main dashboard + founder admin subpage
├── teams/             # Team browsing, creation, and detail pages
├── crm/               # CRM pipeline
├── leaderboard/       # Team leaderboard
├── analytics/         # Team/individual analytics
├── live-feed/         # Real-time activity feed
├── notifications/     # Notifications + join request handling
└── onboarding/        # New user onboarding flow

## Contributing

Contributions are welcome. Please open an issue first to discuss any significant changes before submitting a pull request.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.