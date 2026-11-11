import { useEffect, useMemo, useState } from 'react';
import type { MentionUser } from './models';

export type MentionPickerProps = {
  users: MentionUser[];
  search: string;
  loading?: boolean;
  clientFilter?: boolean;
  emptyText?: string;
  left: number;
  top: number;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function MentionPicker({
  users,
  search,
  loading = false,
  clientFilter = true,
  emptyText = 'No users found',
  left,
  top,
  onSelect,
  onClose,
}: MentionPickerProps) {
  const filteredUsers = useMemo(() => {
    if (!clientFilter) {
      return users;
    }
    const q = search.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) || (user.email?.toLowerCase().includes(q) ?? false)
    );
  }, [users, search, clientFilter]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [search, filteredUsers.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (!filteredUsers.length) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredUsers.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onSelect(filteredUsers[activeIndex]);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [filteredUsers, activeIndex, onClose, onSelect]);

  return (
    <div className="mi-picker-host" style={{ left, top }} role="listbox">
      <div className="mi-picker">
        {loading ? (
          <div className="mi-picker__status">Loading…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="mi-picker__status">{emptyText}</div>
        ) : (
          filteredUsers.map((user, i) => (
            <button
              key={user.id}
              type="button"
              className={`mi-user${i === activeIndex ? ' mi-user--active' : ''}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(user);
              }}
            >
              <span className="mi-user-avatar" aria-hidden="true">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}
              </span>
              <span className="mi-user-meta">
                <span className="mi-user-name">{user.name}</span>
                {user.email ? <span className="mi-user-email">{user.email}</span> : null}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
