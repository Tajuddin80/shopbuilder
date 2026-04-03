import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { getPreviewAnimationStyle } from "~/lib/animationPreview";
import type { Column, ResponsiveValue, Section } from "~/lib/pageSchema";
import { useBuilderStore } from "~/store/builderStore";
import { DraggableCanvasElement } from "./DraggableCanvasElement";

function getResponsiveValue<T>(
  value: T | ResponsiveValue<T> | undefined,
  breakpoint: "desktop" | "tablet" | "mobile",
  fallback: T,
) {
  if (value && typeof value === "object" && breakpoint in value) {
    const responsive = value as ResponsiveValue<T>;
    return (responsive[breakpoint] ?? responsive.desktop ?? fallback) as T;
  }

  return (value ?? fallback) as T;
}

function CanvasColumn({
  column,
  sectionId,
  breakpoint,
  showChrome,
}: {
  column: Column;
  sectionId: string;
  breakpoint: "desktop" | "tablet" | "mobile";
  showChrome: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-drop-${column.id}`,
    data: {
      type: "column",
      sectionId,
      columnId: column.id,
      index: column.elements.length,
    },
  });

  const justifyContent =
    column.settings.verticalAlign === "middle"
      ? "center"
      : column.settings.verticalAlign === "bottom"
        ? "flex-end"
        : "flex-start";

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: `1 1 ${getResponsiveValue(column.width, breakpoint, 100)}%`,
        minWidth: breakpoint === "mobile" ? "100%" : 240,
        border: isOver
          ? "1px dashed #60a5fa"
          : showChrome
            ? "1px dashed rgba(148, 163, 184, 0.28)"
            : "1px dashed transparent",
        borderRadius: 18,
        padding: `${getResponsiveValue(column.settings.paddingTop, breakpoint, 0)}px ${getResponsiveValue(column.settings.paddingRight, breakpoint, 10)}px ${getResponsiveValue(column.settings.paddingBottom, breakpoint, 0)}px ${getResponsiveValue(column.settings.paddingLeft, breakpoint, 10)}px`,
        background: isOver
          ? "rgba(239, 246, 255, 0.92)"
          : column.settings.backgroundColor || "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent,
        gap: 8,
        minHeight: 80,
        transition: "border-color 0.2s ease, background 0.2s ease",
      }}
    >
      <SortableContext
        items={column.elements.map((element) => element.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.elements.length === 0 ? (
          <div
            style={{
              padding: "18px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.72)",
              color: "#64748b",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Drop blocks here
          </div>
        ) : (
          column.elements.map((element, elementIndex) => (
            <DraggableCanvasElement
              key={element.id}
              element={element}
              sectionId={sectionId}
              columnId={column.id}
              index={elementIndex}
            />
          ))
        )}
      </SortableContext>
    </div>
  );
}

export function DroppableSection({ section }: { section: Section }) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: "section", sectionId: section.id, label: section.name },
  });
  const {
    activeBreakpoint,
    deleteSection,
    pageContent,
    previewMode,
    selectElement,
    selectedElementId,
    selectedSectionId,
  } = useBuilderStore();

  const isSelectedSection =
    selectedSectionId === section.id && !selectedElementId;
  const showSectionChrome = !previewMode && (isHovered || isSelectedSection);
  const previewId = `canvas-section-${section.id}`;

  const sectionPaddingTop = getResponsiveValue(
    section.settings.paddingTop,
    activeBreakpoint,
    40,
  );
  const sectionPaddingBottom = getResponsiveValue(
    section.settings.paddingBottom,
    activeBreakpoint,
    40,
  );
  const sectionPaddingLeft = getResponsiveValue(
    section.settings.paddingLeft,
    activeBreakpoint,
    20,
  );
  const sectionPaddingRight = getResponsiveValue(
    section.settings.paddingRight,
    activeBreakpoint,
    20,
  );
  const sectionMarginTop = getResponsiveValue(
    section.settings.marginTop,
    activeBreakpoint,
    0,
  );
  const sectionMarginBottom = getResponsiveValue(
    section.settings.marginBottom,
    activeBreakpoint,
    0,
  );
  const sectionMinHeight = getResponsiveValue(
    section.settings.minHeight,
    activeBreakpoint,
    null,
  );
  const animationStyle = getPreviewAnimationStyle(section.settings.animation);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        margin: `${sectionMarginTop}px 16px ${sectionMarginBottom}px`,
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectElement(null, section.id)}
    >
      {section.settings.customCss ? (
        <style>{`#${previewId}{${section.settings.customCss}}`}</style>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 3,
          display: "flex",
          gap: 8,
          opacity: showSectionChrome ? 1 : 0,
          transform: showSectionChrome ? "translateY(0)" : "translateY(-4px)",
          pointerEvents: showSectionChrome ? "auto" : "none",
          transition: "opacity 0.16s ease, transform 0.16s ease",
        }}
      >
          <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "rgba(255,255,255,0.96)",
              color: "#0f172a",
              cursor: "grab",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.08)",
            }}
            aria-label="Drag section"
            title="Drag section"
          >
            &#8942;
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              deleteSection(section.id);
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "rgba(255,255,255,0.96)",
              color: "#b91c1c",
              cursor: "pointer",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.08)",
            }}
            aria-label="Delete section"
            title="Delete section"
          >
            &#10005;
          </button>
      </div>

      <div
        id={previewId}
        style={{
          ...animationStyle,
          borderRadius: section.settings.borderRadius ?? 24,
          border: isSelectedSection
            ? "1px solid #60a5fa"
            : section.settings.borderWidth > 0
              ? `${section.settings.borderWidth}px ${section.settings.borderStyle} ${section.settings.borderColor}`
              : "1px solid transparent",
          boxShadow: isSelectedSection
            ? "0 0 0 4px rgba(96, 165, 250, 0.18)"
            : "0 16px 36px rgba(15, 23, 42, 0.06)",
          backgroundColor:
            getResponsiveValue(
              section.settings.backgroundColor,
              activeBreakpoint,
              "#ffffff",
            ) || "#ffffff",
          backgroundImage: section.settings.backgroundImage
            ? `url(${section.settings.backgroundImage})`
            : undefined,
          backgroundSize: section.settings.backgroundSize || "cover",
          backgroundPosition: section.settings.backgroundPosition || "center",
          overflow: "hidden",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div
          style={{
            width: section.settings.fullWidth ? "100%" : "min(100%, 1200px)",
            maxWidth: section.settings.fullWidth
              ? undefined
              : pageContent.globalStyles.maxWidth,
            margin: "0 auto",
            minHeight: sectionMinHeight ?? undefined,
            padding: `${sectionPaddingTop}px ${sectionPaddingRight}px ${sectionPaddingBottom}px ${sectionPaddingLeft}px`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: activeBreakpoint === "desktop" ? "nowrap" : "wrap",
              alignItems: "stretch",
            }}
          >
            {section.columns.map((column) => (
              <CanvasColumn
                key={column.id}
                column={column}
                sectionId={section.id}
                breakpoint={activeBreakpoint}
                showChrome={showSectionChrome}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
