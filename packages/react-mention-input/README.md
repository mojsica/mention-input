# @mojsica/react-mention-input

Contenteditable `@` mention input for React with chips and structured `MentionContentSection[]` value.

Shares behavior with [`@mojsica/angular-mention-input`](../../projects/angular-mention-input) via private `@mojsica/mention-core`.

## Install

```bash
npm i @mojsica/react-mention-input
```

```ts
import { MentionInput } from '@mojsica/react-mention-input';
import '@mojsica/react-mention-input/styles.css';
```

```tsx
<MentionInput
  value={sections}
  onChange={setSections}
  users={users}
  loading={loading}
  onMentionQueryChange={onQuery}
/>
```

## Theming

Map design-system tokens to `--mi-*` CSS variables on a parent (same as Angular).

## Local demo

```bash
pnpm --filter demo-react dev
```

## License

MIT
