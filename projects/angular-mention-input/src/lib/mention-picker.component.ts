import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MentionUser } from './models';

@Component({
  selector: 'lib-mention-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mi-picker" role="listbox">
      @if (loading) {
        <div class="mi-picker__status">Loading…</div>
      } @else if (filteredUsers.length === 0) {
        <div class="mi-picker__status">{{ emptyText }}</div>
      } @else {
        @for (user of filteredUsers; track user.id; let i = $index) {
          <button
            type="button"
            class="mi-user"
            role="option"
            [class.mi-user--active]="i === activeIndex"
            (mousedown)="$event.preventDefault(); select(user)"
          >
            <span class="mi-user-avatar" aria-hidden="true">
              @if (user.avatarUrl) {
                <img [src]="user.avatarUrl" [alt]="''" />
              } @else {
                {{ initials(user.name) }}
              }
            </span>
            <span class="mi-user-meta">
              <span class="mi-user-name">{{ user.name }}</span>
              @if (user.email) {
                <span class="mi-user-email">{{ user.email }}</span>
              }
            </span>
          </button>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      z-index: 20;
      left: 0;
      top: calc(100% + 4px);
      min-width: 240px;
      max-width: 320px;
    }

    .mi-picker {
      max-height: 240px;
      overflow: auto;
      border: 1px solid var(--mi-editor-border, #d1d5db);
      border-radius: var(--mi-editor-radius, 8px);
      background: var(--mi-picker-bg, #fff);
      box-shadow: var(--mi-picker-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
      padding: 4px;
    }

    .mi-picker__status {
      padding: 10px 12px;
      color: #6b7280;
      font-size: 13px;
    }

    .mi-user {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      border: 0;
      background: transparent;
      text-align: left;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
    }

    .mi-user:hover,
    .mi-user--active {
      background: var(--mi-user-active-bg, #eef2ff);
    }

    .mi-user-avatar {
      width: var(--mi-avatar-size, 28px);
      height: var(--mi-avatar-size, 28px);
      border-radius: 50%;
      background: #e5e7eb;
      color: #374151;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      overflow: hidden;
      flex-shrink: 0;
    }

    .mi-user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .mi-user-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .mi-user-name {
      font-size: 13px;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mi-user-email {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class MentionPickerComponent {
  @Input() users: MentionUser[] = [];
  @Input() loading = false;
  @Input() emptyText = 'No users found';
  @Input() clientFilter = true;

  @Output() readonly selectionChanged = new EventEmitter<MentionUser>();
  @Output() readonly openChanged = new EventEmitter<boolean>();

  private searchQuery = '';
  activeIndex = 0;

  @Input() set search(value: string) {
    this.searchQuery = value ?? '';
    this.activeIndex = 0;
  }

  get filteredUsers(): MentionUser[] {
    if (!this.clientFilter) {
      return this.users;
    }
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.users;
    }
    return this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) || (user.email?.toLowerCase().includes(q) ?? false)
    );
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const items = this.filteredUsers;
    if (!items.length) {
      if (event.key === 'Escape') {
        this.close();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.select(items[this.activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  select(user: MentionUser): void {
    this.selectionChanged.emit(user);
  }

  close(): void {
    this.openChanged.emit(false);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
