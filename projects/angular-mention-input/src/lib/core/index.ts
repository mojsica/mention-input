export type {
  MentionContentSection,
  MentionSection,
  MentionSectionType,
  MentionUser,
  TextSection,
} from './models';

export {
  MENTION_CLASS,
  MENTION_DRAFT_CLASS,
  backSpaceFixedBehavior,
  buildContenteditableNodes,
  insertNodeAtCaret,
  insertNodeAtCaretSync,
  insertNodesAtCaretPosition,
  isSelectionInside,
  moveCaretAfterNode,
  moveCaretToEnd,
  parseContenteditable,
  sectionsToPlainText,
  unwrapElementToText,
} from './helpers';
