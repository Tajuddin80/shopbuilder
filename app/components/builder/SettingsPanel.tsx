import { Card, Text } from "@shopify/polaris";
import { useBuilderStore } from "~/store/builderStore";

export function SettingsPanel() {
  const { settingsPanelOpen, selectedElementId, selectedSectionId } = useBuilderStore();

  if (!settingsPanelOpen) {
    return (
      <div style={{ width: 320, borderLeft: "1px solid #e1e3e5", height: "100%", overflow: "auto" }}>
        <div style={{ padding: 16, color: "#6d7175", fontSize: 13 }}>Select an element to edit settings.</div>
      </div>
    );
  }

  return (
    <div style={{ width: 320, borderLeft: "1px solid #e1e3e5", height: "100%", overflow: "auto" }}>
      <div style={{ padding: 12 }}>
        <Card>
          <Text as="p" fontWeight="semibold">
            Settings
          </Text>
          <div style={{ marginTop: 8, color: "#6d7175", fontSize: 13 }}>
            Element: {selectedElementId || "—"}
            <br />
            Section: {selectedSectionId || "—"}
          </div>
        </Card>
      </div>
    </div>
  );
}

