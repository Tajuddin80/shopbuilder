import { useBuilderStore } from "~/store/builderStore";
import { CanvasElementPreview } from "./CanvasElementPreview";
import { DraggableElement } from "./DraggableElement";

export function DraggableCanvasElement({
  element,
  sectionId,
  columnId,
  index,
}: {
  element: any;
  sectionId: string;
  columnId: string;
  index: number;
}) {
  const { activeBreakpoint, selectedElementId, selectElement, deleteElement } =
    useBuilderStore();
  const isSelected = selectedElementId === element.id;
  const previewId = `canvas-preview-${element.id}`;
  const alignment =
    element.settings?.textAlign?.[activeBreakpoint] === "center"
      ? "center"
      : element.settings?.textAlign?.[activeBreakpoint] === "right"
        ? "flex-end"
        : "flex-start";

  return (
    <DraggableElement
      id={element.id}
      data={{
        type: "element",
        elementId: element.id,
        sectionId,
        columnId,
        index,
        label: element.name || element.type,
      }}
      alignment={alignment}
      width={element.settings?.width?.[activeBreakpoint] || "100%"}
      maxWidth={element.settings?.maxWidth?.[activeBreakpoint] || "100%"}
      settings={element.settings}
      isSelected={isSelected}
      onSelect={() => selectElement(element.id, sectionId)}
      onDelete={() => deleteElement(element.id)}
    >
      <div
        style={{
          textAlign: element.settings?.textAlign?.[activeBreakpoint] || "left",
        }}
      >
        <CanvasElementPreview element={element} previewId={previewId} />
      </div>
    </DraggableElement>
  );
}
