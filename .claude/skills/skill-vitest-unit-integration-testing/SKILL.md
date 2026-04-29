---
name: skill-vitest-unit-integration-testing
description: "Write comprehensive unit and integration tests using Vitest to achieve a minimum of 80% test coverage for domain and application logic, providing measurable evidence of code correctness."
metadata:
  framework_principle: P2
  enforcement_mode: verify
  criticality_level: [standard]
---

# Vitest Unit and Integration Testing Strategy

## Objetivo
Write comprehensive unit and integration tests using Vitest to achieve a minimum of 80% test coverage for domain and application logic, providing measurable evidence of code correctness.

## Trigger
code-development

## Inputs
- Source code (domain, application logic)
- Test requirements
- Vitest configuration

## Procedimiento
1. Develop pure unit tests for domain logic, isolating components and mocking external dependencies.
2. Create integration tests for application logic, verifying interactions between modules and external ports (e.g., Drizzle ORM client).
3. Configure Vitest to report code coverage and enforce the 80% threshold for relevant code areas.
4. Integrate testing into the CI/CD pipeline to ensure continuous validation of code quality.

## Output esperado
A comprehensive test suite with Vitest, achieving at least 80% test coverage for domain and application logic, with all tests passing.

## Source refs (project)
- coding_standards:ae7d512d-85bf-4013-b820-747e6eb461a8
- coding_standards:b138e517-a0ed-4865-811e-f4daabba5d85
- tech_stack:test_framework:Vitest
