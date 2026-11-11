/*
 * Public API Surface of angular-mention-input
 */

export { MentionInputComponent } from './lib/mention-input.component';
export { MentionPickerComponent } from './lib/mention-picker.component';
export {
  backSpaceFixedBehavior,
  buildContenteditableNodes,
  insertNodeAtCaret,
  insertNodesAtCaretPosition,
  moveCaretAfterNode,
  moveCaretToEnd,
  parseContenteditable,
  sectionsToPlainText,
} from './lib/mention-helpers';
export type {
  MentionContentSection,
  MentionSection,
  MentionSectionType,
  MentionUser,
  TextSection,
} from './lib/models';
