---
name: skill-rbac-github-team-mapping
description: "Implement and enforce Role-Based Access Control (RBAC) by mapping GitHub Teams to internal roles, restricting access to technical documents and features."
metadata:
  framework_principle: P4
  enforcement_mode: verify
  criticality_level: [standard]
---

# Role-Based Access Control (RBAC) via GitHub Team Mapping

## Objetivo
Implement and enforce Role-Based Access Control (RBAC) by mapping GitHub Teams to internal roles, restricting access to technical documents and features.

## Trigger
feature-implementation

## Inputs
- User's GitHub Team membership
- RBAC policy definitions
- Requested resource path

## Procedimiento
1. Develop the `lib/auth/rbac.ts` module to define GitHub Team to internal role mappings (Dev, TL, Coordinador, Gerencia).
2. Integrate RBAC enforcement into `middleware.ts` to intercept requests and apply access policies at the edge.
3. Ensure `app/(protected)/layout.tsx` uses the assigned role to conditionally render UI elements and content.
4. Verify that access to documents and OKRs is correctly restricted based on the user's role.
5. Implement logging for unauthorized access attempts.

## Output esperado
Users can only access content and features permitted by their assigned role, with unauthorized access attempts blocked.

## Source refs (project)
- compliance_requirements:Acceso a documentos técnicos restringido por rol RBAC — ningún colaborador accede a contenido fuera de su nivel (Dev / TL / Coordinador / Gerencia)
- infrastructure_definition:Mapeo GitHub Team → Rol: Dev | TL | Coordinador | Gerencia
- structure_definition:lib/auth/rbac.ts
- structure_definition:middleware.ts
- domain_definition.use_case:b07f416c-07cb-4d1b-8aac-7aa6d09ba8bc
- domain_definition.use_case:c8302cfd-7859-4d0b-a998-009dbe264a9b
