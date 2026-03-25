import type { VaccinationStatus } from '@/types';

interface StatusBadgeProps {
  status: VaccinationStatus;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const config: Record<
  VaccinationStatus,
  { label: string; bg: string; text: string }
> = {
  completed: {
    label: 'Completed',
    bg: 'bg-[#6BCB77]/15',
    text: 'text-[#6BCB77]',
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-[#F2B544]/15',
    text: 'text-[#F2B544]',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-[#E76F51]/15',
    text: 'text-[#E76F51]',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

const StatusBadge = ({
  status,
  size = 'md',
  pulse = false,
  className = '',
}: StatusBadgeProps) => {
  const { label, bg, text } = config[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${bg} ${text}
        ${sizeStyles[size]}
        ${pulse && status === 'overdue' ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'completed'
            ? 'bg-[#6BCB77]'
            : status === 'upcoming'
              ? 'bg-[#F2B544]'
              : 'bg-[#E76F51]'
        }`}
      />
      {label}
    </span>
  );
};

export { StatusBadge };
export type { StatusBadgeProps };
