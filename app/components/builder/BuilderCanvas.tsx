import { useDroppable } from "@dnd-kit/core";
import {
  PREVIEW_ANIMATION_STYLES,
} from "~/lib/animationPreview";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore } from "~/store/builderStore";
import { DroppableSection } from "./DroppableSection";
import { PreviewIframe } from "./PreviewIframe";

export function BuilderCanvas() {
  const { pageContent, activeBreakpoint, previewMode } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({
    id: "builder-canvas-dropzone",
    data: { type: "canvas-root" },
  });

  const viewportWidth = { desktop: "100%", tablet: "768px", mobile: "375px" }[
    activeBreakpoint
  ];

  return (
    <div
      className="pb-canvas-wrapper"
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "auto",
        background:
          "radial-gradient(circle at top, rgba(226, 232, 240, 0.9), rgba(241, 245, 249, 0.92) 42%, rgba(226, 232, 240, 0.65) 100%)",
        display: "flex",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: viewportWidth,
          minHeight: "100vh",
          transition: "width 0.3s ease",
        }}
      >
        <PreviewIframe breakpoint={activeBreakpoint}>
          <style>{PREVIEW_ANIMATION_STYLES}</style>
          <div
            ref={setNodeRef}
            className="pb-canvas"
            style={{
              minHeight: "100vh",
              background: isOver ? "#f8fbff" : "#ffffff",
              transition: "background 0.2s ease, box-shadow 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!previewMode && (
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  borderBottom: "1px solid #eef2f7",
                  background: "rgba(255,255,255,0.94)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Canvas
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Drag section presets here
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {pageContent.sections.length} section
                  {pageContent.sections.length === 1 ? "" : "s"}
                </div>
              </div>
            )}

            <SortableContext
              items={pageContent.sections.map((section) => section.id)}
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
                  height: 420,
                  color: "#64748b",
                  gap: 12,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}
                >
                  Start with a preset section
                </div>
                <div style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.6 }}>
                  Drag a section from the left library into this canvas, or
                  click Add on any preset to build the page faster.
                </div>
              </div>
            )}
          </div>
        </PreviewIframe>

        {previewMode && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Preview mode hides some editor chrome so you can focus on the
            section composition.
          </div>
        )}
      </div>
    </div>
  );
}
