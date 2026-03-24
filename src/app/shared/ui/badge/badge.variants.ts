import { cva, type VariantProps } from 'class-variance-authority';

export const badge = cva(
  'inline-flex items-center font-medium rounded-full',
  {
    variants: {
      color: {
        neutral: 'bg-neutral text-neutral-content',
        success: 'bg-success text-success-content',
        error: 'bg-error text-error-content',
        info: 'bg-info text-info-content',
      },
      size: {
        xs: 'h-4 px-1.5 text-[10px]',
        sm: 'h-5 px-2 text-xs',
        md: 'h-6 px-2.5 text-sm',
      },
    },
    defaultVariants: { color: 'neutral', size: 'md' },
  }
);

export type BadgeVariants = VariantProps<typeof badge>;
export type BadgeColor = NonNullable<BadgeVariants['color']>;
export type BadgeSize = NonNullable<BadgeVariants['size']>;
