# @mojsica/angular-mention-input

Contenteditable `@` mention input for Angular with chips, a user picker, and **ControlValueAccessor** support.

Unlike textarea-only mention libs, the value is structured sections (`text` | `mention`) — useful for chat, comments, and “notify users” fields.

![Demo](https://raw.githubusercontent.com/mojsica/mention-input/main/docs/assets/angular-mention-demo.gif)

**Try it live:** [StackBlitz](https://stackblitz.com/edit/mojsica-angular-mention-input)

## Install

```bash
npm i @mojsica/angular-mention-input
```

**Peers:** `@angular/core`, `@angular/common`, `@angular/forms` — `>=17 <21`.

## Quick start

```ts
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MentionInputComponent,
  MentionContentSection,
  MentionUser,
} from '@mojsica/angular-mention-input';

users: MentionUser[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', avatarUrl: '…' },
];

sections = new FormControl<MentionContentSection[]>([], { nonNullable: true });

onQuery(q: string) {
  // fetch users for `q`, then assign this.users
}
```

```html
<lib-mention-input
  [formControl]="sections"
  [users]="users"
  [loading]="loading"
  (mentionQueryChange)="onQuery($event)"
/>
```

Type `@`, pick a user → a mention chip is inserted. The form value is `MentionContentSection[]`, not a plain string.

## Value model

```ts
type MentionContentSection =
  | { type: 'text'; message: string }
  | { type: 'mention'; userId: string; userName: string; email?: string };
```

## Inputs / outputs

| API | Description |
|-----|-------------|
| `[users]` | Users shown in the picker right now |
| `[loading]` | Loading state in the picker |
| `[clientFilter]` | Local name/email filter (`false` when you filter server-side) |
| `[placeholder]`, `[disabled]`, `[hasError]`, … | Field chrome |
| `(mentionQueryChange)` | Fires as the user types after `@` |
| `(mentionSelected)` | User picked from the list |
| `(mentionOpenChange)` | Picker opened / closed |
| CVA | `MentionContentSection[]` via `formControl` / `ngModel` |

### Async users

The library does not call your API. Update `[users]` from `(mentionQueryChange)`:

```ts
onQuery(q: string) {
  this.loading = true;
  this.userApi.search(q).subscribe((users) => {
    this.users = users;
    this.loading = false;
  });
}
```

## Theming

Map design-system tokens onto `--mi-*` on a parent (or `:root`):

```css
.my-panel {
  --mi-editor-bg: var(--ds-surface);
  --mi-editor-border: var(--ds-border);
  --mi-editor-radius: var(--ds-radius-md);
  --mi-mention-bg: var(--ds-color-primary-soft);
  --mi-mention-color: var(--ds-color-primary);
  --mi-mention-draft-color: var(--ds-color-primary);
  --mi-picker-bg: var(--ds-surface-elevated);
  --mi-picker-shadow: var(--ds-shadow-md);
  --mi-user-active-bg: var(--ds-surface-hover);
  --mi-avatar-size: 28px;
}
```

## Links

- [StackBlitz demo](https://stackblitz.com/edit/mojsica-angular-mention-input)
- [GitHub](https://github.com/mojsica/mention-input)
- [npm](https://www.npmjs.com/package/@mojsica/angular-mention-input)

## License

MIT
