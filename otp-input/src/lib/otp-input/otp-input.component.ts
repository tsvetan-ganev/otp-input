import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  Signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { OtpInputState } from './otp-input-state.service';

@Component({
  selector: 'prbl-otp-input',
  standalone: true,
  providers: [OtpInputState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-test-id]': 'id()',
    '[attr.aria-disabled]': 'isDisabled()',
  },
  template: `
    <!-- groups and cells are projected here: -->
    <ng-content />

    <!-- the hidden text input backing the component -->
    <div class="input-wrapper">
      <input
        #textInput
        (input)="onInput($any($event))"
        (paste)="onPaste($event)"
        (keydown.arrowleft)="onLeft()"
        (keydown.arrowright)="onRight()"
        (keydown.backspace)="onDelete($event)"
        (focus)="onInputFocus()"
        (blur)="onBlur()"
        [attr.id]="id()"
        [attr.aria-label]="label()"
        [disabled]="isDisabled()"
        [inputMode]="inputMode()"
        type="one-time-code"
        autocomplete="one-time-code"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      position: relative;
      pointer-events: none;
      user-select: none;
      cursor: text;

      &[aria-disabled='true'] {
        filter: grayscale(0.75);
        opacity: 0.56;
      }
    }

    input[type='one-time-code'] {
      position: absolute;
      inset: 0px;
      width: 100%;
      height: 100%;
      display: flex;
      text-align: left;
      opacity: 0;
      pointer-events: all;
      background: transparent;
      caret-color: transparent;
      color: transparent;
      border: 0px solid transparent;
      outline: transparent solid 0px;
      box-shadow: none;
      line-height: 1;
      letter-spacing: -999px;
      font-variant-numeric: tabular-nums;
      font-family: ui-monospace, monospace;

      &:disabled {
        cursor: not-allowed;
      }
    }

    .input-wrapper {
      position: absolute;
      inset: 0;
    }
  `,
})
export class OtpInputComponent implements OnInit, ControlValueAccessor {
  private readonly otpInputService = inject(OtpInputState);
  private readonly ngControl = inject(NgControl, { optional: true });

  /**
   * The length of the OTP code.
   */
  public readonly codeLength = input.required<number>();

  /**
   * Regular expression which validates each entered character.
   * By default only digits can be entered.
   *
   * If you allow other characters, you should also change the {@link inputMode}.
   */
  public readonly pattern = input<RegExp>(OTP_INPUT_DIGIT_REGEXP);

  /**
   * Sets the `inputMode` for the underlying `input` element.
   * You can read more in [MDN's inputMode article](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inputMode).
   *
   * Use this in combination with {@link pattern}.
   *
   * @default 'numeric'
   */
  public readonly inputMode = input<string>('numeric');

  /**
   * `aria-label` for the input
   */
  public readonly label = input<string>();

  /**
   * `id` for the input.
   */
  public readonly id = input<string>(crypto.randomUUID());

  /**
   * Whether the input is disabled.
   *
   * Note: you should only use this if `[formControl]` is not attached.
   */
  public readonly disabled = input<boolean>();

  /**
   * Emits when all the required characters of the code were filled in.
   */
  public readonly codeEntered = output<string>();

  protected isDisabled = computed(() => this.otpInputService.isDisabled());

  private textInput: Signal<ElementRef<HTMLInputElement>> = viewChild.required(
    'textInput',
    {
      read: ElementRef,
    },
  );

  private onTouched: () => void = () => void 0;

  private onChange: (value: unknown) => void = () => void 0;

