import { OtpInputCellComponent } from './otp-input-cell.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { OtpInputState } from './otp-input-state.service';
import { By } from '@angular/platform-browser';

const baseProviders = [provideExperimentalZonelessChangeDetection()];

describe(OtpInputCellComponent.name, () => {
  async function setup(
    options: { selectedInputCell?: number; filledCharacters?: string[] } = {},
  ) {
    const otpInputService = new OtpInputState();
    otpInputService.initialize(6);
    otpInputService.selectedInputCell.set(options?.selectedInputCell);
    otpInputService.filledCharacters.set(options?.filledCharacters ?? []);
    return render('<prbl-otp-input-cell [index]="0" />', {
      providers: [
        ...baseProviders,
        { provide: OtpInputState, useValue: otpInputService },
      ],
      imports: [OtpInputCellComponent],
    });
  }

  it('should render a symbol', async () => {
    await setup({
      filledCharacters: ['a'],
    });

    const el = screen.findByTitle('');
    expect(el).toBeTruthy();
  });

  it('should render no content if empty and not focused', async () => {
    const { debugElement } = await setup();
    const content = debugElement.query(By.css('prbl-otp-input-cell > *'));
    expect(content).toBeNull();
  });

  it('should render a caret if empty and focused', async () => {
    const { debugElement } = await setup({
      selectedInputCell: 0,
    });

    const caret = debugElement.query(By.css('prbl-otp-input-caret'));
    expect(caret).toBeTruthy();
  });
});
