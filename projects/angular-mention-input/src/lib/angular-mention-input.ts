import { Component, Input } from '@angular/core';

/**
 * Starter mention input: contenteditable surface only.
 * Mentions / CVA / picker come in later iterations.
 */
@Component({
  selector: 'lib-mention-input',
  standalone: true,
  imports: [],
  template: `
    <div class="mi-editor-wrap">
      @if (placeholder && !hasContent) {
        <span class="mi-placeholder">{{ placeholder }}</span>
      }
      <div
        class="mi-editor"
        [attr.contenteditable]="!disabled"
        [attr.aria-disabled]="disabled"
        [attr.data-placeholder]="placeholder"
        (input)="onInput($event)"
      ></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      --mi-editor-bg: #fff;
      --mi-editor-border: #d1d5db;
      --mi-editor-radius: 8px;
      --mi-editor-min-height: 88px;
      --mi-placeholder-color: #9ca3af;
    }

    .mi-editor-wrap {
      position: relative;
    }

    .mi-placeholder {
      position: absolute;
      top: 12px;
      left: 14px;
      color: var(--mi-placeholder-color);
      pointer-events: none;
      user-select: none;
    }

    .mi-editor {
      min-height: var(--mi-editor-min-height);
      padding: 12px 14px;
      border: 1px solid var(--mi-editor-border);
      border-radius: var(--mi-editor-radius);
      background: var(--mi-editor-bg);
      outline: none;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .mi-editor:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .mi-editor[aria-disabled='true'] {
      opacity: 0.6;
      cursor: not-allowed;
      background: #f9fafb;
    }
  `,
})
export class MentionInputComponent {
  @Input() placeholder = 'Write something…';
  @Input() disabled = false;

  hasContent = false;

  onInput(event: Event): void {
    const el = event.target as HTMLElement;
    this.hasContent = (el.textContent ?? '').trim().length > 0;
  }
}
