import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
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
import { MentionPicker } from './MentionPicker';
import type { MentionContentSection, MentionUser } from './models';
import './styles.css';

export type MentionInputProps = {
  value?: MentionContentSection[];
  defaultValue?: MentionContentSection[];
  onChange?: (value: MentionContentSection[]) => void;
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
  onMentionQueryChange?: (query: string) => void;
  onMentionSelected?: (user: MentionUser) => void;
  onMentionOpenChange?: (open: boolean) => void;
};

type DraftState = {
  span: HTMLSpanElement;
  search: string;
  left: number;
  top: number;
};

function sectionsEqual(a: MentionContentSection[], b: MentionContentSection[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function MentionInput({
  value,
  defaultValue = [],
  onChange,
  users = [],
  loading = false,
  clientFilter = true,
  emptyText = 'No users found',
  placeholder = 'Write something… use @ to mention',
  disabled = false,
  hasError = false,
  errorMessage = '',
  helperText = '',
  className,
  style,
  onMentionQueryChange,
  onMentionSelected,
  onMentionOpenChange,
}: MentionInputProps) {
  const editorRef = useRef<HTMLParagraphElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const draftReadyRef = useRef(false);
  const lastEmittedRef = useRef<MentionContentSection[]>([]);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const controlled = value !== undefined;

  const syncPlaceholder = useCallback((sections: MentionContentSection[], editor: HTMLElement) => {
    const hasDraft = !!editor.querySelector(`span.${MENTION_DRAFT_CLASS}`);
    const hasVisibleText = !!(editor.textContent?.replace(/\u00A0/g, ' ').trim());
    setShowPlaceholder(sections.length === 0 && !hasDraft && !hasVisibleText);
  }, []);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const sections = parseContenteditable(editor);
    syncPlaceholder(sections, editor);
    if (sectionsEqual(sections, lastEmittedRef.current)) {
      return;
    }
    lastEmittedRef.current = sections;
    onChange?.(sections);
  }, [onChange, syncPlaceholder]);

  const writeSections = useCallback(
    (sections: MentionContentSection[]) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }
      const nodes = buildContenteditableNodes(sections);
      editor.innerHTML = '';
      nodes.forEach((node) => editor.appendChild(node));
      lastEmittedRef.current = sections;
      syncPlaceholder(sections, editor);
    },
    [syncPlaceholder]
  );

  useLayoutEffect(() => {
    if (!controlled) {
      writeSections(defaultValue);
      return;
    }
    if (!sectionsEqual(value ?? [], lastEmittedRef.current)) {
      writeSections(value ?? []);
    }
  }, [controlled, value, defaultValue, writeSections]);

  const positionDraft = useCallback((span: HTMLSpanElement) => {
    const rect = span.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 260);
    const top = Math.min(rect.bottom + 4, window.innerHeight - 16);
    return { left, top: Math.max(8, top) };
  }, []);

  const closeDraft = useCallback(
    (options?: { unwrap?: boolean }) => {
      if (!draftReadyRef.current) {
        return;
      }
      draftReadyRef.current = false;
      const span = draft?.span;
      setDraft(null);
      onMentionOpenChange?.(false);
      if (options?.unwrap !== false && span?.isConnected && span.classList.contains(MENTION_DRAFT_CLASS)) {
        unwrapElementToText(span);
      }
      emitChange();
    },
    [draft, emitChange, onMentionOpenChange]
  );

  const openMention = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || disabled) {
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
    draftReadyRef.current = true;
    const pos = positionDraft(span);
    setDraft({ span, search: '', ...pos });
    setShowPlaceholder(false);
    onMentionOpenChange?.(true);
    onMentionQueryChange?.('');
  }, [disabled, onMentionOpenChange, onMentionQueryChange, positionDraft]);

  const selectUser = useCallback(
    (user: MentionUser) => {
      const span = draft?.span;
      if (!span) {
        return;
      }
      draftReadyRef.current = false;
      span.innerHTML = '';
      span.classList.remove(MENTION_DRAFT_CLASS);
      span.classList.add(MENTION_CLASS);
      span.contentEditable = 'false';
      span.setAttribute('userId', user.id);
      span.style.position = '';
      span.style.display = '';
      span.appendChild(document.createTextNode(`@${user.name}`));
      moveCaretAfterNode(span);
      setDraft(null);
      onMentionSelected?.(user);
      onMentionOpenChange?.(false);
      emitChange();
    },
    [draft, emitChange, onMentionOpenChange, onMentionSelected]
  );

  useEffect(() => {
    if (!draft) {
      return;
    }

    const onInput = () => {
      if (!draftReadyRef.current) {
        return;
      }
      if (!isSelectionInside(draft.span)) {
        closeDraft();
        return;
      }
      const editor = editorRef.current;
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
      setDraft({ span: live, search: query, ...pos });
      onMentionQueryChange?.(query);
    };

    const onSelectionChange = () => {
      if (!draftReadyRef.current || !draft.span.isConnected) {
        return;
      }
      const selection = window.getSelection();
      if (!selection?.rangeCount || !selection.anchorNode) {
        return;
      }
      if (!isSelectionInside(draft.span)) {
        closeDraft();
      }
    };

    const onReposition = () => {
      if (!draft.span.isConnected) {
        return;
      }
      const pos = positionDraft(draft.span);
      setDraft((prev) => (prev ? { ...prev, ...pos } : prev));
    };

    const editor = editorRef.current;
    editor?.addEventListener('input', onInput);
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      editor?.removeEventListener('input', onInput);
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [draft, closeDraft, onMentionQueryChange, positionDraft]);

  const onKeyDown = (event: KeyboardEvent<HTMLParagraphElement>) => {
    if (event.key === '@') {
      event.preventDefault();
      openMention();
      return;
    }
    if (event.key === 'Backspace') {
      const live = editorRef.current?.querySelector(
        `span.${MENTION_DRAFT_CLASS}[contenteditable="true"]`
      ) as HTMLSpanElement | null;
      if (live && live.innerText === '@') {
        event.preventDefault();
        draftReadyRef.current = false;
        setDraft(null);
        onMentionOpenChange?.(false);
        unwrapElementToText(live);
        emitChange();
        return;
      }
      backSpaceFixedBehavior(event.nativeEvent);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLParagraphElement>) => {
    event.preventDefault();
    const pasted =
      event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');
    if (!pasted) {
      return;
    }
    const temp = document.createElement('div');
    temp.innerHTML = pasted;
    const sections = parseContenteditable(temp);
    const nodes = buildContenteditableNodes(sections);
    insertNodesAtCaretPosition(nodes);
    emitChange();
  };

  return (
    <div
      ref={wrapRef}
      className={`mi-editor-wrap${disabled ? ' mi-editor-wrap--disabled' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={style}
    >
      {placeholder && showPlaceholder ? <span className="mi-placeholder">{placeholder}</span> : null}
      <p
        ref={editorRef}
        className={`mi-editor${hasError ? ' mi-editor--error' : ''}`}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {hasError && errorMessage ? (
        <span className="mi-message mi-message--error">{errorMessage}</span>
      ) : helperText ? (
        <span className="mi-message">{helperText}</span>
      ) : null}

      {draft
        ? createPortal(
            <MentionPicker
              users={users}
              search={draft.search}
              loading={loading}
              clientFilter={clientFilter}
              emptyText={emptyText}
              left={draft.left}
              top={draft.top}
              onSelect={selectUser}
              onClose={() => closeDraft()}
            />,
            document.body
          )
        : null}
    </div>
  );
}
