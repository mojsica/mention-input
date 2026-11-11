import { Component } from '@angular/core';
import { MentionInputComponent } from 'angular-mention-input';

@Component({
  selector: 'app-root',
  imports: [MentionInputComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
