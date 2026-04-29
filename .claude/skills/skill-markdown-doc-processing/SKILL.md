---
name: skill-markdown-doc-processing
description: "Load, parse, and render Markdown documents from the `quind-architecture-docs` Git repository, ensuring accurate and current documentation is displayed."
metadata:
  framework_principle: P1
  enforcement_mode: verify
  criticality_level: [standard]
---

# Markdown Document Loading and Rendering

## Objetivo
Load, parse, and render Markdown documents from the `quind-architecture-docs` Git repository, ensuring accurate and current documentation is displayed.

## Trigger
feature-implementation

## Inputs
- Markdown file paths from `quind-architecture-docs`
- Webhook events for content updates

## Procedimiento
1. Implement `lib/docs/loader.ts` to read MDX content from the local filesystem during build time.
2. Configure the Next.js application to revalidate document content via GitHub webhooks for updates.
3. Ensure the rendering component (`app/(protected)/docs/[slug]/page.tsx`) correctly displays Markdown, including embedded elements.
4. Handle cases where documents are not found or are malformed, providing graceful fallback or error messages.

## Output esperado
Up-to-date Markdown documents are correctly loaded and rendered in the application, reflecting the Git repository as the single source of truth.

## Source refs (project)
- constraints:Los documentos son read-only desde Git (quind-architecture-docs) — nunca se persisten en base de datos
- infrastructure_definition:Repo externo: `quind-architecture-docs` (markdown)
- infrastructure_definition:Sync: git clone/pull en build time + revalidación vía webhook GitHub
- structure_definition:lib/docs/loader.ts
- structure_definition:app/(protected)/docs/[slug]/page.tsx
