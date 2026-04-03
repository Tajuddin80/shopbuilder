import { Button, Card, InlineStack, Tabs, Text, TextField } from "@shopify/polaris";
import { useEffect, useMemo, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { appBridgeFetch } from "~/lib/appBridgeFetch";
import { ELEMENT_REGISTRY } from "~/lib/elementRegistry";
import {
  cloneSavedSection,
  createThemeSectionReferenceSection,
  type SavedSectionLibraryItem,
  type ThemeSectionLibraryItem,
} from "~/lib/sectionLibrary";
import { createSectionFromPreset, SECTION_PRESETS } from "~/lib/sectionPresets";
import { useBuilderStore } from "~/store/builderStore";
import { DraggableSectionPreset } from "./DraggableSectionPreset";
import { ElementPicker } from "./ElementPicker";
import { LayerPanel } from "./LayerPanel";

export function BuilderSidebar() {
  const shopify = useAppBridge();
  const {
    sidebarTab,
    setSidebarTab,
    addSection,
    addElement,
    pageContent,
    selectedSectionId,
    libraryRefreshNonce,
  } = useBuilderStore();
  const [savedSections, setSavedSections] = useState<SavedSectionLibraryItem[]>(
    [],
  );
  const [themeSections, setThemeSections] = useState<ThemeSectionLibraryItem[]>(
    [],
  );
  const [nativeThemeSyncEnabled, setNativeThemeSyncEnabled] = useState(false);
  const [presetQuery, setPresetQuery] = useState("");
  const [isSyncingThemeSections, setIsSyncingThemeSections] = useState(false);

  const tabs = [
    { id: "elements", content: "Library", panelID: "elements-panel" },
    { id: "layers", content: "Layout", panelID: "layers-panel" },
    { id: "navigator", content: "Theme", panelID: "navigator-panel" },
  ] as const;

  const selected = tabs.findIndex((tab) => tab.id === sidebarTab);
  const normalizedPresetQuery = presetQuery.trim().toLowerCase();
  const filteredPresets = useMemo(() => {
    if (!normalizedPresetQuery) return SECTION_PRESETS;

    return SECTION_PRESETS.filter((preset) =>
      `${preset.name} ${preset.description} ${(preset.keywords || []).join(" ")}`
        .toLowerCase()
        .includes(normalizedPresetQuery),
    );
  }, [normalizedPresetQuery]);

  useEffect(() => {
    let active = true;

    async function loadLibrary() {
      const response = await appBridgeFetch(shopify, "/api/section-library");
      if (!response.ok || !active) return;
      const payload = await response.json();
      if (!active) return;
      setSavedSections(payload.savedSections || []);
      setThemeSections(payload.themeSections || []);
      setNativeThemeSyncEnabled(payload.nativeThemeSyncEnabled === true);
    }

    loadLibrary().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [libraryRefreshNonce, shopify]);

  async function syncThemeSections() {
    try {
      setIsSyncingThemeSections(true);
      const response = await appBridgeFetch(shopify, "/api/section-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "sync_local_theme_sections" }),
      });
      if (!response.ok) return;
      const payload = await response.json();
      setSavedSections(payload.savedSections || []);
      setThemeSections(payload.themeSections || []);
      setNativeThemeSyncEnabled(payload.nativeThemeSyncEnabled === true);
    } finally {
      setIsSyncingThemeSections(false);
    }
  }

  function handleAddPreset(presetId: string) {
    const section = createSectionFromPreset(presetId);
    if (!section) return;
    addSection(section);
  }

  function handleAddSavedSection(item: SavedSectionLibraryItem) {
    addSection(cloneSavedSection(item.section));
  }

  function handleAddThemeReference(item: ThemeSectionLibraryItem) {
    if (!nativeThemeSyncEnabled) {
      shopify.toast.show(
        "Local Liquid sections are preview-only on this store. Use saved ShopBuilder sections for storefront content.",
        { isError: true },
      );
      return;
    }

    addSection(
      createThemeSectionReferenceSection({
        handle: item.handle,
        name: item.name,
      }),
    );
  }

  function handleAddElement(entry: (typeof ELEMENT_REGISTRY)[number]) {
    let targetSection =
      pageContent.sections.find(
        (section) => section.id === selectedSectionId,
      ) ?? pageContent.sections[0];

    if (!targetSection) {
      addSection({ name: "Section" });
      targetSection = useBuilderStore.getState().pageContent.sections[0];
    }

    if (!targetSection?.columns[0]) return;

    addElement(targetSection.id, targetSection.columns[0].id, {
      type: entry.type,
      name: entry.label,
      content: entry.defaultContent as any,
    });
  }

  return (
    <div
      style={{
        width: 360,
        minWidth: 360,
        minHeight: 0,
        borderRight: "1px solid #e5e7eb",
        height: "100%",
        overflow: "auto",
        background: "#f8fafc",
      }}
    >
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Builder Library
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Sections, blocks, and theme Liquid
          </div>
        </div>

        <Tabs
          tabs={tabs as any}
          selected={Math.max(0, selected)}
          onSelect={(index) => setSidebarTab(tabs[index].id)}
        />
      </div>

      {sidebarTab === "elements" && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <Text as="p" fontWeight="semibold">
                  Prebuilt Sections
                </Text>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "#5c6a79",
                    lineHeight: 1.5,
                  }}
                >
                  Drag a preset into the canvas or click Add to append it.
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <TextField
                  label="Search prebuilt sections"
                  labelHidden
                  autoComplete="off"
                  placeholder="Search prebuilt sections"
                  value={presetQuery}
                  onChange={setPresetQuery}
                />

                {filteredPresets.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    No prebuilt sections match that search yet.
                  </div>
                ) : filteredPresets.map((preset) => (
                  <DraggableSectionPreset
                    key={preset.id}
                    preset={preset}
                    onAdd={() => handleAddPreset(preset.id)}
                  />
                ))}
              </div>

              <Button
                onClick={() => addSection({ name: "Blank Section" })}
                fullWidth
              >
                Add blank section
              </Button>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" fontWeight="semibold">
                  Saved Builder Sections
                </Text>
                <Text as="span" tone="subdued">
                  {savedSections.length}
                </Text>
              </InlineStack>
              <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.5 }}>
                Click <strong>Save</strong> in the builder toolbar to refresh
                this list. Each saved section can be reused here and added from
                Theme Editor under <strong>Apps</strong>.
              </div>

              {savedSections.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  No saved builder sections yet.
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {savedSections.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddSavedSection(item)}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 12,
                        background: "#ffffff",
                        textAlign: "left",
                        padding: 12,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.name}
                      </div>
                      <div
                        style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}
                      >
                        Reusable builder section
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" fontWeight="semibold">
                  Local Liquid Sections
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span" tone="subdued">
                    {themeSections.length}
                  </Text>
                  <Button
                    size="micro"
                    onClick={syncThemeSections}
                    loading={isSyncingThemeSections}
                  >
                    Refresh
                  </Button>
                </InlineStack>
              </InlineStack>
              <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.5 }}>
                Files from <code>theme-sections/</code> also show up here as
                developer Liquid section examples. Adding one drops an editable
                Liquid reference section into the canvas. The
                <strong> Refresh</strong> button only reloads newly added local
                files while this app is open.
              </div>
              {!nativeThemeSyncEnabled ? (
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  Theme-file access is currently off for this store, so these
                  items stay preview-only.
                </div>
              ) : null}

              {themeSections.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  No local theme sections found yet.
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {themeSections.map((item) => (
                    <button
                      key={item.handle}
                      type="button"
                      onClick={() => handleAddThemeReference(item)}
                      disabled={!nativeThemeSyncEnabled}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 12,
                        background: "#ffffff",
                        textAlign: "left",
                        padding: 12,
                        cursor: nativeThemeSyncEnabled ? "pointer" : "not-allowed",
                        opacity: nativeThemeSyncEnabled ? 1 : 0.65,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.name}
                      </div>
                      <div
                        style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}
                      >
                        {nativeThemeSyncEnabled
                          ? `sections/${item.fileName}`
                          : `Preview only: ${item.fileName}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Text as="p" fontWeight="semibold">
                Add Blocks
              </Text>
              <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.5 }}>
                Add blocks into the selected section, then drag them left,
                right, up, and down across columns in the canvas.
              </div>
            </div>
          </Card>

          <ElementPicker onSelect={handleAddElement} />
        </div>
      )}

      {sidebarTab === "layers" && (
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <LayerPanel />
        </div>
      )}

      {sidebarTab === "navigator" && (
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Text as="p" fontWeight="semibold">
                Local Theme Sections
              </Text>
              <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.6 }}>
                Put your own <code>.liquid</code> section files in{" "}
                <code>theme-sections/</code>. These are available in ShopBuilder
                as local Liquid references and previews. If Shopify grants this
                app protected theme-file access later, the same files can also
                be pushed into the live theme. For now, use saved ShopBuilder
                sections for the normal store-facing flow.
              </div>

              {themeSections.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  No local theme sections found yet.
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {themeSections.map((item) => (
                    <button
                      key={item.handle}
                      type="button"
                      onClick={() => handleAddThemeReference(item)}
                      disabled={!nativeThemeSyncEnabled}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 12,
                        background: "#ffffff",
                        textAlign: "left",
                        padding: 12,
                        cursor: nativeThemeSyncEnabled ? "pointer" : "not-allowed",
                        opacity: nativeThemeSyncEnabled ? 1 : 0.65,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.name}
                      </div>
                      <div
                        style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}
                      >
                        {nativeThemeSyncEnabled
                          ? `sections/${item.fileName}`
                          : `Preview only: ${item.fileName}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <Text as="p" fontWeight="semibold">
              Liquid Shortcut
            </Text>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#5c6a79",
                lineHeight: 1.6,
              }}
            >
              If you want to reference one manually inside a custom Liquid
              block, use:
            </div>
            <pre
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {"{% section 'your-section-handle' %}"}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
