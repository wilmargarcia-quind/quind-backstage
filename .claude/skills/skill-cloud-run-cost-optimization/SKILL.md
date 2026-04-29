---
name: skill-cloud-run-cost-optimization
description: "Deploy and manage Next.js applications and supporting services (Kroki) on Google Cloud Run with a focus on cost efficiency, ensuring the infrastructure operates predictably within the < 80 USD/month budget."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# Cloud Run Cost-Optimized Deployment

## Objetivo
Deploy and manage Next.js applications and supporting services (Kroki) on Google Cloud Run with a focus on cost efficiency, ensuring the infrastructure operates predictably within the < 80 USD/month budget.

## Trigger
deployment

## Inputs
- Cloud Run service configurations
- Project budget constraints
- Application traffic patterns

## Procedimiento
1. Configure Cloud Run services (Next.js app, Kroki) to scale down to zero instances (`min=0`) during periods of inactivity.
2. Set appropriate maximum instance limits (`max=3` for Next.js app) to control costs under peak load.
3. Monitor Cloud Run billing and resource usage to identify and address potential cost overruns.
4. Optimize container images for size and startup time to minimize cold start impact while maintaining cost efficiency.

## Output esperado
Next.js and Kroki services deployed on Cloud Run operate reliably and within the specified budget, leveraging auto-scaling to zero instances.

## Source refs (project)
- constraints:Presupuesto de infraestructura < 80 USD/mes (staging + prod en Cloud Run + Postgres gestionado)
- infrastructure_definition:App: Next.js 15 App Router en Cloud Run (min=0, max=3 instancias)
- infrastructure_definition:Kroki: imagen oficial self-hosted en Cloud Run (min=0) — render PlantUML/diagrams
