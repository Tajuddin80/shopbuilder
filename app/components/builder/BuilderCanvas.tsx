import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { useBuilderStore } from "~/store/builderStore";
import { DroppableSection } from "./DroppableSection";

export function BuilderCanvas() {
  const { pageContent, activeBreakpoint, setSections, moveElement } = useBuilderStore();
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const viewportWidth = { desktop: "100%", tablet: "768px", mobile: "375px" }[activeBreakpoint];

  function handleDragStart(event: DragStartEvent) {
    setActiveDragItem(event.active.data.current);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "section" && overData?.type === "section") {
      const sections = [...pageContent.sections];
      const fromIdx = sections.findIndex((s) => s.id === active.id);
      const toIdx = sections.findIndex((s) => s.id === over.id);
      const [removed] = sections.splice(fromIdx, 1);
      sections.splice(toIdx, 0, removed);
      setSections(sections);
      return;
    }

    if (activeData?.type === "element") {
      moveElement(
        activeData.elementId,
        activeData.sectionId,
        activeData.columnId,
        overData?.sectionId || activeData.sectionId,
        overData?.columnId || activeData.columnId,
        overData?.index ?? 999,
      );
    }
  }

  return (
    <div
      className="pb-canvas-wrapper"
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "auto",
        background: "#f1f3f5",
        display: "flex",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="pb-canvas"
          style={{
            width: viewportWidth,
            minHeight: "100vh",
            background: "#fff",
            boxShadow: "0 0 0 1px #e1e3e5, 0 4px 16px rgba(0,0,0,0.08)",
            transition: "width 0.3s ease",
            position: "relative",
          }}
        >
          <SortableContext
            items={pageContent.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {pageContent.sections.map((section) => (
              <DroppableSection key={section.id} section={section} />
            ))}
          </SortableContext>

          {pageContent.sections.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 400,
                color: "#8c9196",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 14 }}>Drag a section from the left panel to get started</div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeDragItem && (
            <div
              style={{
                opacity: 0.7,
                background: "#fff",
                border: "2px dashed #2c6ecb",
                borderRadius: 4,
                padding: 12,
                minWidth: 240,
              }}
            >
              Moving…
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

