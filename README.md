# eHospital Frontend Module

Modern hospital management interface built with Next.js 16, React 19, and TypeScript. Ready to plug into existing e-hospital systems.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui (New York variant)
- React Hook Form + Zod validation
- Recharts & d3 for data viz
- Lucide icons
- Dark mode via next-themes

## Project Structure
```
.
├── app/              # Routes and layouts
├── components/       # Reusable components
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom hooks
├── lib/             # Utils and helpers
├── public/          # Static files
└── package.json
```

## Quick Start

**Requirements:** Node.js 18+, pnpm recommended
```bash
pnpm install
pnpm dev
```

Runs on `http://localhost:3000`

## Configuration

**Path aliases:**
- `@/components`
- `@/hooks`
- `@/lib`

**Build settings:**
- TS errors ignored in production builds
- Image optimization disabled (configure for your CDN)

## Integration

**As a micro-frontend:**
Deploy independently and mount into your main eHOS app. Share auth, theming, and API clients.

**As a component library:**
Extract the `components/`, `hooks/`, and `lib/` folders into your existing codebase. Map routes to your app structure.

## What You Get

- Full UI layouts and routing
- Form components with validation
- Charts and data visualization
- Dark mode toggle
- Mobile-responsive design

## What's Missing

This is frontend only. You'll need to provide:

- API endpoints and backend services
- Authentication system
- Database connections
- Production deployment setup

## Good For

- Hospital management dashboards
- Medical record interfaces
- UI prototyping for healthcare apps
- Component reference for clinical systems

---

MIT License
