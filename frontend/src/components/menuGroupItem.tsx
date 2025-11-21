import { useNavigate } from 'react-router-dom';

type GroupItemProps = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  active?: boolean;
};

export const MenuGroupItem = ({
  to,
  icon: Icon,
  children,
  active = false,
}: GroupItemProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
        active
          ? 'border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700'
          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      } `}
    >
      <Icon className="h-5 w-5" />
      {children}
    </button>
  );
};
