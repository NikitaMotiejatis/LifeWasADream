import { useTranslation } from 'react-i18next';
import DropdownSelector from '@/global/components/dropdownSelector';

export const CATEGORIES = [
  'All Categories',
  'Raw Materials',
  'Dairy',
  'Packaging',
  'Bakery',
  'Ingredients',
] as const;

export type CategoryValue = (typeof CATEGORIES)[number];

type Props = {
  selected: CategoryValue;
  onChange: (value: CategoryValue) => void;
};

export default function CategorySelector({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const options = CATEGORIES.map(value => ({
    value,
    label: t(`stockUpdates.categories.${value}`),
  }));

  return (
    <DropdownSelector
      options={options}
      selected={selected}
      onChange={onChange}
      buttonClassName="w-48 px-3 py-2"
    />
  );
}
