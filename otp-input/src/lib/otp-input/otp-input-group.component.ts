import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { OtpInputCellComponent } from './otp-input-cell.component';
import { OtpInputState } from './otp-input-state.service';

@Component({
  selector: 'prbl-otp-input-group',
  standalone: true,
  imports: [OtpInputCellComponent, NgTemplateOutlet],
  host: {
    '[attr.data-cell-start-index]': 'cellStartIndex()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (cell of cellsList(); track $index) {
      @let cellIndex = $index + cellStartIndex();
      @let tpl = cellTemplate();

      @if (tpl) {
        <!-- custom input cell template -->
        <ng-container
          [ngTemplateOutlet]="tpl"
          [ngTemplateOutletContext]="{
            index: cellIndex,
            symbol: otpInputState.filledCharacters().at(cellIndex),
            isSelected: otpInputState.selectedInputCell() === cellIndex,
          }"
        />
      } @else {
        <!-- default input cell -->
        <prbl-otp-input-cell [index]="cellIndex" />
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
      pointer-events: none;

      --otp-input-cell-font-family: ui-monospace, monospace;
      --otp-input-cell-font-size: 1rem;
      --otp-input-cell-color: black;
      --otp-input-cell-width: 36px;
      --otp-input-cell-height: var(--otp-input-cell-width);
      --otp-input-cell-border-width: 1px;
      --otp-input-cell-border-color: black;
      --otp-input-cell-border-radius: 8px;
      --otp-input-cell-padding: 0.25rem;
      --otp-input-cell-focus-outline-color: black;
      --otp-input-cell-focus-outline-width: 2px;
      --otp-input-cell-background: none;
    }
  `,
})
export class OtpInputGroupComponent {
  public readonly otpInputState = inject(OtpInputState);

  /**
   * How many symbol cells should be rendered.
   */
  public readonly cells = input.required<number>();

  /**
   * The starting index for the first cell in the group.
   * Use this if there are more than 1 groups.
   *
   * @default 0
   */
  public readonly cellStartIndex = input<number>(0);

  /**
   * `<ng-template>` instance which will be rendered for each cell
   */
  public readonly cellTemplate =
    input<TemplateRef<OtpInputTemplateRefContext>>();

  public readonly cellsList = computed(() =>
    Array.from({ length: this.cells() }),
  );
}

export interface OtpInputTemplateRefContext {
  index: number;
  isSelected: boolean;
  symbol: string | undefined;
}
