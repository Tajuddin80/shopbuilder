import { Card, Text } from "@shopify/polaris";
import { useBuilderStore } from "~/store/builderStore";

export function LayerPanel() {
  const { pageContent, selectedElementId, selectedSectionId, selectElement } =
    useBuilderStore();

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text as="p" fontWeight="semibold">
          Layers
        </Text>
        <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.6 }}>
          Jump between sections and blocks quickly while building layouts.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pageContent.sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              style={{
                border: "1px solid #dbe2ea",
                borderRadius: 12,
                background: "#ffffff",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => selectElement(null, section.id)}
                style={{
                  width: "100%",
                  border: 0,
                  background:
                    selectedSectionId === section.id && !selectedElementId
                      ? "#eff6ff"
                      : "#f8fafc",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                  {sectionIndex + 1}. {section.name}
                </div>
                <div style={{ marginTop: 2, fontSize: 12, color: "#64748b" }}>
                  {section.columns.length} columns
                </div>
              </button>

              <div
                style={{
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {section.columns.map((column, columnIndex) => (
                  <div key={column.id}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        marginBottom: 6,
                      }}
                    >
                      Column {columnIndex + 1}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {column.elements.map((element) => (
                        <button
                          key={element.id}
                          type="button"
                          onClick={() => selectElement(element.id, section.id)}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            background:
                              selectedElementId === element.id
                                ? "#eff6ff"
                                : "#ffffff",
                            padding: "8px 10px",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {element.name || element.type}
                          </div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            {element.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
