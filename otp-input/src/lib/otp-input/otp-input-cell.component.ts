import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { OtpInputState } from './otp-input-state.service';
import { OtpInputCaretComponent } from './otp-input-caret.component';

@Component({
  selector: 'prbl-otp-input-cell',
  standalone: true,
  imports: [OtpInputCaretComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!character() && isSelected()) {
      <prbl-otp-input-caret />
    } @else {
      {{ character() }}
    }
  `,
  host: {
    '[class.selected]': 'isSelected()',
    '[attr.index]': 'index()',
    '[attr.aria-hidden]': 'true',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      pointer-events: all;
      width: var(--otp-input-cell-width);
      height: var(--otp-input-cell-height);
      border-width: var(--otp-input-cell-border-width);
      border-color: var(--otp-input-cell-border-color);
      border-radius: var(--otp-input-cell-inner-border-radius);
      border-style: solid;
      padding: var(--otp-input-cell-padding);
      font-family: var(--otp-input-cell-font-family);
      font-size: var(--otp-input-cell-font-size);
      color: var(--otp-input-cell-color);
      background: var(--otp-input-cell-background);

      &.selected {
        z-index: 1;
        outline-width: var(--otp-input-cell-focus-outline-width);
        outline-style: solid;
        outline-color: var(--otp-input-cell-focus-outline-color);
      }

      &:not(:first-of-type) {
        margin-left: calc((var(--otp-input-cell-border-width) * -1));
      }

      &:first-of-type {
        border-top-left-radius: var(--otp-input-cell-outer-border-radius);
        border-bottom-left-radius: var(--otp-input-cell-outer-border-radius);
      }

      &:last-of-type {
        border-right: var(--otp-input-cell-border-width) solid
          var(--otp-input-cell-border-color);
        border-top-right-radius: var(--otp-input-cell-outer-border-radius);
        border-bottom-right-radius: var(--otp-input-cell-outer-border-radius);
      }
    }
  `,
})
export class OtpInputCellComponent {
  private readonly otpInputService = inject(OtpInputState);

  public index = model<number>(-1);

  public readonly character = computed(
    () => this.otpInputService.filledCharacters().at(this.index()) || '',
  );

  public readonly isSelected = computed(
    () => this.otpInputService.selectedInputCell() === this.index(),
  );
}
