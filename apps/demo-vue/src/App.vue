<script setup lang="ts">
import { computed, ref } from 'vue';
import { MentionInput, type MentionContentSection, type MentionUser } from '@mojsica/vue-mention-input';
import '@mojsica/vue-mention-input/styles.css';

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
  v-model="sections"
  :users="users"
  :loading="loading"
  :client-filter="false"
  @mention-query-change="onQuery"
/>`;

const sections = ref<MentionContentSection[]>([]);
const users = ref(ALL_USERS);
const loading = ref(false);
const branded = ref(false);
const lastQuery = ref('');
const lastSelected = ref<MentionUser | null>(null);

const json = computed(() => JSON.stringify(sections.value, null, 2));

function onQuery(query: string) {
  lastQuery.value = query;
  loading.value = true;
  window.setTimeout(() => {
    const q = query.trim().toLowerCase();
    users.value = !q
      ? ALL_USERS
      : ALL_USERS.filter(
          (user) =>
            user.name.toLowerCase().includes(q) ||
            (user.email?.toLowerCase().includes(q) ?? false)
        );
    loading.value = false;
  }, 150);
}
</script>

<template>
  <main class="demo">
    <header class="demo__header">
      <h1>@mojsica/vue-mention-input</h1>
      <p>
        Contenteditable <code>@</code> mentions with chips and structured
        <code>MentionContentSection[]</code> value.
      </p>
    </header>

    <section class="demo__panel">
      <div class="demo__panel-head">
        <h2>Playground</h2>
        <label class="demo__toggle">
          <input v-model="branded" type="checkbox" />
          Remap CSS variables
        </label>
      </div>
      <div class="demo__editor" :class="{ 'demo__editor--branded': branded }">
        <MentionInput
          v-model="sections"
          :users="users"
          :loading="loading"
          :client-filter="false"
          placeholder="Write a message… use @ to mention"
          @mention-query-change="onQuery"
          @mention-selected="lastSelected = $event"
        />
      </div>
      <p class="demo__hint">
        One default Material-like look. The checkbox only remaps <code>--mi-*</code> tokens.
      </p>
    </section>

    <section class="demo__panel">
      <h2>Live value</h2>
      <pre class="demo__json">{{ json }}</pre>
      <p class="demo__meta">
        Query: <code>{{ lastQuery || '(none)' }}</code>
        <template v-if="lastSelected">
          · Selected: <code>{{ lastSelected.name }}</code>
        </template>
      </p>
    </section>

    <section class="demo__panel">
      <h2>Install</h2>
      <pre class="demo__code">npm i @mojsica/vue-mention-input</pre>
      <pre class="demo__code">{{ USAGE }}</pre>
    </section>
  </main>
</template>
