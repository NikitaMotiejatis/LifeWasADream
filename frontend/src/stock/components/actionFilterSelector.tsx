import { ReactNode } from 'react';
import DropdownSelector from '@/global/components/dropdownSelector';
import { useTranslation } from 'react-i18next';

export const ACTION_OPTIONS = [
  'ALL',
  'Update',
  'Correction',
  'Remove',
  'Add',
] as const;

export type ActionFilterValue = (typeof ACTION_OPTIONS)[number];

type Props = {
  selected: ActionFilterValue;
  onChange: (value: ActionFilterValue) => void;
};

export default function ActionFilterDropdown({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const options = ACTION_OPTIONS.map(value => ({
    value,
    label: t(
      `auditHistory.filters.${value === 'ALL' ? 'allActions' : value.toLowerCase()}`,
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
