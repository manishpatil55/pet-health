import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

const EmptyState = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CFEDEA]">
        <Icon className="h-8 w-8 text-[#4FB6B2]" />
      </div>
      <h3 className="text-base font-semibold text-[#2F3A3A] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#7A8A8A] mb-4 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};

export { EmptyState };
export type { EmptyStateProps };
