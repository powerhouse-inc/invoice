import { useState, useCallback } from 'react';
import { type DriveEditorContext } from "@powerhousedao/reactor-browser";
import { type Node } from "document-drive";

export const useDispatchMap = (
  nodes: Node[],
  driveId: string,
  documentModelModule: any,
  context: DriveEditorContext
) => {
  const [dispatchMap, setDispatchMap] = useState<{ [id: string]: (action: any) => void }>({});

  // Update dispatch map when a new dispatch is ready
  const handleDispatchReady = useCallback((nodeId: string, dispatch: (action: any) => void) => {
    setDispatchMap(prev => {
      // Only update if the dispatch is different
      if (prev[nodeId] === dispatch) {
        return prev;
      }
      return {
        ...prev,
        [nodeId]: dispatch
      };
    });
  }, []);

  return {
    dispatchMap,
    handleDispatchReady
  };
}; 