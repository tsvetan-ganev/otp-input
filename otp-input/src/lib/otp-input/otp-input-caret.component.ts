import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'prbl-otp-input-caret',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    '[attr.aria-hidden]': 'true',
  },
  // Storybook can't parse the @keyframes declarations
  // when the styles are declared inline
  styleUrls: ['./otp-input-caret.component.scss'],
})
export class OtpInputCaretComponent {}
