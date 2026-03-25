import type { VaccinationStatus, DewormingStatus, MedicationStatus } from '@/types';

// ─── Status → Color Mapping ────────────────────────────────

type StatusType = VaccinationStatus | DewormingStatus;

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  tailwindBg: string;
  tailwindText: string;
}

const statusMap: Record<StatusType, StatusConfig> = {
  completed: {
    label: 'Completed',
    color: '#6BCB77',
    bgColor: 'rgba(107, 203, 119, 0.15)',
    textColor: '#6BCB77',
    tailwindBg: 'bg-[#6BCB77]/15',
    tailwindText: 'text-[#6BCB77]',
  },
  upcoming: {
    label: 'Upcoming',
    color: '#F2B544',
    bgColor: 'rgba(242, 181, 68, 0.15)',
    textColor: '#F2B544',
    tailwindBg: 'bg-[#F2B544]/15',
    tailwindText: 'text-[#F2B544]',
  },
  overdue: {
    label: 'Overdue',
    color: '#E76F51',
    bgColor: 'rgba(231, 111, 81, 0.15)',
    textColor: '#E76F51',
    tailwindBg: 'bg-[#E76F51]/15',
    tailwindText: 'text-[#E76F51]',
  },
};

export const getStatusConfig = (status: StatusType): StatusConfig => {
  return statusMap[status];
};

export const getStatusLabel = (status: StatusType): string => {
  return statusMap[status].label;
};

export const getStatusColor = (status: StatusType): string => {
  return statusMap[status].color;
};

// ─── Medication Status ──────────────────────────────────────

interface MedStatusConfig {
  label: string;
  tailwindBg: string;
  tailwindText: string;
}

const medicationStatusMap: Record<MedicationStatus, MedStatusConfig> = {
  active: {
    label: 'Active',
    tailwindBg: 'bg-[#4FB6B2]/15',
    tailwindText: 'text-[#4FB6B2]',
  },
  completed: {
    label: 'Completed',
    tailwindBg: 'bg-[#6BCB77]/15',
    tailwindText: 'text-[#6BCB77]',
  },
  stopped: {
    label: 'Stopped',
    tailwindBg: 'bg-[#7A8A8A]/15',
    tailwindText: 'text-[#7A8A8A]',
  },
};

export const getMedicationStatusConfig = (
  status: MedicationStatus,
): MedStatusConfig => {
  return medicationStatusMap[status];
};

// ─── Priority Sorting Helper ────────────────────────────────

const statusPriority: Record<StatusType, number> = {
  overdue: 0,
  upcoming: 1,
  completed: 2,
};

export const sortByStatusPriority = <T extends { status: StatusType }>(
  items: T[],
): T[] => {
  return [...items].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status],
  );
};
