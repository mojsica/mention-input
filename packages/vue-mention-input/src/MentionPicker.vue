<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { MentionUser } from './models';

const props = withDefaults(
  defineProps<{
    users: MentionUser[];
    search: string;
    loading?: boolean;
    clientFilter?: boolean;
    emptyText?: string;
    left: number;
    top: number;
  }>(),
  {
    loading: false,
    clientFilter: true,
    emptyText: 'No users found',
  }
);

const emit = defineEmits<{
  select: [user: MentionUser];
  close: [];
}>();

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const filteredUsers = computed(() => {
  if (!props.clientFilter) {
    return props.users;
  }
  const q = props.search.trim().toLowerCase();
  if (!q) {
    return props.users;
  }
  return props.users.filter(
    (user) =>
      user.name.toLowerCase().includes(q) || (user.email?.toLowerCase().includes(q) ?? false)
  );
});

const activeIndex = ref(0);

watch(
  () => [props.search, filteredUsers.value.length] as const,
  () => {
    activeIndex.value = 0;
  }
);

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }
  if (!filteredUsers.value.length) {
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % filteredUsers.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value =
      (activeIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    emit('select', filteredUsers.value[activeIndex.value]);
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown));
onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
</script>

<template>
  <div class="mi-picker-host" :style="{ left: `${left}px`, top: `${top}px` }" role="listbox">
    <div class="mi-picker">
      <div v-if="loading" class="mi-picker__status">Loading…</div>
      <div v-else-if="filteredUsers.length === 0" class="mi-picker__status">{{ emptyText }}</div>
      <template v-else>
        <button
          v-for="(user, i) in filteredUsers"
          :key="user.id"
          type="button"
          class="mi-user"
          :class="{ 'mi-user--active': i === activeIndex }"
          role="option"
          :aria-selected="i === activeIndex"
          @mousedown.prevent="emit('select', user)"
        >
          <span class="mi-user-avatar" aria-hidden="true">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" />
            <template v-else>{{ initials(user.name) }}</template>
          </span>
          <span class="mi-user-meta">
            <span class="mi-user-name">{{ user.name }}</span>
            <span v-if="user.email" class="mi-user-email">{{ user.email }}</span>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>
