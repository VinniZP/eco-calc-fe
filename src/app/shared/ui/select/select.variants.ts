import { cva, type VariantProps } from 'class-variance-authority';

export const selectVariants = cva(
  [
    'w-full bg-base-200/80 text-base-content rounded border transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:bg-base-200',
    'appearance-none',
    'bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat',
    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")]",
  ],
  {
    variants: {
      size: {
        xs: 'h-6 pl-2 pr-7 text-xs',
        sm: 'h-8 pl-3 pr-8 text-sm',
        md: 'h-10 pl-4 pr-9 text-base',
      },
      bordered: {
        true: 'border-base-content/15',
        false: 'border-transparent',
      },
    },
    defaultVariants: { size: 'md', bordered: true },
  }
);

export type SelectVariants = VariantProps<typeof selectVariants>;
export type SelectSize = NonNullable<SelectVariants['size']>;
