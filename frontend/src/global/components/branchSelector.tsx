import { useState } from 'react';
import DropdownSelector from './dropdownSelector';

export default function BranchSelector() {
  const businessInfo = JSON.parse(localStorage.getItem('businessInfo') || '');
  const [selected, setSelected] = useState<string>(businessInfo.locations[0].id.toString());

  localStorage.setItem('selectedLocation', selected);

  const locationOptions = businessInfo
    .locations
    .map((l: { id: number, name: string }) => {
        return { value: l.id.toString(), label: l.name }
    });

  return (
    <DropdownSelector
      options={locationOptions}
      selected={selected}
      onChange={setSelected}
      buttonClassName='w-96 px-3 py-2'
      menuClassName='w-96'
    />
  );
}
