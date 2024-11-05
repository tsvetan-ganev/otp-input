import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpInputGroupComponent } from './otp-input-group.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { OtpInputState } from './otp-input-state.service';

describe(OtpInputGroupComponent.name, () => {
  let component: OtpInputGroupComponent;
  let fixture: ComponentFixture<OtpInputGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpInputGroupComponent],
      providers: [provideExperimentalZonelessChangeDetection(), OtpInputState],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpInputGroupComponent);
    fixture.componentRef.setInput('cells', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