  public constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      // if `[formControl] or `[formControlName]` are attached,
      // use `formControl.disable()` method as source of truth,
      // otherwise use the `disabled` input signal
      if (!this.ngControl && typeof this.disabled() !== 'undefined') {
        this.otpInputService.toggleDisabled(Boolean(this.disabled()));
      }
    });
  }

  public ngOnInit(): void {
    this.otpInputService.initialize(this.codeLength());
  }

  public writeValue(code: unknown): void {
    const nativeTextInput = this.textInput().nativeElement;
    if (
      typeof code === 'string' &&
      code.length === this.codeLength() &&
      code.split('').every((char) => char.match(this.pattern()))
    ) {
      nativeTextInput.value = code;
      this.otpInputService.filledCharacters.set(code.split(''));
    } else if (!code) {
      nativeTextInput.value = '';
    }
  }

  public registerOnChange(fn: (_: unknown) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.otpInputService.toggleDisabled(isDisabled);
  }

  protected onInputFocus() {
    this.otpInputService.focusInputCell();
  }

  protected onInput($event: Event) {
    const inputEvent = $event as unknown as InputEvent;
    const inputEl = $event.target as HTMLInputElement;

    // validates if the character matches the provided pattern
    const char = inputEvent.data;
    if (!char || !this.pattern().test(char)) {
      inputEl.value = this.otpInputService.filledCharactersAsString();
      return;
    }

    if (
      this.otpInputService
        .filledCharacters()
        .at(this.otpInputService.selectedInputCell() ?? 0)
    ) {
      this.otpInputService.replaceCharacter(
        inputEvent.data,
        this.otpInputService.selectedInputCell() ?? 0,
      );
      this.otpInputService.focusNextCell();
    } else {
      this.otpInputService.pushCharacter(inputEvent.data);
    }

    const newValue = this.otpInputService.filledCharactersAsString();
    inputEl.value = newValue;

    // emit ControlValueAccessor changes
    if (newValue.length === this.codeLength()) {
      this.onChange(newValue);
      this.codeEntered.emit(newValue);
    } else {
      this.onChange('');
    }
  }

  protected onLeft() {
    // focus is guaranteed to be on the element
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentIndex = this.otpInputService.selectedInputCell()!;

    if (currentIndex <= 0 || typeof currentIndex === 'undefined') {
      return;
    }

    this.otpInputService.selectedInputCell.set(currentIndex - 1);
  }

  protected onRight() {
    // focus is guaranteed to be on the element
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentIndex = this.otpInputService.selectedInputCell()!;

    if (
      currentIndex >=
      Math.min(
        this.codeLength() - 1,
        this.otpInputService.filledCharacters().length,
      )
    ) {
      return;
    }

    this.otpInputService.selectedInputCell.set(currentIndex + 1);
  }

  /**
   * Handle pasting the OTP code.
   * The method sanitizes the clipboard text by removing all dashes and whitespaces
   * and by cutting all characters exceeding the {@link codeLength}.
   *
   * Pasting overrides **all** characters already entered by the user.
   */
  protected onPaste($event: ClipboardEvent) {
    const input = $event.target as unknown as HTMLInputElement;
    const text = $event.clipboardData?.getData('text');
    $event.preventDefault();

    if (typeof text !== 'string' || !text) {
      return;
    }

    const sanitizedCode = text
      .replace(/[-\s]/g, '')
      .substring(0, this.codeLength());

    // skip pasted text containing characters that do not match the pattern
    if (sanitizedCode.split('').some((char) => !char.match(this.pattern()))) {
      return;
    }

    this.otpInputService.clear();
    for (const digit of sanitizedCode) {
      this.otpInputService.pushCharacter(digit);
    }
    input.value = this.otpInputService.filledCharactersAsString();

    // all characters are filled in
    if (input.value.length === this.codeLength()) {
      // emit ControlValueAccessor change
      this.onChange(input.value);

      this.codeEntered.emit(input.value);
    }
  }

  protected onDelete($event: Event) {
    $event.preventDefault();
    const inputEl = $event.target as HTMLInputElement;

    // focus is guaranteed to be on the element
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentSelectedIndex = this.otpInputService.selectedInputCell()!;
    if (
      currentSelectedIndex === this.codeLength() - 1 &&
      this.otpInputService.filledCharacters().length === this.codeLength()
    ) {
      this.otpInputService.popCharacter();
    } else {
      let indexToRemove = currentSelectedIndex;
      const hasCharAtIndex = this.otpInputService
        .filledCharacters()
        .at(indexToRemove);

      // if there's no character at this index, delete the previous one
      if (!hasCharAtIndex) {
        indexToRemove -= 1;
      }
      // make sure index is always >= 0
      indexToRemove = Math.max(indexToRemove, 0);

      this.otpInputService.removeCharacterAtIndex(indexToRemove);
      if (!hasCharAtIndex) {
        this.otpInputService.focusInputCell();
      }
    }

    const previousValue = inputEl.value;
    inputEl.value = this.otpInputService.filledCharactersAsString();
    if (previousValue !== inputEl.value) {
      this.onChange('');
    }
  }

  protected onBlur() {
    this.otpInputService.selectedInputCell.set(undefined);
    this.onTouched();
  }
}

export const OTP_INPUT_DIGIT_REGEXP = /^[0-9]$/;

export const OTP_INPUT_ALPHANUMERIC_REGEXP = /^[a-zA-Z0-9]$/;
