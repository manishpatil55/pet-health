import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#006a67] text-white hover:bg-[#004442] active:bg-[#003836] shadow-[0_4px_16px_rgba(0,106,103,0.25)] hover:shadow-[0_8px_28px_rgba(0,106,103,0.35)]',
  secondary:
    'border-[1.5px] border-[#4FB6B2] text-[#006a67] bg-transparent hover:bg-[#CFEDEA]/30 active:bg-[#CFEDEA]/50',
  ghost:
    'text-[#3d4948] hover:bg-[#eaf6f5] active:bg-[#dfebea]',
  danger:
    'bg-[#E76F51] text-white hover:bg-[#d4603f] active:bg-[#c0563a] shadow-[0_4px_16px_rgba(231,111,81,0.25)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      pill = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 font-bold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${pill ? 'rounded-full' : 'rounded-xl'}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
