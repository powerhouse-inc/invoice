import type { EditorModule } from "document-model";
import Editor from "./editor.js";
import type { InvoiceDocument } from "../../document-models/invoice/index.js";

export const module: EditorModule<InvoiceDocument> = {
  Component: Editor,
  documentTypes: ["powerhouse/invoice"],
  config: {
    id: "powerhouse-invoice-editor",
    disableExternalControls: true,
    documentToolbarEnabled: true,
    showSwitchboardLink: true,
  },
};

export default module;
