# @mojsica/vue-mention-input

Contenteditable `@` mention input for Vue 3 with chips and structured `MentionContentSection[]` value.

Shares behavior with the Angular/React packages via private `@mojsica/mention-core`.

## Install

```bash
npm i @mojsica/vue-mention-input
```

```ts
import { MentionInput } from '@mojsica/vue-mention-input';
import '@mojsica/vue-mention-input/styles.css';
```

```vue
<MentionInput
  v-model="sections"
  :users="users"
  :loading="loading"
  @mention-query-change="onQuery"
/>
```

## Local demo

```bash
pnpm --filter demo-vue dev
```

## License

MIT
