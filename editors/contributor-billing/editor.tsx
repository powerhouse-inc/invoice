import { type DriveEditorProps } from "@powerhousedao/reactor-browser";
import { DriveContextProvider } from "@powerhousedao/reactor-browser/hooks/useDriveContext";
import {
  type DocumentDriveDocument,
  addFolder,
  deleteNode,
  updateNode,
  generateNodesCopy,
  copyNode,
} from "document-drive";
import { WagmiContext } from "@powerhousedao/design-system";
import { DriveExplorer } from "./components/DriveExplorer.js";
import { useCallback, useState, useEffect } from "react";
import { generateId } from "document-model";

export type IProps = DriveEditorProps<DocumentDriveDocument>;

export function BaseEditor(props: IProps) {
  const { dispatch, context } = props;

  // Use state for nodes
  const [nodes, setNodes] = useState(props.document.state.global.nodes);

  // Keep nodes in sync with props (in case of external updates)
  useEffect(() => {
    setNodes(props.document.state.global.nodes);
  }, [props.document.state.global.nodes]);

  const onAddFolder = useCallback(
    (name: string, parentFolder?: string) => {
      dispatch(
        addFolder({
          id: generateId(),
          name,
          parentFolder,
        })
      );
    },
    [dispatch]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      dispatch(deleteNode({ id: nodeId }));
      setNodes([...props.document.state.global.nodes]);
    },
    [dispatch, props.document.state.global.nodes]
  );

  const renameNode = useCallback(
    (nodeId: string, name: string) => {
      dispatch(updateNode({ id: nodeId, name }));
    },
    [dispatch]
  );

  const onCopyNode = useCallback(
    (nodeId: string, targetName: string, parentId?: string) => {
      const generateIdWrapper = (prevId: string) => generateId();

      const copyNodesInput = generateNodesCopy(
        {
          srcId: nodeId,
          targetParentFolder: parentId,
          targetName,
        },
        generateIdWrapper,
        props.document.state.global.nodes
      );

      const copyNodesAction = copyNodesInput.map((input) => {
        return copyNode(input);
      });

      for (const copyNodeAction of copyNodesAction) {
        dispatch(copyNodeAction);
      }
    },
    [dispatch, props.document.state.global.nodes]
  );

  return (
    <div className="new-drive-explorer" style={{ height: "100%" }}>
      <DriveExplorer
        key={nodes.length}
        driveId={props.document.state.global.id}
        nodes={nodes}
        onAddFolder={onAddFolder}
        onDeleteNode={onDeleteNode}
        renameNode={renameNode}
        onCopyNode={onCopyNode}
        context={context}
        document={props.document}
        dispatch={dispatch}
      />
    </div>
  );
}

export default function Editor(props: IProps) {
  return (
    <DriveContextProvider value={props.context}>
      <WagmiContext>
        <BaseEditor {...props} />
      </WagmiContext>
    </DriveContextProvider>
  );
}
