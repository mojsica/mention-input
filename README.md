# mention-input

Local monorepo for a contenteditable `@mention` input (Angular first; React later).

## Structure

- `projects/angular-mention-input` — publishable Angular library (`lib-mention-input`)
- `projects/demo-angular` — demo app that consumes the library

## Develop

```bash
cd mention-input
pnpm install
pnpm ng serve demo-angular
```

Open http://localhost:4200 — the playground uses the local library via TypeScript path mapping.

```bash
pnpm ng build angular-mention-input   # build the library to dist/
```

## Status

Starter: contenteditable field only. Mentions, CVA, picker, React package — next.
