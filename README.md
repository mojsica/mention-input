# mention-input

Contenteditable `@mention` input for Angular (React later). Inspired by production invoice messaging UX; no Yokoy app coupling.

## Structure

- `projects/angular-mention-input` — publishable library
- `projects/demo-angular` — local playground

## Develop

```bash
pnpm install
pnpm ng serve demo-angular
```

Open http://localhost:4200 — type `@` to mention mock users.

```bash
pnpm ng build angular-mention-input
```

## Library API (Angular)

```html
<lib-mention-input
  [formControl]="sections"
  [users]="users"
  [loading]="loading"
  (mentionQueryChange)="onQuery($event)"
  (mentionSelected)="onSelected($event)"
  (mentionOpenChange)="onOpen($event)"
/>
```

Value type: `MentionContentSection[]` (`text` | `mention`) via ControlValueAccessor.

Theming: override CSS variables such as `--mi-mention-bg`, `--mi-mention-color`.
