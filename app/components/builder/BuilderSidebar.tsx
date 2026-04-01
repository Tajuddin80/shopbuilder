import { Button, Card, Tabs, Text } from "@shopify/polaris";
import { ELEMENT_CATEGORIES, ELEMENT_REGISTRY } from "~/lib/elementRegistry";
import { useBuilderStore } from "~/store/builderStore";

export function BuilderSidebar() {
  const { sidebarTab, setSidebarTab, addSection } = useBuilderStore();

  const tabs = [
    { id: "elements", content: "Elements", panelID: "elements-panel" },
    { id: "layers", content: "Layers", panelID: "layers-panel" },
    { id: "navigator", content: "Navigator", panelID: "navigator-panel" },
  ] as const;

  const selected = tabs.findIndex((t) => t.id === sidebarTab);

  return (
    <div style={{ width: 320, borderRight: "1px solid #e1e3e5", height: "100%", overflow: "auto" }}>
      <div style={{ padding: 12 }}>
        <Tabs
          tabs={tabs as any}
          selected={Math.max(0, selected)}
          onSelect={(idx) => setSidebarTab(tabs[idx].id)}
        />
      </div>

      {sidebarTab === "elements" && (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Text as="p" fontWeight="semibold">
              Sections
            </Text>
            <div style={{ marginTop: 10 }}>
              <Button onClick={() => addSection({ name: "Section" })} fullWidth>
                Add section
              </Button>
            </div>
          </Card>

          {ELEMENT_CATEGORIES.map((cat) => (
            <Card key={cat.key}>
              <Text as="p" fontWeight="semibold">
                {cat.label}
              </Text>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ELEMENT_REGISTRY.filter((e) => e.category === cat.key).map((el) => (
                  <div
                    key={el.type}
                    style={{
                      border: "1px solid #e1e3e5",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 13,
                      color: "#202223",
                      background: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{el.label}</div>
                    <div style={{ color: "#6d7175", marginTop: 2 }}>{el.icon}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {sidebarTab !== "elements" && (
        <div style={{ padding: 16, color: "#6d7175", fontSize: 13 }}>
          Coming soon.
        </div>
      )}
    </div>
  );
}

