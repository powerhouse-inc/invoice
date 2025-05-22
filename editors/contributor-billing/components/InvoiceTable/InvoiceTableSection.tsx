import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const InvoiceTableSection = ({
  title,
  count,
  children,
  color = "bg-blue-100 text-blue-600",
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="font-medium">{title}</span>
        <span
          className={`inline-flex items-center justify-center rounded-full text-xs font-bold px-2 ${color}`}
        >
          {count}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-900" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-900" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};
