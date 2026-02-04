interface SpinnerProps {
  /** Size variant: sm (16px), md (24px), lg (40px) */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-2',
} as const;

/**
 * Spinner component for loading states.
 * Uses the app's orange accent color.
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const classes = [
    'rounded-full animate-spin border-orange-500/30 border-t-orange-500',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <output aria-label="Loading" className={classes} />;
}

export default Spinner;
