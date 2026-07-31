---
name: react-best-practices-2026
description: >
  Enforce modern React 19 best practices (2026) when working on React components, hooks, editors, and UI logic. 
  Use for any React/TSX editing, refactoring components, extracting hooks, state management, effects, and forms.
  Trigger on: react, component, hook, useState, useEffect, editor, jsx, tailwind in react files, following package versions (React 19.2.6, @types/react ^19.2).
  Slash command: /react-best-practices-2026
---

# React Best Practices 2026 (React 19 + Project Constraints)

## Core Versions (from package.json - DO NOT DEVIATE)
- react: 19.2.6 (exact in devDeps)
- react-dom: 19.2.6
- @types/react: ^19.2.3
- @types/react-dom: ^19.2.3
- Tailwind: ^4.1.16 + @tailwindcss/vite
- Vite ^8
- Use ONLY patterns compatible with these + project's tsconfig ("module": "nodenext", "jsx": "react-jsx")

## Mandatory Project Rules (from CLAUDE.md / AGENTS.md)
- Relative imports MUST use `.js` extension even for `.ts`/`.tsx` sources (nodenext requirement).
- ALWAYS import document-model symbols from the TOP-LEVEL BARREL: `from "document-models/invoice"` (never deep `/v1/hooks.js` or `gen/`).
- Use `actions.xxx(...)` from the barrel.
- Use generated hooks like `useSelectedInvoiceDocument` only via barrel.
- No `@/*` aliases (tsconfig paths are explicit: "document-models", "editors", etc.).
- Every editor MUST use `<DocumentToolbar />` from `@powerhousedao/design-system/connect` at the very top.
- Prefer composition over inheritance. Extract logic into custom hooks.
- Reducers (if touching model side) must stay pure + synchronous.
- For editors: separate business logic (hooks, calculations, dispatches) from presentation.

## React 19 (2026) Best Practices
1. **Hooks First for Logic Extraction** (aligns with refactoring plan)
   - Extract ALL complex logic, calculations, side-effect orchestration, validation, derived state into custom hooks (`useInvoiceTotals`, `useLineItemEditor`, `useStatusWorkflow`, `useValidation`).
   - Hooks should return stable values; use `useMemo`/`useCallback` sparingly and only for expensive work or stable callbacks passed to children.
   - Prefer `use` hook (React 19) for reading resources/context where applicable over useContext + use.

2. **Component Structure**
   - Keep components small and focused (< 200-300 LOC ideally for presentational).
   - Use functional components only.
   - Colocate related logic in the same file or hook file.
   - For tables/forms with editing: use controlled components + onBlur for save, or proper form libs if project adopts (currently using document-engineering scalars + custom).
   - Lift state only when truly shared; prefer hooks for local complex state.

3. **State & Effects**
   - Avoid multiple individual `useState` for related validation fields — use a single object or dedicated hook returning `{ validations, setFieldValidation }`.
   - Effects must have proper cleanup. Never forget dependencies.
   - Use `useEffectEvent` (or stable event handlers) for effects that shouldn't re-run on handler change.
   - Sync local input state with document state only on blur or explicit save (current pattern is good — keep).
   - For derived values that depend on editing transient state (e.g. live totals), use `useMemo` with the overlay values.

4. **Performance & Memo**
   - Memoize only when profiling shows need (React 19 compiler may help in future).
   - For lists (line items): use stable keys (the `id` from model), avoid recreating render functions inside map.
   - `React.memo` only on pure presentational leaf components when props are stable.

5. **Forms & Inputs**
   - Use the project's primitives (`InputField`, `NumberForm`, `DatePicker`, `SelectField` from components, or `@powerhousedao/document-engineering`).
   - Date handling: always convert via the centralized utils (YYYY-MM-DD <-> DateTime strings). Never inline.
   - OnBlur for persistence to document to avoid excessive dispatches.
   - Validation: surface via warnings prop or error UI; do not mutate during render.

6. **Event Handlers & Callbacks**
   - Define stable handlers with `useCallback` when passed deep or used in effects.
   - For modals and dropdowns: use ref for outside click, or modern alternatives.

7. **PDF / Heavy Side Effects**
   - Isolate hacks (createRoot for PDFDownloadLink) in dedicated hooks/utils. Comment why the hack is needed.
   - Never run heavy sync work or DOM mutation in render.

8. **Styling**
   - Tailwind utility classes primary.
   - Use `twMerge` + `cn` helper when combining (project uses tailwind-merge in places).
   - Keep responsive patterns as-is for UI phase.
   - Style tags only if extremely specific to one component.

9. **Error Handling & Loading**
   - Use proper boundaries if possible.
   - Toast via `usePHToast` from `@powerhousedao/reactor-browser`.
   - Show schema mismatch or loading states early but after all hooks.

10. **Testing / Refactoring Mindset**
    - When refactoring, preserve exact dispatch sequences and calculation results.
    - Extract first, then verify with tsc + lint:fix.
    - Prefer scenario tests for flows (add item, change status, ingest).

## Anti-Patterns (NEVER)
- Do not put 1000+ line components with mixed concerns.
- Do not duplicate date/number/format/calc logic.
- Do not drill 10+ validation props — use objects or context/hooks.
- Do not use non-.js relative imports.
- Do not import from deep document-model paths.
- Avoid `any`; use `unknown` + guards or proper types from model.
- No side effects (API calls, random, Date.now) inside render or reducers.
- No direct state mutation outside of Mutative in model reducers.

## Refactoring This Codebase
When editing invoice-editor or similar:
- Follow the approved plan: utils consolidation → custom hooks → decomposition → validation cleanup → line items logic.
- After every significant change: run `npm run tsc && npm run lint:fix`.
- Always import using project conventions.
- Keep UI output identical (classes, structure, behavior) unless explicitly improving power code.

Use this skill automatically for any React file changes.
