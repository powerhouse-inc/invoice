import { type FC, useEffect, useRef } from 'react';
import { type DriveEditorContext, type User } from "@powerhousedao/reactor-browser";

interface DocumentDispatchProps {
  documentId: string;
  driveId: string;
  documentModelModule: any;
  context: DriveEditorContext;
  onDispatchReady: (dispatch: (action: any) => void) => void;
}

export const DocumentDispatch: FC<DocumentDispatchProps> = ({
  documentId,
  driveId,
  documentModelModule,
  context,
  onDispatchReady,
}) => {
  const { useDocumentEditorProps } = context;
  const { dispatch } = useDocumentEditorProps({
    documentId,
    documentType: "powerhouse/invoice",
    driveId,
    documentModelModule,
    user: context.user as User | undefined,
  });

  // Keep track of whether we've already notified about this dispatch
  const hasNotified = useRef(false);

  useEffect(() => {
    if (dispatch && !hasNotified.current) {
      onDispatchReady(dispatch);
      hasNotified.current = true;
    }
  }, [dispatch, onDispatchReady]);

  return null;
}; 