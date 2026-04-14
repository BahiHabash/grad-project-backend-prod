---
trigger: always_on
---

{
rule: No Monolithic Files
description: Do not exceed 500 lines per file. If a service or controller grows beyond this, split logic into helper services, providers, or domain-specific modules.
},
{
rule: Separation of Concerns
description: Enums and Interfaces must never live in the same file as logic. Move them to @/common/enums/ and @/common/interfaces/ or local enums/ and interfaces/ folders within the module.
}
