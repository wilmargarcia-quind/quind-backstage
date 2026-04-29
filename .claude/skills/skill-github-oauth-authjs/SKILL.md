---
name: skill-github-oauth-authjs
description: "Implement secure user authentication exclusively via GitHub OAuth using Auth.js, ensuring minimal data exposure and adherence to project constraints."
metadata:
  framework_principle: P4
  enforcement_mode: verify
  criticality_level: [standard]
---

# GitHub OAuth Authentication with Auth.js

## Objetivo
Implement secure user authentication exclusively via GitHub OAuth using Auth.js, ensuring minimal data exposure and adherence to project constraints.

## Trigger
feature-implementation

## Inputs
- Auth.js configuration
- GitHub OAuth credentials
- User authentication requests

## Procedimiento
1. Configure Auth.js (NextAuth) to use GitHub OAuth provider.
2. Ensure session management relies on encrypted JWT cookies without a dedicated session database.
3. Validate that authentication is exclusively through GitHub as per technical constraints.
4. Implement error handling for authentication failures (e.g., GitHub service unavailability).

## Output esperado
A functional and secure GitHub OAuth authentication flow, redirecting users to Backstage with an encrypted session cookie.

## Source refs (project)
- constraints:Auth exclusivamente vía GitHub OAuth — la organización ya vive en GitHub, no se puede usar otro proveedor
- infrastructure_definition:Auth.js v5 (NextAuth) con GitHub OAuth
- domain_definition.use_case:b07f416c-07cb-4d1b-8aac-7aa6d09ba8bc
