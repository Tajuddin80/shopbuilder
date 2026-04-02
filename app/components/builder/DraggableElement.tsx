import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type ReactNode } from "react";
import type { BaseElementSettings, ResponsiveValue } from "~/lib/pageSchema";
import { useBuilderStore } from "~/store/builderStore";
import { ResizeHandle } from "./ResizeHandle";

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

export function DraggableElement({
  id,
  data,
  alignment,
  width,
  maxWidth,
  settings,
  isSelected,
  onSelect,
  onDelete,
  children,
}: {
  id: string;
  data: Record<string, unknown>;
  alignment: "flex-start" | "center" | "flex-end";
  width: string;
  maxWidth: string;
  settings: BaseElementSettings;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { activeBreakpoint, previewMode } = useBuilderStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data,
  });

  const marginTop = getResponsiveValue(settings.marginTop, activeBreakpoint, 0);
  const marginBottom = getResponsiveValue(
    settings.marginBottom,
    activeBreakpoint,
    0,
  );
  const marginLeft = getResponsiveValue(
    settings.marginLeft,
    activeBreakpoint,
    0,
  );
  const marginRight = getResponsiveValue(
    settings.marginRight,
    activeBreakpoint,
    0,
  );
  const paddingTop = getResponsiveValue(
    settings.paddingTop,
    activeBreakpoint,
    0,
  );
  const paddingBottom = getResponsiveValue(
    settings.paddingBottom,
    activeBreakpoint,
    0,
  );
  const paddingLeft = getResponsiveValue(
    settings.paddingLeft,
    activeBreakpoint,
    0,
  );
  const paddingRight = getResponsiveValue(
    settings.paddingRight,
    activeBreakpoint,
    0,
  );
  const isVisible =
    getResponsiveValue(settings.display, activeBreakpoint, "block") !== "none";
  const showChrome = !previewMode && (isHovered || isSelected);
  const previewId = `canvas-block-${id}`;

  return (
    <div
      ref={setNodeRef}
      data-pb-block="true"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        display: isVisible ? "flex" : "none",
        justifyContent: alignment,
        margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {settings.customCss ? (
        <style>{`#${previewId}{${settings.customCss}}`}</style>
      ) : null}

      <div
        id={previewId}
        style={{
          position: "relative",
          width,
          maxWidth,
          padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
          border:
            settings.borderWidth > 0
              ? `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`
              : "1px solid transparent",
          borderRadius: settings.borderRadius ?? 0,
          background: settings.backgroundColor || "transparent",
          boxShadow: isSelected
            ? "0 0 0 3px rgba(37, 99, 235, 0.12)"
            : showChrome
              ? "0 10px 22px rgba(15, 23, 42, 0.05)"
              : "none",
          opacity: settings.opacity ?? 1,
          transition:
            "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
        }}
      >
        {showChrome ? (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              {...attributes}
              {...listeners}
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                background: "rgba(255,255,255,0.96)",
                cursor: "grab",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
              }}
              aria-label="Drag block"
              title="Drag block"
            >
              <ResizeHandle active={isSelected} />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                background: "rgba(255,255,255,0.96)",
                cursor: "pointer",
                color: "#b91c1c",
                boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
              }}
              aria-label="Delete block"
              title="Delete block"
            >
              &#10005;
            </button>
          </div>
        ) : null}

        <div
          style={{
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
