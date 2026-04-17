# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Pepper Store (`artifacts/pepper-store`)
- React + Vite e-commerce website for selling peppers
- Preview path: `/`
- Full-stack with shopping cart, checkout, order history
- 12 peppers seeded in the database

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `peppers` — Pepper products (name, description, heatLevel, category, price, imageUrl, etc.)
- `cart_items` — Shopping cart items (pepperId, quantity)
- `orders` — Placed orders (customerName, customerEmail, customerAddress, items JSON, total, status)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
