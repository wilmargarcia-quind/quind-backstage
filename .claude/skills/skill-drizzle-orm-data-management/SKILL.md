---
name: skill-drizzle-orm-data-management
description: "Define database schemas and implement CRUD operations for dynamic data (OKRs, KeyResults) using Drizzle ORM, ensuring clear, maintainable, and predictable data access patterns."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# Drizzle ORM Schema and CRUD Operations

## Objetivo
Define database schemas and implement CRUD operations for dynamic data (OKRs, KeyResults) using Drizzle ORM, ensuring clear, maintainable, and predictable data access patterns.

## Trigger
feature-implementation

## Inputs
- Domain entities requiring persistence (OKR, KeyResult)
- Database connection details
- CRUD requirements for OKRs

## Procedimiento
1. Define Drizzle ORM schemas in `lib/db/schema.ts` for entities like OKR, KeyResult, and audit logs.
2. Implement data access logic (CRUD) using Drizzle ORM within Route Handlers (e.g., `app/api/okr/route.ts`).
3. Ensure type safety and predictability in database interactions through Drizzle's TypeScript-first approach.
4. Manage database migrations and schema evolution using `drizzle.config.ts`.

## Output esperado
Robust and type-safe data persistence layer for dynamic data, allowing predictable CRUD operations via Drizzle ORM.

## Source refs (project)
- infrastructure_definition:Postgres gestionado: Neon (free tier MVP) o Cloud SQL db-f1-micro
- infrastructure_definition:ORM: Drizzle ORM (TypeScript-first, sin magic)
- structure_definition:lib/db/schema.ts
- structure_definition:app/api/okr/route.ts
- structure_definition:drizzle.config.ts
