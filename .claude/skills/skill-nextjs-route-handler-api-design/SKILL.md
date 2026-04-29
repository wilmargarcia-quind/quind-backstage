---
name: skill-nextjs-route-handler-api-design
description: "Design and implement clear, maintainable, and predictable API endpoints using Next.js Route Handlers, leveraging DTOs for data transfer."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# Next.js Route Handler API Design & DTOs

## Objetivo
Design and implement clear, maintainable, and predictable API endpoints using Next.js Route Handlers, leveraging DTOs for data transfer.

## Trigger
feature-implementation

## Inputs
- API requirements (e.g., OKR CRUD)
- Domain entity definitions
- Existing DTOs

## Procedimiento
1. Define Request/Response DTOs for all API interactions to decouple domain entities from the API layer.
2. Implement Route Handlers (`app/api/.../route.ts`) following RESTful principles for CRUD operations (e.g., OKRs).
3. Ensure Route Handlers act as a Backend-for-Frontend (BFF) layer, encapsulating server-side logic.
4. Document API contracts clearly, including expected inputs and outputs.
5. Avoid direct exposure of database entities or internal domain models through API responses.

## Output esperado
Well-defined, secure, and maintainable API endpoints implemented as Next.js Route Handlers, using DTOs for all data transfers.

## Source refs (project)
- constraints:Sin backend dedicado en MVP — toda la lógica de servidor vive en Next.js Route Handlers (BFF pattern)
- coding_standards:2a0e8a05-fe41-4738-9de4-bfe9d5b2b51f
- design_patterns:3605427a-1335-4f92-b7a4-d8756e25647d
- structure_definition:app/api/okr/route.ts
