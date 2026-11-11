import type { DefineComponent } from 'vue';
import type {
  MentionContentSection,
  MentionSection,
  MentionSectionType,
  MentionUser,
  TextSection,
} from './models';

export type {
  MentionContentSection,
  MentionSection,
  MentionSectionType,
  MentionUser,
  TextSection,
};

export declare const MentionInput: DefineComponent<
  {
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
    style?: Record<string, string>;
  },
  {},
  unknown
>;

export declare const MentionPicker: DefineComponent<object, object, unknown>;
