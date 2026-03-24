import { cva, type VariantProps } from 'class-variance-authority';

export const button = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      intent: {
        primary: 'bg-primary text-primary-content hover:bg-primary/80',
        ghost: 'bg-transparent hover:bg-base-200',
        outline: 'border border-current bg-transparent hover:bg-base-200',
        warning: 'bg-warning text-warning-content hover:bg-warning/80',
        accent: 'bg-accent text-accent-content hover:bg-accent/80',
        success: 'bg-success text-success-content hover:bg-success/80',
        link: 'bg-transparent underline-offset-4 hover:underline text-primary',
      },
      size: {
        xs: 'h-6 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-sm rounded',
        md: 'h-10 px-4 text-base rounded-lg',
      },
      shape: {
        default: '',
        circle: 'rounded-full !p-0 aspect-square',
      },
    },
    defaultVariants: { intent: 'primary', size: 'md', shape: 'default' },
  },
);

export type ButtonVariants = VariantProps<typeof button>;
export type ButtonIntent = NonNullable<ButtonVariants['intent']>;
export type ButtonSize = NonNullable<ButtonVariants['size']>;
export type ButtonShape = NonNullable<ButtonVariants['shape']>;
