import type { MemberActivityDay } from '../../types/member';

export type MemberMoveDashboardProps = {
  selected: string;
  week: string[];
  days: MemberActivityDay[];
  today?: MemberActivityDay;
  day?: MemberActivityDay;
  paused: boolean;
  hasGoal: boolean;
  pending: boolean;
  loading: boolean;
  error: string;
  onSelect: (date: string) => void;
  onDay: (offset: number) => void;
  onWeek: (offset: number) => void;
  onCalendar: () => void;
  onGoal: () => void;
  onPause: () => void;
  onRefresh: () => void;
  onClose?: () => void;
};

// The native activity screen retains its existing presentation.
export function MemberMoveDashboard(_props: MemberMoveDashboardProps) { return null; }
