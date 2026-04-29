---
name: skill-input-business-rule-validation
description: "Apply mandatory input validation for all API requests and enforce domain-specific business rules within Next.js Route Handlers to ensure data integrity and predictable system behavior."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# Input and Business Rule Validation in Route Handlers

## Objetivo
Apply mandatory input validation for all API requests and enforce domain-specific business rules within Next.js Route Handlers to ensure data integrity and predictable system behavior.

## Trigger
feature-implementation

## Inputs
- API request data
- Domain business rules (e.g., OKR invariants)
- Validation schemas

## Procedimiento
1. Implement schema-based validation (e.g., Zod) for all incoming API request bodies and query parameters.
2. Enforce domain business rules (e.g., OKR invariants, KeyResult progress logic) within the application layer before data persistence.
3. Return clear, standardized error responses for validation failures.
4. Integrate validation into the Route Handler pipeline to prevent invalid data from reaching the domain or persistence layers.

## Output esperado
All incoming data is validated against defined schemas and business rules, with invalid data rejected early and clear error messages provided.

## Source refs (project)
- coding_standards:efc7f901-9c2c-474b-80a4-d8f071d7ad13
- coding_standards:2a0e8a05-fe41-4738-9de4-bfe9d5b2b51f
- domain_definition:OKR.Invariante: un OKR sin al menos un KR activo no puede marcarse como Activo
