import { Manifest } from "document-model/document";
import * as documentModelsExports from "./document-models";
import * as editorsExports from "./editors";

import manifestJson from "./powerhouse.manifest.json" assert { type: "json" };

export const documentModels = Object.values(documentModelsExports);
export const editors = Object.values(editorsExports);

export const manifest: Manifest = manifestJson;
