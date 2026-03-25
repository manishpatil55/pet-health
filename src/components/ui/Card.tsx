import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'hoverable' | 'selected';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: '',
  hoverable:
    'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(79,182,178,0.15)]',
  selected: 'ring-2 ring-[#4FB6B2]',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      noPadding = false,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-xl shadow-card
          ${noPadding ? '' : 'p-4'}
          ${variantStyles[variant]}
          ${className}
        `}
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
