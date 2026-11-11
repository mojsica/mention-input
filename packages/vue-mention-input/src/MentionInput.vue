<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import {
  MENTION_CLASS,
  MENTION_DRAFT_CLASS,
  backSpaceFixedBehavior,
  buildContenteditableNodes,
  insertNodeAtCaretSync,
  insertNodesAtCaretPosition,
  isSelectionInside,
  moveCaretAfterNode,
  moveCaretToEnd,
  parseContenteditable,
  unwrapElementToText,
} from '@mojsica/mention-core';
import MentionPicker from './MentionPicker.vue';
import type { MentionContentSection, MentionUser } from './models';
import './styles.css';

const props = withDefaults(
  defineProps<{
    modelValue?: MentionContentSection[];
    users?: MentionUser[];
    loading?: boolean;
    clientFilter?: boolean;
    emptyText?: string;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    errorMessage?: string | null;
    helperText?: string;
    className?: string;
    style?: CSSProperties;
  }>(),
  {
    modelValue: () => [],
    users: () => [],
    loading: false,
    clientFilter: true,
    emptyText: 'No users found',
    placeholder: 'Write something… use @ to mention',
    disabled: false,
    hasError: false,
    errorMessage: '',
    helperText: '',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: MentionContentSection[]];
  mentionQueryChange: [query: string];
  mentionSelected: [user: MentionUser];
  mentionOpenChange: [open: boolean];
}>();

type DraftState = {
  span: HTMLSpanElement;
  search: string;
  left: number;
  top: number;
};

