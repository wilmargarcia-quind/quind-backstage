# Contexto de arquitectura

> Generado por Guardian Suite. Actualizar con: `agentic context`

## Stack tecnológico
React Next.js App Router / TypeScript / Next.js / 14.0 / Node 20 LTS / Turborepo / Vitest

## Estándares de codificación
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

## Patrones de diseño
Strategy: Lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable. [category=Behavioral]
Repository: Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. [category=Architectural]
Middleware Chain: Centralizes authentication (JWT) and authorization (Casbin RBAC) logic by implementing them as Starlette middleware that intercepts all requests before reaching the handler. [category=general]
Data Transfer Object (DTO): An object used to encapsulate data for transfer between layers, often used to decouple the domain model from the presentation or external API layer. [category=general]
Dependency Injection: A technique where an object receives other objects that it depends on, promoting loose coupling and testability. [category=general]
Vertical Slice: Structuring domain models where each model has its own folder with port abstractions and entity definitions. [category=general]

## AI Attribution via MCP

After each significant Edit or Write you make to a code file in this workspace, call the MCP tool `tlm_record_ai_attributions` from the Tech Lead Manager server with the file path, line range you authored, your generator name and model. This is how the project tracks AI Contribution Rate, retention and governance metrics.

To obtain the `X-API-Key` header value for the TLM MCP server, run `agentic mcp-key --print` (the key was persisted in `~/.agentic/profile.json` after `agentic login`). Use `agentic mcp-key --export` to print an `export TLM_MCP_API_KEY=<key>` line you can `eval` in your shell or paste into your AI coder's MCP config.

The tool accepts:

- `project_code` (required): use the value `QBCK-NEXT` (already set in `.agentic.json`).
- `commit_sha` (optional): leave `null` while editing — TLM reconciles to the real SHA when you push the PR.
- `attributions` (required, array): one item per range you generated, with:
  - `file_path` (relative to the repo root)
  - `line_start`, `line_end` (1-indexed, inclusive)
  - `generator` (e.g. `"claude-code"`, `"cursor"`, `"copilot"`)
  - `model` (e.g. `"claude-opus-4-7"`, `"gpt-4o"`)
  - `agent_node` (optional, for LangGraph flows)

Skip non-code files (`.md`, `.json`, `.yml`, build configs, images, lock files) — they are not relevant to AI contribution metrics. Only attribute changes to source code in the languages of the project's tech stack.

Example call (single edit, 3 lines authored):

```json
{
  "project_code": "QBCK-NEXT",
  "commit_sha": null,
  "attributions": [
    {
      "file_path": "src/main/java/com/example/Foo.java",
      "line_start": 12,
      "line_end": 14,
      "generator": "claude-code",
      "model": "claude-opus-4-7"
    }
  ]
}
```

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

## Quality gate
Governance score mínimo: **60/100**
Validar con: `agentic check`
