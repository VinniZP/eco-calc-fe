import { cva, type VariantProps } from 'class-variance-authority';

export const button = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      intent: {
        primary: 'bg-primary text-primary-content hover:bg-primary/85 hover:shadow-[0_0_10px_rgba(93,171,122,0.2)] active:scale-[0.97]',
        ghost: 'bg-transparent hover:bg-base-200/60 text-base-content',
        outline: 'border border-base-content/20 bg-transparent hover:bg-base-200/40 hover:border-base-content/30',
        warning: 'bg-warning text-warning-content hover:bg-warning/85 active:scale-[0.97]',
        accent: 'bg-accent text-accent-content hover:bg-accent/85 active:scale-[0.97]',
        success: 'bg-success text-success-content hover:bg-success/85 active:scale-[0.97]',
        link: 'bg-transparent underline-offset-4 hover:underline text-primary hover:text-primary/80',
      },
      size: {
        xs: 'h-6 px-2 text-sm rounded',
        sm: 'h-8 px-3 text-sm rounded-md',
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
