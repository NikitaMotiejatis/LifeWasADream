import { ReactNode } from 'react';
import DropdownSelector from '@/global/components/dropdownSelector';
import { useTranslation } from 'react-i18next';

export const TIME_PERIOD_OPTIONS = [
  'Today',
  'This Week',
  'This Month',
  'All Time',
] as const;

export type TimePeriodValue = (typeof TIME_PERIOD_OPTIONS)[number];

const TIME_PERIOD_I18N_KEY: Record<TimePeriodValue, string> = {
  Today: 'today',
  'This Week': 'thisWeek',
  'This Month': 'thisMonth',
  'All Time': 'allTime',
} as const;

type Props = {
  selected: TimePeriodValue;
  onChange: (value: TimePeriodValue) => void;
};

export default function TimePeriodFilterDropdown({
  selected,
  onChange,
}: Props) {
  const { t } = useTranslation();

  const options = TIME_PERIOD_OPTIONS.map(value => ({
    value,
    label: t(
      `auditHistory.filters.${TIME_PERIOD_I18N_KEY[value]}`,
    ) as ReactNode,
  }));

  return (
    <DropdownSelector
      options={options}
      selected={selected}
      onChange={onChange}
      buttonClassName="w-full px-4 py-2 text-left justify-between"
    />
  );
}
