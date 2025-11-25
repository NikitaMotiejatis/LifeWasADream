import ChevronDownIcon from './icons/chevronDownIcon';

type GroupProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export const MenuGroup = ({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
}: GroupProps) => (
  <div>
    <div
      className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 text-base">
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </div>
      <ChevronDownIcon
        className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </div>

    {open && <div className="mt-2 ml-8 space-y-2">{children}</div>}
  </div>
);
