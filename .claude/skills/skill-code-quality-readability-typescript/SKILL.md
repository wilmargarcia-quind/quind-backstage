---
name: skill-code-quality-readability-typescript
description: "Write clean, self-explanatory TypeScript code adhering to descriptive naming conventions and the Single Responsibility Principle, preserving clarity and maintainability."
metadata:
  framework_principle: P5
  enforcement_mode: verify
  criticality_level: [standard]
---

# TypeScript Code Quality and Readability

## Objetivo
Write clean, self-explanatory TypeScript code adhering to descriptive naming conventions and the Single Responsibility Principle, preserving clarity and maintainability.

## Trigger
code-development

## Inputs
- TypeScript source code
- Code review feedback

## Procedimiento
1. Ensure all variables, functions, and classes use descriptive English names that clearly convey their purpose.
2. Minimize code comments by writing self-documenting code, reserving comments for complex algorithms or non-obvious decisions.
3. Adhere to the Single Responsibility Principle (SRP), ensuring each module or component has one well-defined reason to change.
4. Conduct code reviews to enforce naming conventions, readability standards, and SRP adherence.

## Output esperado
Codebase is highly readable, maintainable, and self-explanatory, with clear separation of concerns and consistent naming.

## Source refs (project)
- coding_standards:d572b0bd-2018-4e67-a61f-50813910a0a9
- coding_standards:54e8c016-e89f-4a30-a135-44790e8a12f3
- coding_standards:d6abc71b-038e-4298-9d77-1ab6dfb8b5bd
- tech_stack:language:TypeScript
