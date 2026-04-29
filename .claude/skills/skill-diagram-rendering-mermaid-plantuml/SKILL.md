---
name: skill-diagram-rendering-mermaid-plantuml
description: "Automatically render Mermaid and PlantUML diagrams embedded in Markdown documentation, providing clear and predictable visualization of architectural diagrams."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# Automatic Diagram Rendering (Mermaid & PlantUML)

## Objetivo
Automatically render Mermaid and PlantUML diagrams embedded in Markdown documentation, providing clear and predictable visualization of architectural diagrams.

## Trigger
feature-implementation

## Inputs
- Markdown content with embedded Mermaid/PlantUML code blocks
- Kroki service endpoint

## Procedimiento
1. Integrate a client-side Mermaid renderer (e.g., `react-mermaid2` or `mermaid.js`) into `MermaidRenderer.tsx`.
2. Implement `PlantUMLRenderer.tsx` to proxy PlantUML requests through the `/api/diagrams` Route Handler to the self-hosted Kroki service.
3. Ensure the `/api/diagrams/route.ts` acts as a secure proxy to the Kroki service, handling requests and responses.
4. Verify that diagrams render correctly and promptly upon document load, handling syntax errors gracefully.

## Output esperado
All Mermaid and PlantUML diagrams within documentation are automatically rendered and displayed correctly without user intervention.

## Source refs (project)
- domain_definition.use_case:fce61b29-ca15-4066-8532-e269e4e8a8e2
- infrastructure_definition:Mermaid: cliente (react-mermaid2 o mermaid.js directo)
- infrastructure_definition:PlantUML / otros: proxy a Kroki self-hosted via Route Handler `/api/diagrams`
- structure_definition:components/diagrams/MermaidRenderer.tsx
- structure_definition:components/diagrams/PlantUMLRenderer.tsx
- structure_definition:app/api/diagrams/route.ts
