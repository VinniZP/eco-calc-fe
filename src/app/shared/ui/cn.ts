import { type ClassValue, clsx } from 'clsx';
import { createTailwindMerge, validators } from 'tailwind-merge';

const { isArbitraryLength, isArbitraryValue, isNumber, isTshirtSize, isArbitrarySize } = validators;
const isLengthOrArbitrary = [isNumber, isTshirtSize, isArbitraryLength, isArbitrarySize, 'auto', 'full', 'min', 'max', 'fit', 'screen', 'px'];

const COLORS = [
  'inherit', 'current', 'transparent', 'white', 'black',
  'base-100', 'base-200', 'base-300', 'base-content',
  'primary', 'primary-content',
  'accent', 'accent-content',
  'neutral', 'neutral-content',
  'success', 'success-content',
  'warning', 'warning-content',
  'error', 'error-content',
  'info', 'info-content',
];
const isColor = [isArbitraryValue, ...COLORS];

const twMerge = createTailwindMerge(() => ({
  cacheSize: 200,
  theme: {},
  classGroups: {
    // Spacing
    p: [{ p: isLengthOrArbitrary }],
    px: [{ px: isLengthOrArbitrary }],
    py: [{ py: isLengthOrArbitrary }],
    pl: [{ pl: isLengthOrArbitrary }],
    pr: [{ pr: isLengthOrArbitrary }],
    pt: [{ pt: isLengthOrArbitrary }],
    pb: [{ pb: isLengthOrArbitrary }],
    m: [{ m: isLengthOrArbitrary }],
    mx: [{ mx: isLengthOrArbitrary }],
    my: [{ my: isLengthOrArbitrary }],
    // Sizing
    h: [{ h: isLengthOrArbitrary }],
    'min-h': [{ 'min-h': isLengthOrArbitrary }],
    w: [{ w: isLengthOrArbitrary }],
    // Colors
    bg: [{ bg: isColor }],
    text: [{ text: isColor }],
    'border-color': [{ border: isColor }],
    // Text size
    'font-size': [{ text: ['xs', 'sm', 'base', 'lg', 'xl'] }],
    // Border radius
    rounded: [{ rounded: ['none', 'sm', 'md', 'lg', 'xl', 'full', ''] }],
    // Ring
    ring: [{ ring: isLengthOrArbitrary }],
    'ring-color': [{ ring: isColor }],
    // Shadow
    shadow: [{ shadow: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '', isArbitraryValue] }],
  },
  conflictingClassGroups: {
    p: ['px', 'py', 'pl', 'pr', 'pt', 'pb'],
    px: ['pl', 'pr'],
    py: ['pt', 'pb'],
    m: ['mx', 'my'],
  },
  conflictingClassGroupModifiers: {},
  orderSensitiveModifiers: [],
}));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
