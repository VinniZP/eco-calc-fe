import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'w-full bg-base-200/80 text-base-content rounded border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:bg-base-200',
    'placeholder:text-base-content/40',
  ],
  {
    variants: {
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
      },
      bordered: {
        true: 'border-base-content/15',
        false: 'border-transparent',
      },
      error: {
        true: 'border-error/60 focus:ring-error/30 focus:border-error',
        false: '',
      },
    },
    defaultVariants: { size: 'md', bordered: true, error: false },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;
export type InputSize = NonNullable<InputVariants['size']>;
