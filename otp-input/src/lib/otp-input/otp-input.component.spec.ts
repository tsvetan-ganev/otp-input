import {
  findByText,
  fireEvent,
  render,
  RenderComponentOptions,
} from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';

import {
  DebugElement,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { OtpInputCaretComponent } from './otp-input-caret.component';
import { OtpInputCellComponent } from './otp-input-cell.component';
import { OtpInputGroupComponent } from './otp-input-group.component';
import { OtpInputState } from './otp-input-state.service';
import {
  OTP_INPUT_ALPHANUMERIC_REGEXP,
  OtpInputComponent,
} from './otp-input.component';

enum KbdKeys {
  Left = '[ArrowLeft]',
  Right = '[ArrowRight]',
  Backspace = '{backspace}',
}

function getTextInputEl(de: DebugElement): HTMLInputElement {
  return de.query(By.css('input[type="one-time-code"]')).nativeElement;
}

describe(OtpInputComponent.name, () => {
  const renderOptions: RenderComponentOptions<OtpInputComponent> = {
    imports: [
      OtpInputComponent,
      OtpInputGroupComponent,
      OtpInputCellComponent,
      OtpInputCaretComponent,
      ReactiveFormsModule,
    ],
    providers: [provideExperimentalZonelessChangeDetection(), OtpInputState],
  };

  it('should apply the expected attributes to the underlying <input /> element', async () => {
    const codeLength = 6;
    const label = 'Enter your OTP code';
    const id = 'my-otp-input';
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}" [label]="'${label}'" [id]="'${id}'">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = debugElement.query(By.css('input[type="one-time-code"]'));
    const expectedAttributesMap = {
      'aria-label': label,
      id: id,
      autocomplete: 'one-time-code',
      type: 'one-time-code',
      autocorrect: 'off',
      spellcheck: 'false',
      inputmode: 'numeric',
    };
    Object.entries(expectedAttributesMap).forEach(([key, value]) => {
      expect(textInput.attributes[key]).withContext(key).toEqual(value);
    });
  });

  it('should disable the input', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}" [disabled]="true">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const otpInput = debugElement.query(By.directive(OtpInputComponent));
    const textInput = getTextInputEl(debugElement);

    expect(textInput.disabled)
      .withContext('the native input element should be disabled')
      .toBeTrue();

    expect(otpInput.attributes['aria-disabled'])
      .withContext('aria-disabled should be present in the host element')
      .toEqual('true');

    await userEvent.click(textInput);
    await userEvent.type(textInput, '123456');
    expect(textInput.value)
      .withContext('input value should not be changed in disabled state')
      .toEqual('');
  });

  it('should render the expected DOM elements for a single group', async () => {
    const codeLength = 6;
    const label = 'Enter your OTP code';
    const id = 'my-otp-input';
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}" [label]="'${label}'" [id]="'${id}'">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const inputGroups = debugElement.queryAll(
      By.directive(OtpInputGroupComponent),
    );
    expect(inputGroups.length)
      .withContext('only one group must be rendered')
      .toEqual(1);

    const inputCells = inputGroups[0].queryAll(
      By.directive(OtpInputCellComponent),
    );
    expect(inputCells.length)
      .withContext(`${codeLength} cells must be rendered`)
      .toEqual(codeLength);
    inputCells.forEach((cell, index) => {
      expect(cell.attributes['index']).toEqual(index.toString());
    });
  });

  it('should fill the OTP code', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const expectedOtpCode = '123456';
    await userEvent.click(textInput);
    await userEvent.type(textInput, expectedOtpCode);
    expect(textInput.value).toEqual(expectedOtpCode);

    for (const digit of expectedOtpCode) {
      const cell = await findByText(debugElement.nativeElement, digit, {
        selector: 'prbl-otp-input-cell',
      });
      expect(cell).toBeTruthy();
    }
  });

  it('should replace the last char when user enters a value in an already filled code', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const code = '123456';
    const newDigit = '7';
    const newCode = code.replace('6', newDigit);
    await userEvent.click(textInput);
    await userEvent.type(textInput, code);
    await userEvent.type(textInput, newDigit);

    for (const digit of newCode) {
      const cell = await findByText(debugElement.nativeElement, digit, {
        selector: 'prbl-otp-input-cell',
      });
      expect(cell).toBeTruthy();
    }
  });

  it('should emit event when all the characters are filled', async () => {
    const onCodeEnteredCb = jasmine.createSpy();
    const codeLength = 6;
    const { debugElement } = await render(
      `
      <prbl-otp-input [codeLength]="${codeLength}" (codeEntered)="codeEntered($event)">
        <prbl-otp-input-group [cells]="${codeLength}" />
      </prbl-otp-input>`,
      {
        ...renderOptions,
        componentProperties: {
          codeEntered: onCodeEnteredCb,
        },
      },
    );

    const textInput = getTextInputEl(debugElement);

    const expectedOtpCode = '123456';
    await userEvent.click(textInput);
    await userEvent.type(textInput, expectedOtpCode);

    expect(onCodeEnteredCb).toHaveBeenCalledOnceWith(expectedOtpCode);
  });

  it('should focus the correct cell at each digit filled', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);

    await userEvent.type(textInput, '1');
    let cell = debugElement.queryAll(By.directive(OtpInputCellComponent)).at(1);
    expect(cell?.nativeElement)
      .withContext('Expected state: [1] [[|]] [ ]')
      .toHaveClass('selected');

    await userEvent.type(textInput, '2');
    cell = debugElement.queryAll(By.directive(OtpInputCellComponent)).at(2);
    expect(cell?.nativeElement)
      .withContext('Expected state: [1] [2] [[|]]')
      .toHaveClass('selected');

    await userEvent.type(textInput, '3');
    expect(cell?.nativeElement)
      .withContext('Expected state: [1] [2] [[3]]')
      .toHaveClass('selected');
  });

  it('should not allow entering characters that do not match the default pattern (numbers only)', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);
    await userEvent.type(textInput, 'a');
    await userEvent.type(textInput, '#');
    await userEvent.type(textInput, '-');
    await userEvent.type(textInput, '9');

    expect(textInput.value).toEqual('9');
  });

  it('should not allow entering characters that do not match the provided pattern', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}" [pattern]="customPattern">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      {
        ...renderOptions,
        componentProperties: {
          customPattern: OTP_INPUT_ALPHANUMERIC_REGEXP,
        },
      },
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);
    await userEvent.type(textInput, 'a');
    await userEvent.type(textInput, '#');
    await userEvent.type(textInput, '-');
    await userEvent.type(textInput, '4');
    await userEvent.type(textInput, 'Z');

    expect(textInput.value).toEqual('a4Z');
  });

  it('should focus the correct cell at each digit deleted', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);
    await userEvent.type(textInput, '123');
    await userEvent.type(textInput, KbdKeys.Backspace);

    let cell = debugElement.queryAll(By.directive(OtpInputCellComponent)).at(2);
    expect(cell?.nativeElement)
      .withContext('Expected state: [1] [2] [[|]]')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Backspace);
    cell = debugElement.queryAll(By.directive(OtpInputCellComponent)).at(1);
    expect(cell?.nativeElement)
      .withContext('Expected state: [1] [[|]] []')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Backspace);
    cell = debugElement.queryAll(By.directive(OtpInputCellComponent)).at(0);
    expect(cell?.nativeElement)
      .withContext('Expected state: [[|]] [] []')
      .toHaveClass('selected');
  });

  it('should replace a character at specific position', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);
    await userEvent.type(textInput, '123');
    await userEvent.type(textInput, KbdKeys.Left);

    const middleCell = debugElement.queryAll(
      By.directive(OtpInputCellComponent),
    )[1];
    expect(middleCell?.nativeElement)
      .withContext('Expected state: [1] [[2]] [3]')
      .toHaveClass('selected');

    const newValue = '0';
    await userEvent.type(textInput, newValue);
    expect((middleCell?.nativeElement as HTMLElement).innerText.trim()).toEqual(
      newValue,
    );

    // focus is moved to the next element after the replacement occurs
    expect(middleCell?.nativeElement)
      .withContext('Expected state: [1] [0] [[3]]')
      .not.toHaveClass('selected');
  });

  it('should iterate through the cells backwards and forwards', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);
    await userEvent.click(textInput);
    await userEvent.type(textInput, '123');

    const cells = debugElement.queryAll(By.directive(OtpInputCellComponent));

    // Right to Left
    await userEvent.type(textInput, KbdKeys.Left);
    expect(cells[1].nativeElement)
      .withContext('Expected state: [1] [[2]] [3]')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Left);
    expect(cells[0].nativeElement)
      .withContext('Expected state: [[1]] [2] [3]')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Left);
    expect(cells[0].nativeElement)
      .withContext(
        'Expected state: [[1]] [2] [3] - already at leftmost boundary',
      )
      .toHaveClass('selected');

    // Left to Right
    await userEvent.type(textInput, KbdKeys.Right);
    expect(cells[1].nativeElement)
      .withContext('Expected state: [1] [[2]] [3]')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Right);
    expect(cells[2].nativeElement)
      .withContext('Expected state: [1] [2] [[3]]')
      .toHaveClass('selected');

    await userEvent.type(textInput, KbdKeys.Right);
    expect(cells[2].nativeElement)
      .withContext(
        'Expected state: [1] [2] [[3]] - already at rightmost boundary',
      )
      .toHaveClass('selected');
  });

  it('should handle pasting complete and valid OTP code', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const code: number[] = Array.from({ length }).map((_, i) => i + 1);
    const codeStr = code.join('');
    const dt = new DataTransfer();
    dt.setData('text', codeStr);
    await userEvent.click(textInput);
    await userEvent.paste(dt);

    const cells = debugElement.queryAll(By.directive(OtpInputCellComponent));

    for (const [index, digit] of code.entries()) {
      expect(
        (cells.at(index)?.nativeElement as HTMLElement).innerText.trim(),
      ).toEqual(digit.toString());
    }

    expect(textInput.value).toEqual(codeStr);
  });

  it('should paste code containing dashes/whitespace and strip them', async () => {
    const codeLength = 9;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const dt = new DataTransfer();

    // with dashes
    let codeStr = '123-456-789';
    dt.setData('text', codeStr);
    await userEvent.click(textInput);
    await userEvent.paste(dt);
    expect(textInput.value)
      .withContext('should strip the dashes')
      .toEqual('123456789');

    // with whitespace
    codeStr = '987 654 321';
    dt.setData('text', codeStr);
    await userEvent.paste(dt);
    expect(textInput.value)
      .withContext('should strip the whitespace')
      .toEqual('987654321');
  });

  it('should not paste code containing dashes/whitespace and strip them', async () => {
    const codeLength = 9;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);
    const dt = new DataTransfer();

    // with dashes
    let codeStr = '123-456-789';
    dt.setData('text', codeStr);
    await userEvent.click(textInput);
    await userEvent.paste(dt);
    expect(textInput.value)
      .withContext('should strip the dashes')
      .toEqual('123456789');

    // with whitespace
    codeStr = '987 654 321';
    dt.setData('text', codeStr);
    await userEvent.paste(dt);
    expect(textInput.value)
      .withContext('should strip the whitespace')
      .toEqual('987654321');
  });

  it('should trim excessive characters on paste', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const dt = new DataTransfer();

    const code = '123-456-789';
    dt.setData('text', code);
    await userEvent.click(textInput);
    await userEvent.paste(dt);
    expect(textInput.value)
      .withContext('should trim the last 3 characters')
      .toEqual('123456');
  });

  it('should ignore paste of content containing invalid characters', async () => {
    const codeLength = 6;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    const dt = new DataTransfer();

    const code = '123-45#';
    dt.setData('text', code);
    await userEvent.click(textInput);
    await userEvent.paste(dt);
    expect(textInput.value).toEqual('');
  });

  it('should remove the cell selection class on blur', async () => {
    const codeLength = 3;
    const { debugElement } = await render(
      `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}" />
        </prbl-otp-input>
      `,
      renderOptions,
    );

    const textInput = getTextInputEl(debugElement);

    await userEvent.click(textInput);
    fireEvent(textInput, new Event('blur'));

    expect(debugElement.queryAll(By.css('.selected'))).toHaveSize(0);
  });

  describe('ControlValueAccessor', async () => {
    it('should initialize with a value', async () => {
      const codeLength = 6;
      const initialValue = '123456';
      const { debugElement } = await render(
        `
          <prbl-otp-input [codeLength]="${codeLength}" [formControl]="fc">
            <prbl-otp-input-group [cells]="${codeLength}" />
          </prbl-otp-input>
        `,
        {
          ...renderOptions,
          componentProperties: {
            fc: new FormControl(initialValue),
          },
        },
      );

      const textInput = getTextInputEl(debugElement);

      expect(textInput.value).toEqual(initialValue);
    });

    it('should reset the value programmatically', async () => {
      const codeLength = 6;
      const initialValue = '123456';
      const { debugElement } = await render(
        `
          <prbl-otp-input [codeLength]="${codeLength}" [formControl]="fc">
            <prbl-otp-input-group [cells]="${codeLength}" />
          </prbl-otp-input>
        `,
        {
          ...renderOptions,
          componentProperties: {
            fc: new FormControl(initialValue),
          },
        },
      );

      const textInput = getTextInputEl(debugElement);

      const fc = debugElement.componentInstance.fc as FormControl<string>;
      fc.setValue('');
      expect(textInput.value).toEqual('');
    });

    it('should disable programatically', async () => {
      const codeLength = 6;
      const initialValue = '123456';
      const fc = new FormControl({ value: initialValue, disabled: true });
      const { debugElement } = await render(
        `
          <prbl-otp-input [codeLength]="${codeLength}" [formControl]="fc">
            <prbl-otp-input-group [cells]="${codeLength}" />
          </prbl-otp-input>
        `,
        {
          ...renderOptions,
          componentProperties: {
            fc,
          },
        },
      );

      const inputEl = getTextInputEl(debugElement);
      expect(inputEl.disabled).toBeTrue();
    });

    it('should update form control value', async () => {
      const codeLength = 6;
      const { debugElement } = await render(
        `
          <prbl-otp-input [codeLength]="${codeLength}" [formControl]="fc">
            <prbl-otp-input-group [cells]="${codeLength}" />
          </prbl-otp-input>
        `,
        {
          ...renderOptions,
          componentProperties: {
            fc: new FormControl(''),
          },
        },
      );

      const textInput = getTextInputEl(debugElement);
      const fc = debugElement.componentInstance.fc as FormControl<string>;

      // on insert
      let code = '123456';
      await userEvent.type(textInput, code);
      expect(fc.value).toEqual('123456');

      // on delete
      await userEvent.type(textInput, KbdKeys.Backspace);
      expect(fc.value)
        .withContext(
          'deleting a character should result in empty form control value',
        )
        .toEqual('');

      // on paste
      const dt = new DataTransfer();
      code = '000000';
      dt.setData('text', code);
      await userEvent.paste(dt);
      expect(fc.value)
        .withContext('paste should update the form control value')
        .toEqual(code);
    });
  });

  describe('Custom Cell Template', async () => {
    async function renderCustomCellTemplate() {
      const codeLength = 6;
      const { debugElement } = await render(
        `
        <prbl-otp-input [codeLength]="${codeLength}">
          <prbl-otp-input-group [cells]="${codeLength}/2" [cellTemplate]="customCell" />
          <prbl-otp-input-group [cells]="${codeLength}/2" [cellStartIndex]="${codeLength}/2" [cellTemplate]="customCell" />

          <ng-template #customCell let-index="index" let-isSelected="isSelected" let-symbol="symbol">
            <div class="custom-otp-cell" [class.selected]="isSelected" aria-hidden="true">
              <ng-container *ngIf="symbol">{{ symbol }}</ng-container>
            </div>
          </ng-template>
        </prbl-otp-input>
      `,
        renderOptions,
      );

      return debugElement;
    }

    it('should fill OTP code with custom cell template', async () => {
      const debugElement = await renderCustomCellTemplate();
      const textInput = getTextInputEl(debugElement);

      const expectedOtpCode = '123456';
      await userEvent.click(textInput);
      await userEvent.type(textInput, expectedOtpCode);
      expect(textInput.value).toEqual(expectedOtpCode);

      for (const digit of expectedOtpCode) {
        const cell = await findByText(debugElement.nativeElement, digit, {
          selector: '.custom-otp-cell',
        });
        expect(cell).toBeTruthy();
      }
    });
  });
});
