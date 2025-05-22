export const RowActionMenu = ({
  options,
  onAction
}: {
  options: { label: string; value: string }[];
  onAction: (action: string) => void;
}) => (
  <div
    className="absolute right-0 mt-2 w-[200px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    onClick={e => e.stopPropagation()}
  >
    <div className="py-1">
      {options.map(opt => (
        <button
          key={opt.value}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          onClick={() => onAction(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
); 