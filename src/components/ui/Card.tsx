import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'hoverable' | 'selected' | 'dark';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      noPadding = false,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const isDark = variant === 'dark';

    return (
      <div
        ref={ref}
        className={`
          rounded-3xl
          ${noPadding ? '' : 'p-6'}
          ${variant === 'hoverable' ? 'cursor-pointer transition-all duration-280 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,106,103,0.12)]' : ''}
          ${variant === 'selected' ? 'ring-2 ring-[#4FB6B2]' : ''}
          ${className}
        `}
        style={{
          background: isDark ? '#004442' : '#ffffff',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,68,66,.22)'
            : '0 2px 20px rgba(19,29,30,.06)',
          border: isDark ? 'none' : '1px solid rgba(189,201,199,.22)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export { Card };
export type { CardProps };
