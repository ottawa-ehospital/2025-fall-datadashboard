# eHospital Frontend Module

A modern, modular frontend built with Next.js 16, React 19, and TypeScript. Designed as an **integration-ready module** for larger e-hospital (eHOS) systems.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui (New York), Radix UI
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts, d3
- **Icons:** Lucide React
- **Theme:** next-themes (dark mode support)

## 📁 Project Structure

```
.
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui atomic components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── public/          # Static assets
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Application runs at `http://localhost:3000`

## 🔧 Configuration

### Path Aliases
```typescript
@/components
@/hooks
@/lib
```

### Build Settings
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- Images unoptimized (`unoptimized: true`)

## 🎯 Integration Options

### Option 1: Micro-Frontend
- Deploy as standalone module
- Mount within main eHOS frontend
- Share authentication, themes, and API layers

### Option 2: Component Library
- Extract `components/`, `hooks/`, `lib/`
- Merge into existing frontend
- Adapt routes to host application structure

## ✅ What's Included

- Modern UI layouts and page structure
- Reusable, modular components
- Form handling with validation
- Data visualization components
- Dark mode support

## ⚠️ What's NOT Included

- Backend APIs or services
- Authentication/authorization
- Database or persistent storage
- Production deployment config

## 💡 Use Cases

- Frontend module for e-hospital systems
- UI prototype and reference implementation
- Foundation for healthcare dashboards
- Component library for medical interfaces

## 📝 Notes

This is a **frontend-only** implementation focused on UI architecture and component reusability. It's designed for system integration and requires backend services to be provided by the host application.

---

**License:** MIT  
**Framework:** Next.js 16 with App Router
