import { DocumentSelector, ExtensionContext } from "vscode";
import EditProvider from "./edit_provider";

export default function registerFormatter(
  ctx: ExtensionContext,
  documentSelector: DocumentSelector,
  onformat: () => void = () => {}
): Promise<void> {
  return new EditProvider(onformat).register(ctx, documentSelector);
}
