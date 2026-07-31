---
name: typescript-best-practices-2026
description: >
  Enforce modern TypeScript 5.9+ best practices (2026) for strict typing, module resolution, and safety.
  Use on any .ts/.tsx changes, especially when touching types from document-models, actions, state schemas, or editor logic.
  Follow exact versions: typescript ^5.9.3, @types/node ^24, zod 4.3.6. Project tsconfig: nodenext + strict + verbatimModuleSyntax.
  Slash command: /typescript-best-practices-2026
---

# TypeScript Best Practices 2026 (TS 5.9 + Project Constraints)

## Core Versions & Config (package.json + tsconfig)
- typescript: ^5.9.3
- @types/node: ^24.9.2
- @types/react: ^19.2.3 (see react skill)
- zod: 4.3.6 (and ^4 peer)
- tsconfig:
  - "module": "nodenext"
  - "moduleDetection": "force"
  - "strict": true
  - "verbatimModuleSyntax": true
  - "isolatedModules": true
  - "noUncheckedSideEffectImports": true
  - Explicit paths only (no baseUrl + @/*)
  - "jsx": "react-jsx"
  - emitDeclarationOnly + incremental

## Mandatory Import & Module Rules
- Relative imports: ALWAYS append `.js` (or `.jsx`) for .ts/.tsx sources. Example: `./utils.js`, `../components/foo.js`.
- Document model imports: ONLY from top-level barrel `"document-models/invoice"` or `"document-models/invoice"` (types + actions + hooks).
  - Correct: `import { actions, useSelectedInvoiceDocument, type InvoiceDocument } from "document-models/invoice";`
  - WRONG: deep `/v1/hooks.js`, `/gen/...`, or relative to gen folders.
- External package imports must respect package.json exports.
- Use `type` imports where possible for pure types: `import type { Foo } from "..."`.

## Strictness & Safety (2026 Standards)
- No `any` except in very rare justified cases with `// eslint-disable-next-line` + comment. Prefer `unknown`.
- Use `satisfies`, template literal types, branded types when helpful for domain (OID, etc.).
- Exhaustiveness checking: use `never` in switches/unions for status, etc.
- Prefer `readonly` arrays/objects where model allows.
- Zod schemas: import from model `.../gen/schema/zod.js` only when needed for runtime checks. Prefer generated types.
- For optional/nullable: respect `Maybe<T>`, `InputMaybe<T>` from model. Use `|| null` or `??` correctly.
  - `|| null` for "empty-ish to null".
  - `??` for null/undefined coalescing.

## Typing Document Model & Actions
- Always use the generated action input types where possible: `EditInvoiceInput`, `AddLineItemInput`, etc.
- When dispatching: `dispatch(actions.editLineItem(input as EditLineItemInput))` or let inference work.
- State access: `state.global` or via the returned document. Guard with `if (!state) return ...` AFTER all hooks.
- For line items, payments, rejections: use the exact types from barrel (`InvoiceLineItem`, `Payment`, `Status`, etc.).

## Common Patterns in This Project
- Date handling: centralize conversion functions. Type as `string | null` for DateTime fields from model.
- Calculations: return properly typed numbers. Use branded if currency precision matters.
- Validation results: define `ValidationResult` interface once and reuse.
- Modal / transient UI state: use union types for `activeModal: "issue" | "reject" | null`.
- When editing: use `Partial<...>` or specific `EditableLineItem` types internally, but convert to exact model input types on dispatch.

## Zod + Runtime
- Use Zod for input validation only at boundaries (ingest, PDF apply).
- Prefer model-provided Zod when available.
- Error messages from Zod should be user-friendly in toasts.

## Anti-Patterns (Strictly Forbidden)
- Extensionless relative imports.
- Deep imports into document-model gen/ or v*/ that bypass barrel.
- `export *` that leaks internals.
- Using `as any` to silence errors — fix the types.
- Mixing `Date` objects vs ISO strings — the model uses strings (DateTime scalar).
- Declaring new interfaces that duplicate model types — import and extend if needed.
- Ignoring `verbatimModuleSyntax` (must use `import type` for types).

## Refactoring Guidance
- When extracting hooks: type the return value explicitly with interfaces or `type HookResult = { ... }`.
- For complex inline objects in useMemo/useState: give them named types.
- After changes: always `npm run tsc` (full type check) + `npm run lint:fix`.
- Keep generated files untouched.

## Useful TS 5.9+ Features to Leverage
- `const type` parameters, improved inference.
- `satisfies` for config-like objects.
- Template string types for dimension/value in tags if useful.
- `NoInfer` utility in generic constraints when passing callbacks.

Automatically apply when editing any TypeScript in the project (especially editors and document-models interactions).
