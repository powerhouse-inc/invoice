import { useState, useRef } from "react";
import { Select } from "@powerhousedao/document-engineering";

export const HeaderControls = ({
  contributorOptions = [],
  statusOptions = [],
  onContributorChange,
  onStatusChange,
  onSearchChange,
  onExport,
  onBatchAction,
}: {
  contributorOptions?: { label: string; value: string }[];
  statusOptions?: { label: string; value: string }[];
  onContributorChange?: (value: string | string[]) => void;
  onStatusChange?: (value: string | string[]) => void;
  onSearchChange?: (value: string) => void;
  onExport?: () => void;
  onBatchAction?: (action: string) => void;
}) => {
  const batchOptions = [
    { label: "$ Pay Selected", value: "pay" },
    { label: "Approve Selected", value: "approve" },
    { label: "Reject Selected", value: "reject" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Powerhouse OH Admin Drive</h3>
        <div className="flex gap-2 items-center">
          <button
            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-100"
            onClick={onExport}
          >
            Export to CSV
          </button>
          <Select
            style={{
              width: "180px",
              height: "30px",
            }}
            options={batchOptions}
            onChange={(value) => onBatchAction?.(value as string)}
            placeholder="Batch Action"
            selectionIcon="checkmark"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {/* <Select
          options={contributorOptions}
          onChange={onContributorChange}
          placeholder="Contributor"
        /> */}
        <Select
          style={{
            width: "200px",
            height: "30px",
          }}
          options={statusOptions}
          onChange={onStatusChange}
          placeholder="Status"
          selectionIcon="checkmark"
          multiple={true}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 text-sm"
          placeholder="Search"
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
    </div>
  );
};
