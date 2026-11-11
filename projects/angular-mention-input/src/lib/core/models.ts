export type MentionSectionType = 'text' | 'mention';

export interface TextSection {
  type: 'text';
  message: string;
}

export interface MentionSection {
  type: 'mention';
  userId: string;
  userName: string;
  email?: string;
}

export type MentionContentSection = TextSection | MentionSection;

export interface MentionUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}
