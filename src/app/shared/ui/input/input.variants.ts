import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'w-full bg-base-200 text-base-content rounded border transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
    'placeholder:text-base-content/50',
  ],
  {
    variants: {
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
      },
      bordered: {
        true: 'border-base-content/20',
        false: 'border-transparent',
      },
      error: {
        true: 'border-error focus:ring-error/50 focus:border-error',
        false: '',
      },
    },
    defaultVariants: { size: 'md', bordered: true, error: false },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;
export type InputSize = NonNullable<InputVariants['size']>;
