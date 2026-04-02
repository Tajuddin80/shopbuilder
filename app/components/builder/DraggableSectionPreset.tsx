import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge, Button, Text } from "@shopify/polaris";
import type { SectionPreset } from "~/lib/sectionPresets";

export function DraggableSectionPreset({
  preset,
  onAdd,
}: {
  preset: SectionPreset;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `section-preset-${preset.id}`,
      data: {
        type: "section-preset",
        presetId: preset.id,
        label: preset.name,
      },
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          border: "1px solid #dbe2ea",
          borderRadius: 18,
          padding: 12,
          background: "#ffffff",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            borderRadius: 14,
            padding: 14,
            minHeight: 124,
            color: "#ffffff",
            background: preset.preview.background,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Badge tone="info">{preset.preview.eyebrow}</Badge>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.15 }}>
              {preset.preview.headline}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.4,
              }}
            >
              {preset.preview.supportingText}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div>
            <Text as="p" fontWeight="semibold">
              {preset.name}
            </Text>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#5c6a79",
                lineHeight: 1.45,
              }}
            >
              {preset.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Drag into canvas or add instantly
            </div>
            <Button size="slim" onClick={onAdd}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
