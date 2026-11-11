# mention-input

Professional contenteditable **`@mention`** input — structured chips + sections, not a plain textarea autocomplete.

| Package | Status |
|---------|--------|
| [`@mojsica/angular-mention-input`](./projects/angular-mention-input) | Ready to polish / publish |
| `@mojsica/react-mention-input` | Planned |
| `mention-core` (private workspace) | Extract with React |

![angular-mention-input demo](./docs/assets/angular-mention-demo.gif)

**Why Angular first:** existing Angular mention libs are mostly textarea/input `@`-autocomplete. This package is a contenteditable field with mention chips, `MentionContentSection[]` value, CVA, CSS-variable theming, and a real demo.

## Try the Angular demo

```bash
pnpm install
pnpm ng serve demo-angular
```

Open http://localhost:4200

- Type `@` to open the picker (avatars + initials fallback)
- Live JSON of `MentionContentSection[]`
- Checkbox remaps `--mi-*` CSS variables (one default look; tokens prove DS mapping)
- Install / usage snippet on the page

## Install (when published)

```bash
npm i @mojsica/angular-mention-input
```

```html
<lib-mention-input
  formControlName="sections"
  [users]="users"
  [loading]="loading"
  (mentionQueryChange)="onQuery($event)"
/>
```

Full API + theming: [`projects/angular-mention-input/README.md`](./projects/angular-mention-input/README.md)

## Structure

```text
projects/
  angular-mention-input/   # @mojsica/angular-mention-input (+ CVA)
  demo-angular/            # playground
```

## Build

```bash
pnpm ng build angular-mention-input
```

## Out of scope (v1)

Rich-text toolbar, built-in HTTP user search, Vue (later), Yokoy app coupling.

## License

MIT
