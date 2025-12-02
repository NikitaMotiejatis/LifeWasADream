import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownSelector from './dropdownSelector';

const branches = [
  { value: 'downtown' as const, labelKey: 'topbar.branchSelect' as const },
  { value: 'north' as const, labelKey: 'topbar.northBranch' as const },
  { value: 'west' as const, labelKey: 'topbar.westBranch' as const },
] as const;

type BranchValue = (typeof branches)[number]['value'];

export default function BranchSelector() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BranchValue>('downtown');

  const options = branches.map(b => ({
    value: b.value,
    label: t(b.labelKey),
  }));

  return (
    <DropdownSelector
      options={options}
      selected={selected}
      onChange={setSelected}
      buttonClassName="w-48 px-3 py-1.5"
    />
  );
}
