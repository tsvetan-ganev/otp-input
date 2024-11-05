import { Component } from '@angular/core';
import {
  OTP_INPUT_ALPHANUMERIC_REGEXP,
  OtpInputComponent,
  OtpInputGroupComponent,
  OtpInputCaretComponent,
} from '@parabolabs/otp-input';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    OtpInputComponent,
    OtpInputGroupComponent,
    OtpInputCaretComponent,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public title = 'input-otp';

  public readonly OTP_INPUT_ALPHANUMERIC_REGEXP = OTP_INPUT_ALPHANUMERIC_REGEXP;

  public form = new FormBuilder().group({
    otp: new FormControl<string>(''),
  });
}
