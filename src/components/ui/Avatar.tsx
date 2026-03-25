interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  // If className contains w-full/h-full skip the fixed size classes so the
  // component stretches to fill its container.
  const hasCustomSize = /\b(w-full|h-full)\b/.test(className);
  const sizeClass = hasCustomSize ? '' : sizeStyles[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          rounded-full object-cover
          ${sizeClass}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-semibold
        bg-[#CFEDEA] text-[#4FB6B2]
        ${sizeClass}
        ${className}
      `}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};

export { Avatar };
export type { AvatarProps };
