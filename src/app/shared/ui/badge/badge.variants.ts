import { cva, type VariantProps } from 'class-variance-authority';

export const badge = cva(
  'inline-flex items-center font-medium rounded-full border',
  {
    variants: {
      color: {
        neutral: 'bg-neutral/60 text-neutral-content border-neutral-content/15',
        success: 'bg-success/15 text-success border-success/25',
        error: 'bg-error/15 text-error border-error/25',
        info: 'bg-info/15 text-info border-info/25',
      },
      size: {
        xs: 'h-4 px-1.5 text-xs',
        sm: 'h-5 px-2 text-sm',
        md: 'h-6 px-2.5 text-sm',
      },
    },
    defaultVariants: { color: 'neutral', size: 'md' },
  }
);

export type BadgeVariants = VariantProps<typeof badge>;
export type BadgeColor = NonNullable<BadgeVariants['color']>;
export type BadgeSize = NonNullable<BadgeVariants['size']>;
