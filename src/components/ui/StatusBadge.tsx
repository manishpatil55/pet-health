import type { VaccinationStatus, MedicationStatus, DewormingStatus } from '@/types';

type AnyStatus = VaccinationStatus | MedicationStatus | DewormingStatus;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const config: Record<
  string,
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
  active: {
    label: 'Active',
    bg: 'bg-[#F2B544]/15',
    text: 'text-[#F2B544]',
  },
  ongoing: {
    label: 'Ongoing',
    bg: 'bg-[#F2B544]/15',
    text: 'text-[#F2B544]',
  },
  stopped: {
    label: 'Stopped',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
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
  const s = (status || 'upcoming').toLowerCase();
  const { label, bg, text } = config[s] || config.upcoming;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${bg} ${text}
        ${sizeStyles[size]}
        ${pulse && s === 'overdue' ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          s === 'completed'
            ? 'bg-[#6BCB77]'
            : s === 'upcoming' || s === 'active' || s === 'ongoing'
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
