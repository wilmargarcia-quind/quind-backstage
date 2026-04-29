# Guidelines para JetBrains Junie

> Contenido completo — no es pointer. Generado por Guardian Suite (FACTORY-30).


## Stack tecnológico
React Next.js App Router / TypeScript / Next.js / 14.0 / Node 20 LTS / Turborepo / Vitest

## Coding standards
Test Coverage Threshold: Achieve a minimum of 80% test coverage for domain and application logic. [language=general] [category=inferred]
Code Readability: Minimize comments, ensuring code is self-explanatory. [language=general] [category=inferred]
OWASP Top 10 Security Controls: Implement controls for OWASP Top 10 vulnerabilities, including Casbin RBAC, signed JWTs with expiration, bcrypt for password hashing, and using SQLAlchemy ORM to prevent injection. [language=general] [category=inferred]
Centralized Error Handling: Implement a `GlobalExceptionHandler` (@ControllerAdvice) to map `DomainException` hierarchy to appropriate HTTP status codes for REST APIs. [language=general] [category=inferred]
REST API Design & Error Handling: Use Request/Response DTOs for API interactions, avoiding direct exposure of Domain Entities. Implement JSR-303/Spring Validation for input and a `GlobalExceptionHandler` to map Domain Exceptions to appropriate HTTP status codes. [language=general] [category=inferred]
Input and Business Rule Validation: Mandatory input validation (e.g., JSR-303 in controllers) and domain business rule validation (e.g., positive quantities, minimum order values) must be applied. [language=general] [category=inferred]
Layered Testing Strategy: Implement a testing hierarchy: pure unit tests for domain logic (JUnit 5, AssertJ), service tests for application logic (Mockito for output ports), and integration tests for infrastructure adapters (Spring Boot Test). [language=general] [category=inferred]
Single Responsibility Principle: Cada clase o módulo debe tener una única responsabilidad bien definida y solo una razón para cambiar. [language=agnostic] [category=SOLID]
Naming Conventions: Use descriptive variable and method names in English. [language=general] [category=inferred]
Centralized Security Controls: Authentication (JWT) and authorization (Casbin RBAC) must be implemented as Starlette middleware, centralizing security logic and preventing duplication. [language=general] [category=inferred]

## Design patterns
Strategy: Lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable. [category=Behavioral]
Repository: Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. [category=Architectural]
Middleware Chain: Centralizes authentication (JWT) and authorization (Casbin RBAC) logic by implementing them as Starlette middleware that intercepts all requests before reaching the handler. [category=general]
Data Transfer Object (DTO): An object used to encapsulate data for transfer between layers, often used to decouple the domain model from the presentation or external API layer. [category=general]
Dependency Injection: A technique where an object receives other objects that it depends on, promoting loose coupling and testability. [category=general]
Vertical Slice: Structuring domain models where each model has its own folder with port abstractions and entity definitions. [category=general]

## Dominio
# Domain

## Entidades principales

### Doc
Documento técnico (ADR, guía, onboarding, plan de carrera, capacitación).
- id, slug, title, category, content (Markdown), diagrams[], tags[], role_visibility
- Fuente de verdad: repo Git `quind-architecture-docs` — solo lectura en Backstage
- Invariante: un Doc sin slug válido no se indexa

### ADR
Subentidad de Doc. Campos adicionales: status (Proposed | Accepted | Deprecated), authors[], decision_date.

### OKR
- id, period (Q2-2026…), coe_id, objective, key_results[]
- Invariante: un OKR sin al menos un KR activo no puede marcarse como Activo
- Datos dinámicos: persisten en Postgres

### KeyResult
- id, okr_id, description, kpi, baseline, target, current_value, responsible, due_date, progress (0|25|50|75|100)

### User
- github_id, email, name, team (GitHub Team), role (Dev | TL | Coordinador | Gerencia)
- Rol derivado del GitHub Team — no se gestiona en Backstage

### CareerPath
- role_level (Dev Jr | Dev Sr | TL | Coordinador), milestones[], capacitaciones[]
- Solo lectura desde repo Git

## Reglas de negocio
- RBAC: Dev ve docs públicos; TL ve OKRs de su CoE; Coordinador ve todos los CoEs; Gerencia ve todo
- Un Doc solo es visible si el rol del usuario está en role_visibility
- OKR.progress = promedio de KeyResult.progress del período activo
- La fuente de verdad de docs es Git — nunca la base de datos

