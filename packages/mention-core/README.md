# @mojsica/mention-core

Private workspace package: shared `MentionContentSection` / `MentionUser` models and contenteditable DOM helpers.

**Not published to npm.** Bundled into:

- `@mojsica/react-mention-input` (Vite)
- `@mojsica/angular-mention-input` (synced into `src/lib/core` before `ng-packagr`)

```bash
pnpm build:core
pnpm sync:core   # copies sources into the Angular library
```
