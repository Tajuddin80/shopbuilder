import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { createSectionFromPreset } from "~/lib/sectionPresets";
import { useBuilderStore } from "~/store/builderStore";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderSidebar } from "./BuilderSidebar";

export function BuilderWorkspace() {
  const { pageContent, setSections, moveElement, addSection, selectElement } =
    useBuilderStore();
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragItem(event.active.data.current);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;

    if (activeData?.type === "section-preset") {
      const section = createSectionFromPreset(activeData.presetId);
      if (!section) return;

      const insertAt =
        overData?.type === "section"
          ? pageContent.sections.findIndex(
              (candidate) => candidate.id === over.id,
            )
          : undefined;

      addSection(section, insertAt !== -1 ? insertAt : undefined);
      selectElement(null, section.id);
      return;
    }

    if (active.id === over.id) return;

    if (activeData?.type === "section" && overData?.type === "section") {
      const sections = [...pageContent.sections];
      const fromIdx = sections.findIndex((section) => section.id === active.id);
      const toIdx = sections.findIndex((section) => section.id === over.id);
      if (fromIdx < 0 || toIdx < 0) return;
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
        activeData.index ?? 0,
        overData?.sectionId || activeData.sectionId,
        overData?.columnId || activeData.columnId,
        overData?.index ?? 999,
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <BuilderSidebar />
        <BuilderCanvas />
      </div>

      <DragOverlay>
        {activeDragItem && (
          <div
            style={{
              minWidth: 260,
              borderRadius: 16,
              border: "1px solid #bfd7ff",
              background: "#ffffff",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#5c6a79",
                textTransform: "uppercase",
              }}
            >
              Dragging
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {activeDragItem.label || "Section"}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
