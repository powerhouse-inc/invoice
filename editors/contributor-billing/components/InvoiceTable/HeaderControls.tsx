import { useState, useRef } from "react";
import { Select } from "@powerhousedao/document-engineering";

export const HeaderControls = ({
  contributorOptions = [],
  statusOptions = [],
  onContributorChange,
  onStatusChange,
  onSearchChange,
  onExport,
  onBatchAction
}: {
  contributorOptions?: { label: string; value: string }[];
  statusOptions?: { label: string; value: string }[];
  onContributorChange?: (value: string | string[]) => void;
  onStatusChange?: (value: string | string[]) => void;
  onSearchChange?: (value: string) => void;
  onExport?: () => void;
  onBatchAction?: (action: string) => void;
}) => {
  const [batchOpen, setBatchOpen] = useState(false);
  const batchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  // (Add useEffect for click outside if needed)

  return (
    <div className="flex flex-row gap-2 items-center mb-4">
      <Select
        options={contributorOptions}
        onChange={onContributorChange}
        placeholder="Contributor"
      />
      <Select
        options={statusOptions}
        onChange={onStatusChange}
        placeholder="Status"
      />
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm"
        placeholder="Search"
        onChange={e => onSearchChange?.(e.target.value)}
      />
      <button
        className="bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-100"
        onClick={onExport}
      >
        Export to CSV
      </button>
      <div className="relative" ref={batchRef}>
        <button
          className="bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => setBatchOpen(v => !v)}
        >
          Batch Action
        </button>
        {batchOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { onBatchAction?.("pay"); setBatchOpen(false); }}>
                $ Pay Selected
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { onBatchAction?.("approve"); setBatchOpen(false); }}>
                Approve Selected
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => { onBatchAction?.("reject"); setBatchOpen(false); }}>
                Rejected Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 