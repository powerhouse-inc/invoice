import {
  type BaseUiFileNode,
  type BaseUiFolderNode,
  type BaseUiNode,
  type UiFileNode,
  type UiFolderNode,
  type UiNode,
} from "@powerhousedao/design-system";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { addFile, copyNode, DocumentDriveAction, moveNode, type DocumentDriveDocument, type FileNode, type Node } from "document-drive";
import { FileItemsGrid } from "./FileItemsGrid.js";
import { FolderItemsGrid } from "./FolderItemsGrid.js";
import { FolderTree } from "./FolderTree.js";
import { useTransformedNodes } from "../hooks/useTransformedNodes.js";
import { useSelectedFolderChildren } from "../hooks/useSelectedFolderChildren.js";
import { useDispatchMap } from "../hooks/useDispatchMap.js";
import { DocumentDispatch } from "./DocumentDispatch.js";
import { EditorContainer } from "./EditorContainer.js";
import type { EditorContext, DocumentModelModule, EditorDispatch } from "document-model";
import { CreateDocumentModal } from "@powerhousedao/design-system";
import { CreateDocument } from "./CreateDocument.js";
import {
  type DriveEditorContext,
  UiDriveNode,
  useDriveActions,
  useDriveActionsWithUiNodes,
  useDriveContext,
  type User,
} from "@powerhousedao/reactor-browser";
import { InvoiceTable } from "./InvoiceTable/InvoiceTable.js";
import { actions, Status } from "../../../document-models/invoice/index.js";
import { useDrop } from "../hooks/useDrop.js";

interface DriveExplorerProps {
  driveId: string;
  nodes: Node[];
  onAddFolder: (name: string, parentFolder?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, name: string) => void;
  onCopyNode: (nodeId: string, targetName: string, parentId?: string) => void;
  context: DriveEditorContext;
  document: DocumentDriveDocument;
  dispatch: EditorDispatch<DocumentDriveAction>
}

