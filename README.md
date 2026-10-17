# SpaceWallah

Premium SaaS platform to discover and compare workspaces across India.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- MongoDB-ready service layer
- Cloudinary-ready media config

## Current Scope

This scaffold includes:

- Public route architecture for all 3 verticals
- Shared layout with header/footer
- Reusable UI primitives
- Dummy data-backed listing and lead services
- REST API skeleton for spaces and leads
- Admin dashboard shell
- Global design tokens and typography

## Route Strategy

Public URLs supported:

- `/`
- `/coworking`
- `/coworking/:city`
- `/coworking/:city/:location`
- `/coworking/:slug`
- `/virtual-office`
- `/virtual-office/:city`
- `/virtual-office/:city/:location`
- `/virtual-office/:slug`
- `/office-space`
- `/office-space/:city`
- `/office-space/:city/:location`
- `/office-space/:slug`

Note: Next.js cannot support sibling dynamic folders like `[city]` and `[slug]` at the same level. This scaffold resolves both through a shared `[segment]` route and decides at runtime whether the segment represents a city or a listing slug.

## Key Folders

- `app/`: routes, layouts, API endpoints
- `components/`: shared UI and layout primitives
- `modules/`: feature-oriented modules
- `services/`: data access, API client, integration setup
- `utils/`: formatting, metadata, helpers
- `types/`: shared TypeScript contracts

## Next Build Phases

1. Replace in-memory mock services with MongoDB models and repositories.
2. Add authenticated admin actions and forms.
3. Build rich listing pages, filters, and lead-capture forms.
4. Connect Cloudinary uploads and validation.
5. Add SEO enhancements like sitemap, structured data, and canonical handling.
