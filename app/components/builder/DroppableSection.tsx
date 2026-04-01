import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section } from "~/lib/pageSchema";
import { useBuilderStore } from "~/store/builderStore";

export function DroppableSection({ section }: { section: Section }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { type: "section", sectionId: section.id },
  });
  const { deleteSection, selectElement, selectedElementId } = useBuilderStore();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    border: "1px solid #e1e3e5",
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "#fafbfb",
          borderBottom: "1px solid #e1e3e5",
        }}
      >
        <button
          type="button"
          {...listeners}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "grab",
            fontWeight: 600,
            color: "#202223",
          }}
          onClick={() => selectElement(null, section.id)}
        >
          {section.name}
        </button>
        <button
          type="button"
          onClick={() => deleteSection(section.id)}
          style={{
            background: "transparent",
            border: "1px solid #dfe3e8",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {section.columns.map((col) => (
            <div
              key={col.id}
              style={{
                flex: `0 0 ${col.width.desktop}%`,
                minWidth: 240,
                border: "1px dashed #dfe3e8",
                borderRadius: 8,
                padding: 12,
              }}
            >
              {col.elements.length === 0 ? (
                <div style={{ color: "#6d7175", fontSize: 13 }}>Drop elements here</div>
              ) : (
                col.elements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => selectElement(el.id, section.id)}
                    style={{
                      padding: 10,
                      border:
                        selectedElementId === el.id
                          ? "1px solid #2c6ecb"
                          : "1px solid #e1e3e5",
                      borderRadius: 8,
                      marginBottom: 8,
                      cursor: "pointer",
                      background: selectedElementId === el.id ? "#f4f9ff" : "#fff",
                    }}
                  >
                    {(el as any).name || (el as any).type}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

