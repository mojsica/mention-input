import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MentionContentSection,
  MentionInputComponent,
  MentionUser,
} from 'angular-mention-input';

@Component({
  selector: 'app-root',
  imports: [MentionInputComponent, ReactiveFormsModule, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly users: MentionUser[] = [
    { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: '2', name: 'Alan Turing', email: 'alan@example.com' },
    { id: '3', name: 'Grace Hopper', email: 'grace@example.com' },
    { id: '4', name: 'Katherine Johnson', email: 'katherine@example.com' },
  ];

  readonly sections = new FormControl<MentionContentSection[]>([], { nonNullable: true });

  filteredUsers = this.users;
  loading = false;
  lastSelected: MentionUser | null = null;
  lastQuery = '';

  onQuery(query: string): void {
    this.lastQuery = query;
    // Demo of async-from-outside: parent filters (or would call an API).
    this.loading = true;
    window.setTimeout(() => {
      const q = query.trim().toLowerCase();
      this.filteredUsers = !q
        ? this.users
        : this.users.filter(
            (user) =>
              user.name.toLowerCase().includes(q) ||
              (user.email?.toLowerCase().includes(q) ?? false)
          );
      this.loading = false;
    }, 150);
  }

  onSelected(user: MentionUser): void {
    this.lastSelected = user;
  }
}
