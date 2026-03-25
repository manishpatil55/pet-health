import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-[#E6EEEE]/50 text-[#2F3A3A]',
  primary: 'bg-[#CFEDEA] text-[#4FB6B2]',
  success: 'bg-[#6BCB77]/15 text-[#6BCB77]',
  warning: 'bg-[#F2B544]/15 text-[#F2B544]',
  error: 'bg-[#E76F51]/15 text-[#E76F51]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeProps };
