import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  OTP_INPUT_ALPHANUMERIC_REGEXP,
  OtpInputComponent,
} from './otp-input.component';
import { OtpInputGroupComponent } from './otp-input-group.component';
import { OtpInputCaretComponent } from './otp-input-caret.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

const meta: Meta<OtpInputComponent> = {
  component: OtpInputComponent,
  title: 'OtpInput',
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
  },
  args: {
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<OtpInputComponent>;

const ngImports = [
  OtpInputComponent,
  OtpInputGroupComponent,
  OtpInputCaretComponent,
  NgTemplateOutlet,
  FormsModule,
  ReactiveFormsModule,
];

const defaultStyles = `
prbl-otp-input {
  margin-bottom: 2rem;

  .separator {
    display: inline-block;
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }

  .separator-2 {
    display: inline-block;
    font-size: 1.5rem;
    margin: 0 0.5rem;

    &::before {
      content: '';
      display: block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 100%;
      background-color: rgb(42, 42, 42);
    }
  }

  .star {
      display: inline-block;
      margin: 0 0.5rem;
  }
}

@keyframes pulse {
  0% {
    outline-width: 4px;
  }
  50% {
    outline-width: 1px;
  }
  100% {
    outline-width: 4px;
  }
}
`;

export const DefaultStyling: Story = {
  decorators: [
    moduleMetadata({
      imports: ngImports,
    }),
  ],
  render: (args) => {
    return {
      props: {
        disabled: args.disabled,
      },
      styles: [defaultStyles],
      template: `
        <prbl-otp-input [codeLength]="6" label="Enter OTP" id="my-otp" [disabled]="disabled">
          <prbl-otp-input-group [cells]="3" />
          <span class="separator" aria-hidden="true">—</span>
          <prbl-otp-input-group [cells]="3" [cellStartIndex]="3" />
        </prbl-otp-input>
      `,
    };
  },
};

export const CustomStyling: Story = {
  decorators: [
    moduleMetadata({
      imports: ngImports,
    }),
  ],
  render: (args) => {
    return {
      props: {
        disabled: args.disabled,
      },
      styles: [
        defaultStyles,
        `
        prbl-otp-input.fancy prbl-otp-input-group {
          --otp-input-cell-focus-outline-color: rgba(0, 114, 253, 0.67);
          --otp-input-cell-focus-outline-width: 4px;
          --otp-input-cell-width: 36px;
          --otp-input-cell-height: 48px;
          --otp-input-cell-border-width: 1px;
          --otp-input-cell-border-color: black;
          --otp-input-cell-border-radius: 4px;
          --otp-input-cell-padding: 0.25rem;
          --otp-input-cell-font-size: 1.5rem;
          --otp-input-cell-font-family: Monaco;
        }
        `,
      ],
      template: `
        <prbl-otp-input class="fancy" [codeLength]="8" [disabled]="disabled">
          <prbl-otp-input-group [cells]="4" />
          <span class="separator-2" aria-hidden="true"></span>
          <prbl-otp-input-group [cells]="4" [cellStartIndex]="4" />
        </prbl-otp-input>
      `,
    };
  },
};

export const CustomStyling2: Story = {
  decorators: [
    moduleMetadata({
      imports: ngImports,
    }),
  ],
  render: (args) => {
    return {
      props: {
        disabled: args.disabled,
      },
      styles: [
        defaultStyles,
        `
        prbl-otp-input.fancy-2 prbl-otp-input-group {
          --otp-input-cell-focus-outline-color: hsla(350, 97%, 76%, 0.808);
          --otp-input-cell-focus-outline-width: 6px;
          --otp-input-cell-width: 48px;
          --otp-input-cell-height: 48px;
          --otp-input-cell-border-width: 2px;
          --otp-input-cell-border-color: rgb(42, 223, 254);
          --otp-input-cell-border-radius: 50%;
          --otp-input-cell-padding: 0;
          --otp-input-cell-font-size: 1.33rem;
          --otp-input-cell-font-family: Monaco;
          --otp-input-cell-color: rgb(234, 106, 2);
        }
        `,
      ],
      template: `
      <prbl-otp-input class="fancy-2" [codeLength]="6" [disabled]="disabled">
        <prbl-otp-input-group [cells]="6" />
      </prbl-otp-input>
      `,
    };
  },
};

export const ThreeGroups: Story = {
  decorators: [
    moduleMetadata({
      imports: ngImports,
    }),
  ],
  render: (args) => {
    return {
      styles: [defaultStyles],
      props: {
        disabled: args.disabled,
      },
      template: `
        <prbl-otp-input [codeLength]="9" [disabled]="disabled">
          <prbl-otp-input-group [cells]="3" />
          <ng-container [ngTemplateOutlet]="separator" />
          <prbl-otp-input-group [cells]="3" [cellStartIndex]="3" />
          <ng-container [ngTemplateOutlet]="separator" />
          <prbl-otp-input-group [cells]="3" [cellStartIndex]="6" />

          <ng-template #separator>
            <span class="separator-2" aria-hidden="true"></span>
          </ng-template>
        </prbl-otp-input>
      `,
    };
  },
};

export const CustomCellTemplate: Story = {
  decorators: [
    moduleMetadata({
      imports: ngImports,
    }),
  ],
  render: (args) => {
    return {
      styles: [
        defaultStyles,
        `
        .custom-otp-cell {
          display: flex;
          width: 48px;
          height: 48px;
          border: 2px solid #ab25f9;
          border-radius: 100%;
          align-items: center;
          font-size: 1.5rem;
          justify-content: center;
          font-family: 'Comic Sans MS', 'Comic Sans', cursive;
          font-weight: bold;
          color: #fa5a76;
          text-transform: uppercase;
          background: radial-gradient(circle, rgba(255,255,242,1) 0%, rgba(207,228,252,1) 100%);

          &:not(:last-of-type) {
            margin-right: 0.33rem;
          }

          &.selected {
            outline: solid hsla(345, 91%, 51%, 0.724);
            outline-width: 1px;
            animation: 1.5s pulse infinite ease-in-out;
          }

          prbl-otp-input-caret {
            --otp-input-caret-width: 2px;
            --otp-input-caret-color: pink;
            --otp-input-caret-animation-duration: 0.75s;
            --otp-input-caret-height: 1.66rem;
          }
        }
        `,
      ],
      props: {
        OTP_INPUT_ALPHANUMERIC_REGEXP: OTP_INPUT_ALPHANUMERIC_REGEXP,
        disabled: args.disabled,
      },
      template: `
        <prbl-otp-input
          [codeLength]="6"
          [pattern]="OTP_INPUT_ALPHANUMERIC_REGEXP"
          [id]="'otp-input'"
          [disabled]="disabled"
        >
          <prbl-otp-input-group [cells]="3" [cellTemplate]="customCell" />
          <ng-container [ngTemplateOutlet]="separator" />
          <prbl-otp-input-group
            [cells]="3"
            [cellStartIndex]="3"
            [cellTemplate]="customCell"
          />

          <ng-template #separator>
            <span class="star" aria-hidden="true">⭐</span>
          </ng-template>

          <ng-template
            #customCell
            let-index="index"
            let-isSelected="isSelected"
            let-symbol="symbol"
          >
            <div class="custom-otp-cell" [class.selected]="isSelected" aria-hidden="true">
              @if (symbol) {
                {{ symbol }}
              } @else {
                @if (isSelected) {
                  <prbl-otp-input-caret />
                }
              }
            </div>
          </ng-template>
        </prbl-otp-input>
      `,
    };
  },
};
