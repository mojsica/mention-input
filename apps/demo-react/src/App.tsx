import { useMemo, useState } from 'react';
import {
  MentionInput,
  type MentionContentSection,
  type MentionUser,
} from '@mojsica/react-mention-input';
import '@mojsica/react-mention-input/styles.css';

const ALL_USERS: MentionUser[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ada',
  },
  {
    id: '2',
    name: 'Alan Turing',
    email: 'alan@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alan',
  },
  {
    id: '3',
    name: 'Grace Hopper',
    email: 'grace@example.com',
  },
  {
    id: '4',
    name: 'Katherine Johnson',
    email: 'katherine@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Katherine',
  },
];

const USAGE = `<MentionInput
  value={sections}
  onChange={setSections}
  users={users}
  loading={loading}
  clientFilter={false}
  onMentionQueryChange={onQuery}
/>`;

export function App() {
  const [sections, setSections] = useState<MentionContentSection[]>([]);
  const [users, setUsers] = useState(ALL_USERS);
  const [loading, setLoading] = useState(false);
  const [branded, setBranded] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [lastSelected, setLastSelected] = useState<MentionUser | null>(null);

  const onQuery = (query: string) => {
    setLastQuery(query);
    setLoading(true);
    window.setTimeout(() => {
      const q = query.trim().toLowerCase();
      setUsers(
        !q
          ? ALL_USERS
          : ALL_USERS.filter(
              (user) =>
                user.name.toLowerCase().includes(q) ||
                (user.email?.toLowerCase().includes(q) ?? false)
            )
      );
      setLoading(false);
    }, 150);
  };

  const json = useMemo(() => JSON.stringify(sections, null, 2), [sections]);

  return (
    <main className="demo">
      <header className="demo__header">
        <h1>@mojsica/react-mention-input</h1>
        <p>
          Contenteditable <code>@</code> mentions with chips and structured{' '}
          <code>MentionContentSection[]</code> value.
        </p>
      </header>

      <section className="demo__panel">
        <div className="demo__panel-head">
          <h2>Playground</h2>
          <label className="demo__toggle">
            <input
              type="checkbox"
              checked={branded}
              onChange={() => setBranded((v) => !v)}
            />
            Remap CSS variables
          </label>
        </div>
        <div className={branded ? 'demo__editor demo__editor--branded' : 'demo__editor'}>
          <MentionInput
            value={sections}
            onChange={setSections}
            users={users}
            loading={loading}
            clientFilter={false}
            placeholder="Write a message… use @ to mention"
            onMentionQueryChange={onQuery}
            onMentionSelected={setLastSelected}
          />
        </div>
        <p className="demo__hint">
          One default Material-like look. The checkbox only remaps <code>--mi-*</code> tokens.
        </p>
      </section>

      <section className="demo__panel">
        <h2>Live value</h2>
        <pre className="demo__json">{json}</pre>
        <p className="demo__meta">
          Query: <code>{lastQuery || '(none)'}</code>
          {lastSelected ? (
            <>
              {' '}
              · Selected: <code>{lastSelected.name}</code>
            </>
          ) : null}
        </p>
      </section>

      <section className="demo__panel">
        <h2>Install</h2>
        <pre className="demo__code">npm i @mojsica/react-mention-input</pre>
        <pre className="demo__code">{USAGE}</pre>
      </section>
    </main>
  );
}
