---
trigger: always_on
---

Zero "any" Policy: Use of the any type is strictly prohibited. If a type is unknown, use unknown and perform type narrowing.

Enum Over Strings: Never use string literals for status, types, or categories. Use TypeScript enums or const enums (values are CAPITAL).

Return Types: Every function and class method must have an explicit return type (e.g., Promise<User>, void, number).

rule: Validation Layer
description: Every entry point (Controller/Gateway) must have a dedicated DTO (Data Transfer Object) with class-validator decorators. No raw JSON objects allowed in service methods. and a dto for the response if needed + explicit maping values before retruning the queried data.
