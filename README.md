# mention-input

Professional contenteditable **`@mention`** input — structured chips + sections, not a plain textarea autocomplete.

| Package | Status |
|---------|--------|
| [`@mojsica/angular-mention-input`](./projects/angular-mention-input) | Ready |
| [`@mojsica/react-mention-input`](./packages/react-mention-input) | Ready |
| [`@mojsica/mention-core`](./packages/mention-core) | Private workspace (bundled into UI packages) |

![angular-mention-input demo](./docs/assets/angular-mention-demo.gif)

**Why Angular first:** existing Angular mention libs are mostly textarea/input `@`-autocomplete. This package is a contenteditable field with mention chips, `MentionContentSection[]` value, CVA, CSS-variable theming, and a real demo. React ships for the same API shape.

## Try demos

```bash
pnpm install
pnpm build:core

# Angular
pnpm start:angular
# http://localhost:4200

# React
pnpm start:react
# http://localhost:5173
```

## Install (when published)

```bash
npm i @mojsica/angular-mention-input
npm i @mojsica/react-mention-input
```

### Angular

```html
<lib-mention-input
  formControlName="sections"
  [users]="users"
  [loading]="loading"
  (mentionQueryChange)="onQuery($event)"
/>
```

### React

```tsx
import { MentionInput } from '@mojsica/react-mention-input';
import '@mojsica/react-mention-input/styles.css';

<MentionInput value={sections} onChange={setSections} users={users} onMentionQueryChange={onQuery} />
```

## Structure

```text
packages/
  mention-core/              # private shared models + DOM helpers
  react-mention-input/       # @mojsica/react-mention-input
projects/
  angular-mention-input/     # @mojsica/angular-mention-input (+ CVA)
  demo-angular/
apps/
  demo-react/
```

## Build

```bash
pnpm build          # core + angular + react libs
pnpm build:demo-angular
pnpm build:demo-react
```

## Out of scope (v1)

Rich-text toolbar, built-in HTTP user search, Vue (later).

## License

MIT