## Infraestructura
# Infrastructure

## Compute
- App: Next.js 15 App Router en Cloud Run (min=0, max=3 instancias)
- Kroki: imagen oficial self-hosted en Cloud Run (min=0) — render PlantUML/diagrams
- Cold start aceptable (~1-2s): uso interno

## Base de datos
- Postgres gestionado: Neon (free tier MVP) o Cloud SQL db-f1-micro
- ORM: Drizzle ORM (TypeScript-first, sin magic)
- Solo datos dinámicos: OKRs, KeyResults, audit log de accesos

## Autenticación
- Auth.js v5 (NextAuth) con GitHub OAuth
- Mapeo GitHub Team → Rol: Dev | TL | Coordinador | Gerencia
- Sesión en cookie cifrada (JWT). Sin base de datos de sesiones en MVP.

## Fuente de verdad de documentos
- Repo externo: `quind-architecture-docs` (markdown)
- Sync: git clone/pull en build time + revalidación vía webhook GitHub
- Sin base de datos para docs — filesystem en build

## Render de diagramas
- Mermaid: cliente (react-mermaid2 o mermaid.js directo)
- PlantUML / otros: proxy a Kroki self-hosted via Route Handler `/api/diagrams`

## Búsqueda
- MVP: Pagefind (índice estático generado en build)
- Post-MVP si escala: Meilisearch

## Despliegue
- CI/CD: GitHub Actions → Artifact Registry → Cloud Run
- Ambientes: staging + prod (Cloud Run services separados)
- Secretos: Secret Manager (GCP)

## Costo objetivo MVP
- < 80 USD/mes (staging + prod, ~80 usuarios internos)

## Constraints
- [High] Auth exclusivamente vía GitHub OAuth — la organización ya vive en GitHub, no se puede usar otro proveedor
- [High] Los documentos son read-only desde Git (quind-architecture-docs) — nunca se persisten en base de datos
- [Medium] Sin backend dedicado en MVP — toda la lógica de servidor vive en Next.js Route Handlers (BFF pattern)
- [Medium] Equipo con skill fuerte en TypeScript/React pero limitado en backend pesado — stack debe mantenerse dentro de ese perfil
- [Medium] Presupuesto de infraestructura < 80 USD/mes (staging + prod en Cloud Run + Postgres gestionado)
- [High] MVP deadline: 2026-05-30 — fecha fija por KR1 del OKR Q2 2026

## Compliance
Acceso a documentos técnicos restringido por rol RBAC — ningún colaborador accede a contenido fuera de su nivel (Dev / TL / Coordinador / Gerencia)

# Framework Quind (v1.0.0)

## core-context-first
Require official, current, and relevant context before generation or modification.

- Identify the source of truth before drafting code or advice.
- Call out missing context explicitly instead of filling gaps with invention.
- Prefer repository artifacts, schemas, tickets, and approved documentation over model memory.

## core-verifiability-required
Require measurable acceptance criteria and evidence expectations before calling work done.

- Translate ambiguous requests into observable criteria before implementation.
- Differentiate functional correctness from smoke validation and quality checks.
- Do not close work without stating what was validated and what remains assumed.

## core-hitl-required
Keep human checkpoints explicit before generation, acceptance, and closure.

- Treat generated output as a proposal, not a decision.
- Ask for or record review confirmation before final acceptance.
- Escalate reinforced changes to stronger human review.

## core-privacy-minimal-disclosure
Use the minimum safe context and refuse to expose secrets, PII, or sensitive assets unnecessarily.

- Prefer synthetic, masked, or minimal samples when context is sensitive.
- Stop and sanitize when secrets, PII, or customer-sensitive content appear.
- Use only approved tools and flows for the current project context.

## core-technical-quality-baseline
Preserve clarity, maintainability, and predictable behavior as baseline quality goals.

- Prefer simple, readable structures over clever but opaque implementation.
- Use automatic validators when they materially improve confidence.
- Keep changes coherent with the language and repository conventions already in use.

## core-framework-operating-model
Anchor every task to the P1-P5 operating model before generating, editing, validating, or closing work.

- Start by classifying the task and locating the source of truth before proposing edits.
- Keep acceptance criteria, human review, privacy, and quality visible throughout the task.
- Escalate rigor with criticity instead of applying one fixed level of formality to every task.