export function DriveExplorer({
  driveId,
  nodes,
  onDeleteNode,
  renameNode,
  onAddFolder,
  onCopyNode,
  context,
  document,
  dispatch
}: DriveExplorerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [activeDocumentId, setActiveDocumentId] = useState<
    string | undefined
  >();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<{ [id: string]: boolean }>({});
  const selectedDocumentModel = useRef<DocumentModelModule | null>(null);
  const { addDocument, documentModels, useDriveDocumentStates, selectedNode} =
    useDriveContext();
  const [state, fetchDocuments] = useDriveDocumentStates({ driveId });

  const { useDocumentEditorProps } = context;

  // Use our custom hook to manage the dispatch map
  const { dispatchMap, handleDispatchReady } = useDispatchMap(nodes, driveId, documentModels[1], context);

  const handleBatchAction = useCallback((action: string) => {
    Object.entries(selected).forEach(([id, checked]) => {
      console.log(action)
      if(checked) {
        if (action === 'approve' && dispatchMap[id]) {
          dispatchMap[id](actions.editStatus({
            status: "AWAITINGPAYMENT",
        }));
      } else if (action === 'reject' && dispatchMap[id]) {
        dispatchMap[id](actions.editStatus({
            status: "REJECTED",
          }));
        }
      }
      else if(action === 'pay' && dispatchMap[id]) {
        dispatchMap[id](actions.editStatus({
          status: "PAYMENTRECEIVED",
        }));
      }
    });
  }, [selected, dispatchMap]);

  // Transform nodes using the custom hook
  const transformedNodes = useTransformedNodes(nodes, driveId);

  // Separate folders and files
  const folders = transformedNodes.filter(
    (node): node is UiFolderNode => node.kind === "FOLDER"
  );
  const files = transformedNodes.filter(
    (node): node is UiFileNode => node.kind === "FILE"
  );

  // Get the active document info from nodes
  const activeDocument = activeDocumentId
    ? files.find((file) => file.id === activeDocumentId)
    : undefined;

  const documentModelModule = activeDocument
    ? context.getDocumentModelModule(activeDocument.documentType)
    : null;

  useEffect(() => {
    fetchDocuments(driveId).catch(console.error);
  }, [activeDocumentId]);

  // Dummy functions to satisfy component types
  const dummyDuplicateNode = useCallback((node: BaseUiNode) => {
    console.log("Duplicate node:", node);
  }, []);

  const dummyAddFile = useCallback(
    async (file: File, parentNode: BaseUiNode | null) => {
      console.log("Add file:", file, parentNode);
    },
    []
  );

  const dummyMoveNode = useCallback(
    async (uiNode: BaseUiNode, targetNode: BaseUiNode) => {
      console.log("Move node:", uiNode, targetNode);
    },
    []
  );

  const handleNodeSelect = useCallback((node: BaseUiFolderNode) => {
    console.log("Selected node:", node);
    setSelectedNodeId(node.id);
  }, []);

  const handleFileSelect = useCallback((node: BaseUiFileNode) => {
    setActiveDocumentId(node.id);
  }, []);

  const handleEditorClose = useCallback(() => {
    setActiveDocumentId(undefined);
  }, []);

  const onCreateDocument = useCallback(
    async (fileName: string) => {
      setOpenModal(false);

      const documentModel = selectedDocumentModel.current;
      if (!documentModel) return;

      const node = await addDocument(
        driveId,
        fileName,
        documentModel.documentModel.id
      );

      selectedDocumentModel.current = null;
      setActiveDocumentId(node.id);
    },
    [addDocument, driveId]
  );

  const { addFile, copyNode, moveNode } = useDriveActionsWithUiNodes(document, dispatch);
  const { isDropTarget, dropProps } = useDrop({
    uiNode: selectedNode?.kind === "FOLDER" ? selectedNode as UiFolderNode : null,
    onAddFile: addFile,
    onCopyNode: copyNode,
    onMoveNode: moveNode,
  });

  const onSelectDocumentModel = useCallback(
    (documentModel: DocumentModelModule) => {
      selectedDocumentModel.current = documentModel;
      setOpenModal(true);
    },
    []
  );

  const filteredDocumentModels = documentModels;

  // Get children of selected folder using the custom hook
  const selectedFolderChildren = useSelectedFolderChildren(
    selectedNodeId,
    folders,
    files
  );

  const editorModule = activeDocument
    ? context.getEditor(activeDocument.documentType)
    : null;


  return (
    <div className="flex h-full">
      {/* Hidden DocumentDispatch components for each node */}
      {nodes.map(node => (
        <DocumentDispatch
          key={node.id}
          documentId={node.id}
          driveId={driveId}
          documentModelModule={documentModels[1]}
          context={context}
          onDispatchReady={(dispatch) => handleDispatchReady(node.id, dispatch)}
        />
      ))}

      {/* Sidebar */}
      {/* <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Folders</h2>
        <FolderTree
          folders={folders}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleNodeSelect}
        />
      </div> */}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeDocument && documentModelModule && editorModule ? (
          <EditorContainer
            context={context}
            documentId={activeDocumentId!}
            documentType={activeDocument.documentType}
            driveId={driveId}
            onClose={handleEditorClose}
            title={activeDocument.name}
            documentModelModule={documentModelModule}
            editorModule={editorModule} />
        ) : (
          <div {...dropProps}
              className={twMerge(
                'rounded-md border-2 border-transparent ',
                isDropTarget && 'border-dashed border-blue-100'
              )}>
              {/* <h2 className="text-lg font-semibold mb-4">Contents</h2> */}

              {/* Folders Section */}
              <FolderItemsGrid
                folders={selectedFolderChildren.folders}
                onSelectNode={handleNodeSelect}
                onRenameNode={renameNode}
                onDuplicateNode={(uiNode) => onCopyNode(
                  uiNode.id,
                  "Copy of " + uiNode.name,
                  uiNode.parentFolder
                )}
                onDeleteNode={onDeleteNode}
                onAddFile={dummyAddFile}
                onCopyNode={async (uiNode, targetNode) => onCopyNode(uiNode.id, "Copy of " + uiNode.name, targetNode.id)}
                onMoveNode={dummyMoveNode}
                isAllowedToCreateDocuments={true}
                onAddFolder={onAddFolder}
                parentFolderId={selectedNodeId} />

              {/* Files Section */}
              <FileItemsGrid
                files={selectedFolderChildren.files}
                onSelectNode={handleFileSelect}
                onRenameNode={renameNode}
                onDuplicateNode={dummyDuplicateNode}
                onDeleteNode={onDeleteNode}
                isAllowedToCreateDocuments={true} />

              {/* Create Document Section */}
              <CreateDocument
                createDocument={onSelectDocumentModel}
                documentModels={filteredDocumentModels} />
              <InvoiceTable
                setActiveDocumentId={setActiveDocumentId}
                files={files}
                state={state}
                getDispatch={() => dispatchMap[activeDocumentId || ""]}
                selected={selected}
                setSelected={setSelected}
                onBatchAction={handleBatchAction} />
            </div>
        )}
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        onContinue={onCreateDocument}
        onOpenChange={(open) => setOpenModal(open)}
        open={openModal}
      />
    </div>
  );
}
