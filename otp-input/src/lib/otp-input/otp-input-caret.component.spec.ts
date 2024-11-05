import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpInputCaretComponent } from './otp-input-caret.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe(OtpInputCaretComponent.name, () => {
  let component: OtpInputCaretComponent;
  let fixture: ComponentFixture<OtpInputCaretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpInputCaretComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpInputCaretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
