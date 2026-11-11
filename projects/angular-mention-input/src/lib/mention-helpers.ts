import { MentionContentSection } from './models';

const MENTION_CLASS = 'mi-mention';

export function insertNodesAtCaretPosition(nodes: Node[]): void {
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);
  if (!range.collapsed) {
    range.deleteContents();
  }

  let lastInsertedNode: Node | null = null;
  nodes.forEach((node) => {
    range.insertNode(node);
    lastInsertedNode = node;
    range.setStartAfter(node);
  });

  if (lastInsertedNode) {
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function buildContenteditableNodes(sections: MentionContentSection[]): Node[] {
  const nodes: Node[] = [];

  sections.forEach((section) => {
    if (section.type === 'text') {
      const parts = section.message.split('\n');
      parts.forEach((part, index) => {
        if (part) {
          nodes.push(document.createTextNode(part));
        }
        if (index < parts.length - 1) {
          nodes.push(document.createElement('br'));
        }
      });
    }

    if (section.type === 'mention') {
      const span = document.createElement('span');
      span.classList.add(MENTION_CLASS);
      span.setAttribute('contenteditable', 'false');
      span.setAttribute('userId', section.userId || '');
      span.textContent = ` @${section.userName} `;
      nodes.push(span);
    }
  });

  return nodes;
}

export function parseContenteditable(editableElement: HTMLElement): MentionContentSection[] {
  const sanitizedEditableElement = sanitizeEditableElement(editableElement);
  const result: MentionContentSection[] = [];

  if (
    sanitizedEditableElement.childNodes.length === 1 &&
    (editableElement.childNodes[0] as HTMLElement)?.tagName === 'BR'
  ) {
    return result;
  }

  sanitizedEditableElement.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent?.replace(/\u00A0/g, ' ');
      if (textContent?.trim()) {
        result.push({ type: 'text', message: textContent });
      }
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.classList.contains(MENTION_CLASS) || element.classList.contains('tag-wrap')) {
        const userId = element.getAttribute('userId') || '';
        const userName = element.textContent?.replace(/^\s*@/, '').trim() || '';
        result.push({ type: 'mention', userId, userName });
      } else if (element.tagName === 'BR') {
        result.push({ type: 'text', message: '\n' });
      }
    }
  });

  return result;
}

function sanitizeEditableElement(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  const recursivelyProcess = (node: Node) => {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const childElement = child as HTMLElement;
      const parent = childElement.parentElement;
      if (!parent) {
        continue;
      }

      const tag = childElement.tagName.toUpperCase();

      if (tag === 'DIV') {
        const divChildren = Array.from(childElement.childNodes);
        const isOnlyBrInside =
          divChildren.length === 1 &&
          divChildren[0].nodeType === Node.ELEMENT_NODE &&
          (divChildren[0] as HTMLElement).tagName === 'BR';

        if (isOnlyBrInside) {
          parent.insertBefore(divChildren[0], child);
          parent.removeChild(child);
          recursivelyProcess(parent);
        } else {
          const br = document.createElement('br');
          parent.insertBefore(br, child);
          while (child.firstChild) {
            parent.insertBefore(child.firstChild, child);
          }
          parent.removeChild(child);
          recursivelyProcess(parent);
        }
      } else if ((tag === 'SPAN' && !childElement.hasAttribute('userId')) || tag === 'FONT') {
        while (child.firstChild) {
          parent.insertBefore(child.firstChild, child);
        }
        parent.removeChild(child);
        recursivelyProcess(parent);
      } else if (
        tag === 'BR' ||
        (tag === 'SPAN' && childElement.hasAttribute('userId')) ||
        tag === 'LIB-MENTION-PICKER'
      ) {
        recursivelyProcess(child);
      } else {
        while (child.firstChild) {
          parent.insertBefore(child.firstChild, child);
        }
        parent.removeChild(child);
        recursivelyProcess(parent);
      }
    }
  };

  recursivelyProcess(clone);
  return clone;
}

export function backSpaceFixedBehavior(event: KeyboardEvent): void {
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);
  let nodeBefore = range.startContainer.childNodes[range.startOffset - 1];

  if (nodeBefore?.nodeName === 'BR') {
    nodeBefore = range.startContainer.childNodes[range.startOffset - 2];
  }

  if ((nodeBefore as HTMLElement)?.contentEditable === 'false') {
    event.preventDefault();
    nodeBefore.remove();
  }
}

export function moveCaretToEnd(editableElement: HTMLElement | null): void {
  const selection = window.getSelection();
  if (!editableElement || !selection?.rangeCount) {
    return;
  }

  requestAnimationFrame(() => {
    try {
      const newRange = document.createRange();
      newRange.selectNodeContents(editableElement);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startOffset > 0) {
          range.setStart(range.startContainer, range.startOffset - 1);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } catch {
      // ignore caret placement failures
    }
  });
}

export function moveCaretAfterNode(node: HTMLElement | null): void {
  if (!node) {
    return;
  }

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  requestAnimationFrame(() => {
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

export function insertNodeAtCaret(node: Node): void {
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return;
  }

  requestAnimationFrame(() => {
    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentElement;
    const isInsideEditableSpan =
      parentElement?.tagName === 'SPAN' && parentElement.getAttribute('contenteditable') === 'true';

    if (isInsideEditableSpan) {
      return;
    }

    range.setStart(range.startContainer, Math.max(range.startOffset - 1, 0));
    range.deleteContents();
    range.insertNode(node);
  });
}

export function sectionsToPlainText(sections: MentionContentSection[]): string {
  return sections
    .map((section) => (section.type === 'text' ? section.message : `@${section.userName}`))
    .join('');
}
