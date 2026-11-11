import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import {
  backSpaceFixedBehavior,
  buildContenteditableNodes,
  insertNodeAtCaretSync,
  insertNodesAtCaretPosition,
  moveCaretAfterNode,
  moveCaretToEnd,
  parseContenteditable,
} from './mention-helpers';
import { MentionPickerComponent } from './mention-picker.component';
import { MentionContentSection, MentionUser } from './models';

@Component({
  selector: 'lib-mention-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MentionInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="mi-editor-wrap" [class.mi-editor-wrap--disabled]="disabled">
      @if (placeholder && showPlaceholder) {
        <span class="mi-placeholder">{{ placeholder }}</span>
      }
      <p
        class="mi-editor"
        [class.mi-editor--error]="hasError"
        [attr.contenteditable]="!disabled"
      ></p>
      @if (hasError && errorMessage) {
        <span class="mi-message mi-message--error">{{ errorMessage }}</span>
      } @else if (helperText) {
        <span class="mi-message">{{ helperText }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      --mi-editor-bg: #fff;
      --mi-editor-border: #d1d5db;
      --mi-editor-radius: 8px;
      --mi-editor-min-height: 88px;
      --mi-placeholder-color: #9ca3af;
      --mi-mention-bg: #e0e7ff;
      --mi-mention-color: #3730a3;
    }

    .mi-editor-wrap {
      position: relative;
    }

    .mi-editor-wrap--disabled {
      opacity: 0.65;
      pointer-events: none;
    }

    .mi-placeholder {
      position: absolute;
      top: 12px;
      left: 14px;
      color: var(--mi-placeholder-color);
      pointer-events: none;
      user-select: none;
      z-index: 1;
    }

    .mi-editor {
      min-height: var(--mi-editor-min-height);
      max-height: 180px;
      overflow: auto;
      margin: 0;
      padding: 12px 14px;
      border: 1px solid var(--mi-editor-border);
      border-radius: var(--mi-editor-radius);
      background: var(--mi-editor-bg);
      outline: none;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .mi-editor:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .mi-editor--error {
      border-color: #ef4444;
    }

    .mi-editor ::ng-deep > * {
      pointer-events: none;
    }

    .mi-editor ::ng-deep .mi-mention {
      pointer-events: none;
      background: var(--mi-mention-bg);
      color: var(--mi-mention-color);
      border-radius: 4px;
      padding: 0 2px;
      font-weight: 500;
    }

    .mi-editor ::ng-deep lib-mention-picker {
      pointer-events: auto;
    }

    .mi-message {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .mi-message--error {
      color: #ef4444;
    }
  `,
})
export class MentionInputComponent
  implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  @Input() placeholder = 'Write something… use @ to mention';
  @Input() helperText = '';
  @Input() disabled = false;
  @Input() hasError = false;
  @Input() errorMessage: string | null = '';
  @Input() users: MentionUser[] = [];
  @Input() loading = false;
  @Input() clientFilter = true;
  @Input() emptyText = 'No users found';

  @Output() readonly mentionQueryChange = new EventEmitter<string>();
  @Output() readonly mentionSelected = new EventEmitter<MentionUser>();
  @Output() readonly mentionOpenChange = new EventEmitter<boolean>();
  @Output() readonly valueChange = new EventEmitter<MentionContentSection[]>();

  showPlaceholder = true;

  private removeListeners: Array<() => void> = [];
  private activePickerRef: ComponentRef<MentionPickerComponent> | null = null;
  private onChange: (value: MentionContentSection[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly destroyRef: DestroyRef,
    private readonly renderer2: Renderer2,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef
  ) {}

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const editableElement = this.#editable();
    if (!editableElement || !event.clipboardData) {
      return;
    }

    const pastedHtml =
      event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');
    if (!pastedHtml) {
      return;
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = pastedHtml;
    const sections = parseContenteditable(tempElement);
    const nodes = buildContenteditableNodes(sections);
    insertNodesAtCaretPosition(nodes);
    this.#notifyChange();
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === '@') {
      event.preventDefault();
      this.#openMention();
      return;
    }

    if (event.key === 'Backspace') {
      const draft = this.elRef.nativeElement.querySelector(
        'span.mi-mention-draft[contenteditable="true"]'
      ) as HTMLElement | null;
      // Only when the draft is exactly "@" — deleting the trigger closes the picker
      if (draft && draft.innerText === '@') {
        event.preventDefault();
        this.activePickerRef?.destroy();
        this.#unwrapElementToText(draft);
        this.mentionOpenChange.emit(false);
        this.#notifyChange();
        return;
      }
      backSpaceFixedBehavior(event);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['users'] || changes['loading']) && this.activePickerRef) {
      this.activePickerRef.setInput('users', this.users);
      this.activePickerRef.setInput('loading', this.loading);
    }
  }

  ngAfterViewInit(): void {
    const removeListener = this.renderer2.listen(this.elRef.nativeElement, 'input', () => {
      this.#notifyChange();
    });
    this.removeListeners.push(removeListener);
  }

  ngOnDestroy(): void {
    this.removeListeners.forEach((remove) => remove());
  }

  writeValue(sections: MentionContentSection[] | null): void {
    const editableElement = this.#editable();
    if (!editableElement) {
      return;
    }
    const nodes = buildContenteditableNodes(sections ?? []);
    editableElement.innerHTML = '';
    nodes.forEach((node) => editableElement.appendChild(node));
    this.#updatePlaceholder();
  }

  registerOnChange(fn: (value: MentionContentSection[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  #openMention(): void {
    const spanElement: HTMLElement = this.renderer2.createElement('span');
    this.renderer2.addClass(spanElement, 'mi-mention-draft');
    this.renderer2.setAttribute(spanElement, 'contenteditable', 'true');
    this.renderer2.setStyle(spanElement, 'position', 'relative');
    this.renderer2.setStyle(spanElement, 'display', 'inline-block');
    const prefix = this.renderer2.createText('@');
    this.renderer2.appendChild(spanElement, prefix);

    // Insert draft synchronously (and we already preventDefault on '@')
    insertNodeAtCaretSync(spanElement);
    moveCaretToEnd(spanElement);

    const componentRef = this.viewContainerRef.createComponent(MentionPickerComponent);
    this.activePickerRef = componentRef;
    componentRef.setInput('users', this.users);
    componentRef.setInput('loading', this.loading);
    componentRef.setInput('clientFilter', this.clientFilter);
    componentRef.setInput('emptyText', this.emptyText);
    componentRef.setInput('search', '');

    const destroy$ = new Subject<void>();
    let draftReady = true;

    // Render picker on document.body with position:fixed so overflow on .mi-editor cannot clip it
    this.renderer2.appendChild(document.body, componentRef.location.nativeElement);
    this.#positionPicker(componentRef, spanElement);
    this.mentionOpenChange.emit(true);
    this.mentionQueryChange.emit('');

    const reposition = () => this.#positionPicker(componentRef, spanElement);
    const removeResizeListener = this.renderer2.listen('window', 'resize', reposition);
    window.addEventListener('scroll', reposition, true);

    const closeMentionDraft = () => {
      if (!draftReady) {
        return;
      }
      draftReady = false;
      if (this.activePickerRef === componentRef) {
        componentRef.destroy();
      }
      if (spanElement.isConnected) {
        this.#unwrapElementToText(spanElement);
      }
      this.mentionOpenChange.emit(false);
      this.#notifyChange();
    };

    const removeSearchListener = this.renderer2.listen(this.elRef.nativeElement, 'input', () => {
      if (!draftReady || this.activePickerRef !== componentRef) {
        return;
      }

      const editableElement = this.elRef.nativeElement.querySelector(
        'span.mi-mention-draft[contenteditable="true"]'
      );

      // @ deleted or browser removed the draft span — hide picker
      if (!(editableElement instanceof HTMLElement)) {
        closeMentionDraft();
        return;
      }

      const text = editableElement.innerText ?? '';
      if (!text.startsWith('@')) {
        closeMentionDraft();
        return;
      }

      const query = text.slice(1);
      componentRef.setInput('search', query);
      componentRef.setInput('users', this.users);
      componentRef.setInput('loading', this.loading);
      this.mentionQueryChange.emit(query);
      this.#positionPicker(componentRef, spanElement);
    });

    componentRef.onDestroy(() => {
      draftReady = false;
      if (this.activePickerRef === componentRef) {
        this.activePickerRef = null;
      }
      destroy$.next();
      destroy$.complete();
      removeSearchListener();
      removeResizeListener();
      window.removeEventListener('scroll', reposition, true);
      const pickerEl = componentRef.location.nativeElement as HTMLElement;
      pickerEl.parentElement?.removeChild(pickerEl);
    });

    componentRef.instance.selectionChanged
      .pipe(
        tap((user) => {
          this.renderer2.setProperty(spanElement, 'innerHTML', '');
          this.renderer2.removeClass(spanElement, 'mi-mention-draft');
          this.renderer2.addClass(spanElement, 'mi-mention');
          this.renderer2.setAttribute(spanElement, 'contenteditable', 'false');
          this.renderer2.setAttribute(spanElement, 'userId', user.id);
          this.renderer2.removeStyle(spanElement, 'position');
          this.renderer2.removeStyle(spanElement, 'display');
          const text = this.renderer2.createText(`@${user.name}`);
          this.renderer2.appendChild(spanElement, text);
          moveCaretAfterNode(spanElement);
          this.mentionSelected.emit(user);
          this.mentionOpenChange.emit(false);
          this.#notifyChange();
          componentRef.destroy();
        }),
        takeUntil(destroy$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    componentRef.instance.openChanged
      .pipe(
        tap((open) => {
          if (!open) {
            componentRef.destroy();
            this.#unwrapElementToText(spanElement);
            this.mentionOpenChange.emit(false);
            this.#notifyChange();
          }
        }),
        takeUntil(destroy$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  #positionPicker(
    componentRef: ComponentRef<MentionPickerComponent>,
    anchor: HTMLElement
  ): void {
    const rect = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 260);
    const top = Math.min(rect.bottom + 4, window.innerHeight - 16);
    componentRef.instance.setPosition(left, Math.max(8, top));
  }

  #notifyChange(): void {
    const editableElement = this.#editable();
    if (!editableElement) {
      return;
    }
    const sections = parseContenteditable(editableElement);
    this.onChange(sections);
    this.valueChange.emit(sections);
    this.onTouched();
    this.#updatePlaceholder(sections);
  }

  #updatePlaceholder(sections?: MentionContentSection[]): void {
    const value = sections ?? parseContenteditable(this.#editable() ?? document.createElement('p'));
    this.showPlaceholder = value.length === 0;
    this.cdr.markForCheck();
  }

  #editable(): HTMLElement | null {
    return this.elRef.nativeElement.querySelector('.mi-editor');
  }

  #unwrapElementToText(spanElement: HTMLElement): void {
    const parent = spanElement.parentNode;
    if (!parent) {
      return;
    }
    const originalText = spanElement.childNodes[0]?.textContent?.trim() || '';
    const textNode = this.renderer2.createText(originalText);
    this.renderer2.insertBefore(parent, textNode, spanElement);
    this.renderer2.removeChild(parent, spanElement);
  }
}
