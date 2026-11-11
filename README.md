# mention-input

Professional contenteditable **`@mention`** input — structured chips + sections, not a plain textarea autocomplete.

![mention-input demo](https://raw.githubusercontent.com/mojsica/mention-input/main/docs/assets/angular-mention-demo.gif)

| Package | npm |
|---------|-----|
| [`@mojsica/angular-mention-input`](./projects/angular-mention-input) | [npm](https://www.npmjs.com/package/@mojsica/angular-mention-input) |
| [`@mojsica/react-mention-input`](./packages/react-mention-input) | [npm](https://www.npmjs.com/package/@mojsica/react-mention-input) |
| [`@mojsica/vue-mention-input`](./packages/vue-mention-input) | [npm](https://www.npmjs.com/package/@mojsica/vue-mention-input) |
| [`@mojsica/mention-core`](./packages/mention-core) | Private (bundled into the UI packages) |

Type `@` → pick a user → get a mention chip. The value is `MentionContentSection[]` (`text` | `mention`), with CSS-variable theming. Same product shape on Angular (CVA), React, and Vue via shared core.

## Install

```bash
npm i @mojsica/angular-mention-input
npm i @mojsica/react-mention-input
npm i @mojsica/vue-mention-input
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

### Vue

```vue
<script setup>
import { MentionInput } from '@mojsica/vue-mention-input';
import '@mojsica/vue-mention-input/styles.css';
</script>

<template>
  <MentionInput v-model="sections" :users="users" @mention-query-change="onQuery" />
</template>
```

Each package README has the full API, value model, async user search, and theming.

## Try demos locally

```bash
pnpm install
pnpm build:core

pnpm start:angular   # http://localhost:4200
pnpm start:react     # http://localhost:5173
pnpm start:vue       # http://localhost:5174
```

## Structure

```text
packages/
  mention-core/              # private shared models + DOM helpers
  react-mention-input/
  vue-mention-input/
projects/
  angular-mention-input/
  demo-angular/
apps/
  demo-react/
  demo-vue/
```

## Build

```bash
pnpm build
pnpm build:demo-angular
pnpm build:demo-react
pnpm build:demo-vue
```

## License

MIT