function sectionsEqual(a: MentionContentSection[], b: MentionContentSection[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const editorRef = ref<HTMLParagraphElement | null>(null);
const draftReady = ref(false);
const draft = ref<DraftState | null>(null);
const showPlaceholder = ref(true);
const lastEmitted = ref<MentionContentSection[]>([]);

const wrapClass = computed(
  () =>
    `mi-editor-wrap${props.disabled ? ' mi-editor-wrap--disabled' : ''}${
      props.className ? ` ${props.className}` : ''
    }`
);

function syncPlaceholder(sections: MentionContentSection[], editor: HTMLElement) {
  const hasDraft = !!editor.querySelector(`span.${MENTION_DRAFT_CLASS}`);
  const hasVisibleText = !!(editor.textContent?.replace(/\u00A0/g, ' ').trim());
  showPlaceholder.value = sections.length === 0 && !hasDraft && !hasVisibleText;
}

function emitChange() {
  const editor = editorRef.value;
  if (!editor) {
    return;
  }
  const sections = parseContenteditable(editor);
  syncPlaceholder(sections, editor);
  if (sectionsEqual(sections, lastEmitted.value)) {
    return;
  }
  lastEmitted.value = sections;
  emit('update:modelValue', sections);
}

function writeSections(sections: MentionContentSection[]) {
  const editor = editorRef.value;
  if (!editor) {
    return;
  }
  const nodes = buildContenteditableNodes(sections);
  editor.innerHTML = '';
  nodes.forEach((node) => editor.appendChild(node));
  lastEmitted.value = sections;
  syncPlaceholder(sections, editor);
}

watch(
  () => props.modelValue,
  (value) => {
    if (!sectionsEqual(value ?? [], lastEmitted.value)) {
      writeSections(value ?? []);
    }
  },
  { deep: true, immediate: true }
);

function positionDraft(span: HTMLSpanElement) {
  const rect = span.getBoundingClientRect();
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - 260);
  const top = Math.min(rect.bottom + 4, window.innerHeight - 16);
  return { left, top: Math.max(8, top) };
}

function closeDraft(options?: { unwrap?: boolean }) {
  if (!draftReady.value) {
    return;
  }
  draftReady.value = false;
  const span = draft.value?.span;
  draft.value = null;
  emit('mentionOpenChange', false);
  if (
    options?.unwrap !== false &&
    span?.isConnected &&
    span.classList.contains(MENTION_DRAFT_CLASS)
  ) {
    unwrapElementToText(span);
  }
  emitChange();
  detachDraftListeners();
}

function openMention() {
  const editor = editorRef.value;
  if (!editor || props.disabled) {
    return;
  }

  const span = document.createElement('span');
  span.className = MENTION_DRAFT_CLASS;
  span.contentEditable = 'true';
  span.style.position = 'relative';
  span.style.display = 'inline-block';
  span.appendChild(document.createTextNode('@'));

  insertNodeAtCaretSync(span);
  moveCaretToEnd(span);
  draftReady.value = true;
  const pos = positionDraft(span);
  draft.value = { span, search: '', ...pos };
  showPlaceholder.value = false;
  emit('mentionOpenChange', true);
  emit('mentionQueryChange', '');
  nextTick(() => attachDraftListeners());
}

function selectUser(user: MentionUser) {
  const span = draft.value?.span;
  if (!span) {
    return;
  }
  draftReady.value = false;
  span.innerHTML = '';
  span.classList.remove(MENTION_DRAFT_CLASS);
  span.classList.add(MENTION_CLASS);
  span.contentEditable = 'false';
  span.setAttribute('userId', user.id);
  span.style.position = '';
  span.style.display = '';
  span.appendChild(document.createTextNode(`@${user.name}`));
  moveCaretAfterNode(span);
  draft.value = null;
  emit('mentionSelected', user);
  emit('mentionOpenChange', false);
  emitChange();
  detachDraftListeners();
}

let detachDraftListeners = () => {};

function attachDraftListeners() {
  detachDraftListeners();
  const current = draft.value;
  if (!current) {
    return;
  }

  const onInput = () => {
    if (!draftReady.value || !draft.value) {
      return;
    }
    if (!isSelectionInside(draft.value.span)) {
      closeDraft();
      return;
    }
    const editor = editorRef.value;
    const live = editor?.querySelector(
      `span.${MENTION_DRAFT_CLASS}[contenteditable="true"]`
    ) as HTMLSpanElement | null;
    if (!live) {
      closeDraft({ unwrap: false });
      return;
    }
    const text = live.innerText ?? '';
    if (!text.startsWith('@')) {
      closeDraft();
      return;
    }
    const query = text.slice(1);
    const pos = positionDraft(live);
    draft.value = { span: live, search: query, ...pos };
    emit('mentionQueryChange', query);
  };

  const onSelectionChange = () => {
    if (!draftReady.value || !draft.value?.span.isConnected) {
      return;
    }
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.anchorNode) {
      return;
    }
    if (!isSelectionInside(draft.value.span)) {
      closeDraft();
    }
  };

  const onReposition = () => {
    if (!draft.value?.span.isConnected) {
      return;
    }
    const pos = positionDraft(draft.value.span);
    draft.value = { ...draft.value, ...pos };
  };

  const editor = editorRef.value;
  editor?.addEventListener('input', onInput);
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('resize', onReposition);
  window.addEventListener('scroll', onReposition, true);

  detachDraftListeners = () => {
    editor?.removeEventListener('input', onInput);
    document.removeEventListener('selectionchange', onSelectionChange);
    window.removeEventListener('resize', onReposition);
    window.removeEventListener('scroll', onReposition, true);
    detachDraftListeners = () => {};
  };
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === '@') {
    event.preventDefault();
    openMention();
    return;
  }
  if (event.key === 'Backspace') {
    const live = editorRef.value?.querySelector(
      `span.${MENTION_DRAFT_CLASS}[contenteditable="true"]`
    ) as HTMLSpanElement | null;
    if (live && live.innerText === '@') {
      event.preventDefault();
      draftReady.value = false;
      draft.value = null;
      emit('mentionOpenChange', false);
      unwrapElementToText(live);
      emitChange();
      detachDraftListeners();
      return;
    }
    backSpaceFixedBehavior(event);
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasted =
    event.clipboardData?.getData('text/html') || event.clipboardData?.getData('text/plain');
  if (!pasted) {
    return;
  }
  const temp = document.createElement('div');
  temp.innerHTML = pasted;
  const sections = parseContenteditable(temp);
  const nodes = buildContenteditableNodes(sections);
  insertNodesAtCaretPosition(nodes);
  emitChange();
}

onBeforeUnmount(() => {
  detachDraftListeners();
});
</script>

<template>
  <div :class="wrapClass" :style="style">
    <span v-if="placeholder && showPlaceholder" class="mi-placeholder">{{ placeholder }}</span>
    <p
      ref="editorRef"
      class="mi-editor"
      :class="{ 'mi-editor--error': hasError }"
      :contenteditable="!disabled"
      @input="emitChange"
      @keydown="onKeyDown"
      @paste="onPaste"
    />
    <span v-if="hasError && errorMessage" class="mi-message mi-message--error">{{
      errorMessage
    }}</span>
    <span v-else-if="helperText" class="mi-message">{{ helperText }}</span>

    <Teleport to="body">
      <MentionPicker
        v-if="draft"
        :users="users"
        :search="draft.search"
        :loading="loading"
        :client-filter="clientFilter"
        :empty-text="emptyText"
        :left="draft.left"
        :top="draft.top"
        @select="selectUser"
        @close="closeDraft()"
      />
    </Teleport>
  </div>
</template>
