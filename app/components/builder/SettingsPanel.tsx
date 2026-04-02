import {
  Button,
  Card,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";
import { AnimationSettings as AnimationSettingsControl } from "~/components/settings/AnimationSettings";
import { BackgroundSettings } from "~/components/settings/BackgroundSettings";
import { BorderSettings } from "~/components/settings/BorderSettings";
import { ColorPicker } from "~/components/settings/ColorPicker";
import { ImagePicker } from "~/components/settings/ImagePicker";
import { LayoutSettings } from "~/components/settings/LayoutSettings";
import { LinkPicker } from "~/components/settings/LinkPicker";
import { ResponsiveToggle } from "~/components/settings/ResponsiveToggle";
import { SpacingSettings } from "~/components/settings/SpacingSettings";
import { TypographySettings } from "~/components/settings/TypographySettings";
import { useBuilderStore } from "~/store/builderStore";

const SECTION_LAYOUT_OPTIONS = [
  { label: "Keep current layout", value: "custom" },
  { label: "1 column", value: "1" },
  { label: "2 columns - 50/50", value: "2-equal" },
  { label: "2 columns - 66/34", value: "2-left" },
  { label: "2 columns - 34/66", value: "2-right" },
  { label: "3 columns - 25/50/25", value: "3-feature" },
  { label: "3 columns - equal", value: "3-equal" },
  { label: "4 columns - equal", value: "4-equal" },
];

const BOOLEAN_SELECT_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

function toNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getLayoutValue(columnWidths: number[]) {
  if (columnWidths.length === 1 && columnWidths[0] === 100) return "1";
  if (
    columnWidths.length === 2 &&
    columnWidths[0] === 50 &&
    columnWidths[1] === 50
  )
    return "2-equal";
  if (
    columnWidths.length === 2 &&
    columnWidths[0] === 66 &&
    columnWidths[1] === 34
  )
    return "2-left";
  if (
    columnWidths.length === 2 &&
    columnWidths[0] === 34 &&
    columnWidths[1] === 66
  )
    return "2-right";
  if (
    columnWidths.length === 3 &&
    columnWidths.every((value) => value === 33.33)
  )
    return "3-equal";
  if (
    columnWidths.length === 3 &&
    columnWidths[0] === 25 &&
    columnWidths[1] === 50 &&
    columnWidths[2] === 25
  )
    return "3-feature";
  if (columnWidths.length === 4 && columnWidths.every((value) => value === 25))
    return "4-equal";
  return "custom";
}

function getLayoutWidths(value: string) {
  switch (value) {
    case "1":
      return [100];
    case "2-equal":
      return [50, 50];
    case "2-left":
      return [66, 34];
    case "2-right":
      return [34, 66];
    case "3-equal":
      return [33.33, 33.33, 33.33];
    case "3-feature":
      return [25, 50, 25];
    case "4-equal":
      return [25, 25, 25, 25];
    default:
      return null;
  }
}

function normalizeWidths(widths: number[]) {
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= 0) return widths;
  return widths.map((width) => Number(((width / total) * 100).toFixed(2)));
}

function equalWidths(count: number) {
  const width = Number((100 / count).toFixed(2));
  return Array.from({ length: count }, () => width);
}

function serializeLineItems(items: any[], keys: string[]) {
  return (items || [])
    .map((item) => keys.map((key) => String(item?.[key] || "")).join("|"))
    .join("\n");
}

function parseLineItems(value: string, keys: string[]) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|");
      const item: Record<string, unknown> = { id: String(index + 1) };
      keys.forEach((key, keyIndex) => {
        item[key] = parts[keyIndex]?.trim() || "";
      });
      return item;
    });
}

function serializeFormFields(fields: any[]) {
  return (fields || [])
    .map(
      (field) =>
        `${field?.type || "text"}|${field?.label || ""}|${field?.placeholder || ""}|${field?.required ? "true" : "false"}`,
    )
    .join("\n");
}

function parseFormFields(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [type, label, placeholder, required] = line.split("|");
      return {
        id: String(index + 1),
        type: type?.trim() || "text",
        label: label?.trim() || `Field ${index + 1}`,
        placeholder: placeholder?.trim() || "",
        required: required?.trim() === "true",
        options: [],
      };
    });
}

function getBreakpointValue<T>(
  value: T | { desktop?: T; tablet?: T; mobile?: T } | undefined,
  breakpoint: "desktop" | "tablet" | "mobile",
  fallback: T,
) {
  if (value && typeof value === "object" && breakpoint in value) {
    const responsive = value as {
      desktop?: T;
      tablet?: T;
      mobile?: T;
    };
    return (responsive[breakpoint] ?? responsive.desktop ?? fallback) as T;
  }

  return (value ?? fallback) as T;
}

function setBreakpointValue<T>(
  value: { desktop?: T; tablet?: T; mobile?: T } | undefined,
  breakpoint: "desktop" | "tablet" | "mobile",
  nextValue: T,
) {
  const desktop = value?.desktop ?? nextValue;
  const tablet = value?.tablet ?? desktop;
  const mobile = value?.mobile ?? tablet;

  return {
    desktop: breakpoint === "desktop" ? nextValue : desktop,
    tablet: breakpoint === "tablet" ? nextValue : tablet,
    mobile: breakpoint === "mobile" ? nextValue : mobile,
    [breakpoint]: nextValue,
  };
}

export function SettingsPanel() {
  const {
    settingsPanelOpen,
    pageContent,
    selectedElementId,
    selectedSectionId,
    updateElement,
    updateSection,
    updateSectionSettings,
    setSectionColumns,
    reverseSectionColumns,
    bumpLibraryRefreshNonce,
    activeBreakpoint,
    setBreakpoint,
  } = useBuilderStore();
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [themeEditorUrl, setThemeEditorUrl] = useState<string | null>(null);
  const [appBlockEditorUrl, setAppBlockEditorUrl] = useState<string | null>(
    null,
  );

  const selectedSection = pageContent.sections.find(
    (section) => section.id === selectedSectionId,
  );
  const selectedElement = selectedSection?.columns
    .flatMap((column) => column.elements)
    .find((element) => element.id === selectedElementId);
  const editingSectionOnly = !!selectedSection && !selectedElement;

  function openThemeEditor(url: string | null) {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_top");
  }

  async function saveSectionToTheme() {
    if (!selectedSection) return;

    try {
      setIsSavingSection(true);
      setSaveStatus(null);
      setThemeEditorUrl(null);
      setAppBlockEditorUrl(null);
      const response = await fetch("/api/section-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "save_builder_section",
          name: selectedSection.name,
          section: selectedSection,
          containerWidth: pageContent.globalStyles.maxWidth,
        }),
      });

      if (!response.ok) {
        setSaveStatus("Could not save the section into the theme.");
        return;
      }

      const payload = await response.json().catch(() => null);
      if (
        !payload ||
        typeof payload !== "object" ||
        payload?.error ||
        (!payload?.savedHandle && !payload?.savedName)
      ) {
        setSaveStatus(
          "The app could not confirm a Shopify save. Open the embedded app from Shopify and try again.",
        );
        return;
      }

      bumpLibraryRefreshNonce();
      const savedName =
        typeof payload?.savedName === "string" && payload.savedName.trim()
          ? payload.savedName.trim()
          : selectedSection.name;
      const savedHandle =
        typeof payload?.savedHandle === "string" && payload.savedHandle.trim()
          ? payload.savedHandle.trim()
          : "";
      const addedToHomepage = payload?.addedToHomepage === true;
      const nextThemeEditorUrl =
        typeof payload?.themeEditorUrl === "string" &&
        payload.themeEditorUrl.trim()
          ? payload.themeEditorUrl.trim()
          : null;
      const nextAppBlockEditorUrl =
        typeof payload?.appBlockEditorUrl === "string" &&
        payload.appBlockEditorUrl.trim()
          ? payload.appBlockEditorUrl.trim()
          : null;
      setThemeEditorUrl(nextThemeEditorUrl);
      setAppBlockEditorUrl(nextAppBlockEditorUrl);
      setSaveStatus(
        addedToHomepage
          ? `Saved as "${savedName}"${savedHandle ? ` (${savedHandle})` : ""} and added to the Home page template. The app-block route is also ready under Theme Customizer -> Add section -> Apps after the ShopBuilder theme extension is deployed.`
          : savedHandle
            ? `Saved as "${savedName}" (${savedHandle}). This save is available in the native theme sync now, and in Add section -> Apps after the ShopBuilder theme extension is deployed.`
            : `Saved as "${savedName}". This save is available in the native theme sync now, and in Add section -> Apps after the ShopBuilder theme extension is deployed.`,
      );
    } finally {
      setIsSavingSection(false);
    }
  }

  if (!settingsPanelOpen || (!selectedSection && !selectedElement)) {
    return (
      <div
        style={{
          width: 360,
          minWidth: 360,
          minHeight: 0,
          borderLeft: "1px solid #e5e7eb",
          height: "100%",
          overflow: "auto",
          background: "#f8fafc",
        }}
      >
        <div style={{ padding: 16 }}>
          <Card>
            <Text as="p" fontWeight="semibold">
              Settings
            </Text>
            <div
              style={{
                marginTop: 8,
                color: "#64748b",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Select a section or block to control layout, styling, custom
              Liquid, and theme sync.
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 360,
        minWidth: 360,
        minHeight: 0,
        borderLeft: "1px solid #e5e7eb",
        height: "100%",
        overflow: "auto",
        background: "#f8fafc",
      }}
    >
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
              Editing Breakpoint
            </Text>
            <ResponsiveToggle
              value={activeBreakpoint}
              onChange={setBreakpoint}
            />
          </div>
        </Card>

        {editingSectionOnly && selectedSection && (
          <>
            <Card>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" fontWeight="semibold">
                    Section
                  </Text>
                  <Button
                    size="slim"
                    loading={isSavingSection}
                    onClick={saveSectionToTheme}
                  >
                    Save To Theme
                  </Button>
                </InlineStack>

                <div
                  style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}
                >
                  Saving creates a native <code>sections/*.liquid</code> file in
                  your Shopify theme library and also attempts to place the
                  saved section into the homepage template so it appears inside
                  Theme Customizer immediately. This project now also includes a
                  theme app extension path for rendering saved sections under{" "}
                  <code>Add section -&gt; Apps</code> after deployment, and a
                  new blank ShopBuilder app block will auto-bind to the newest
                  save the first time it renders.
                </div>

                {saveStatus && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      style={{ fontSize: 13, color: "#0f766e", lineHeight: 1.5 }}
                    >
                      {saveStatus}
                    </div>

                    <InlineStack gap="200" wrap>
                      {themeEditorUrl && (
                        <Button
                          size="slim"
                          onClick={() => openThemeEditor(themeEditorUrl)}
                        >
                          Open Home Template
                        </Button>
                      )}
                      {appBlockEditorUrl && (
                        <Button
                          size="slim"
                          onClick={() => openThemeEditor(appBlockEditorUrl)}
                        >
                          Open Add Section Apps
                        </Button>
                      )}
                    </InlineStack>
                  </div>
                )}

                <TextField
                  label="Section name"
                  autoComplete="off"
                  value={selectedSection.name}
                  onChange={(value) =>
                    updateSection(selectedSection.id, { name: value })
                  }
                />
              </div>
            </Card>

            <Card>
              <LayoutSettings
                value={getLayoutValue(
                  selectedSection.columns.map((column) =>
                    Number(column.width.desktop),
                  ),
                )}
                options={SECTION_LAYOUT_OPTIONS}
                columnWidths={selectedSection.columns.map((column) =>
                  Number(column.width.desktop),
                )}
                onLayoutChange={(value) => {
                  const widths = getLayoutWidths(value);
                  if (!widths) return;
                  setSectionColumns(selectedSection.id, widths);
                }}
                onAddColumn={() =>
                  setSectionColumns(
                    selectedSection.id,
                    equalWidths(
                      Math.min(selectedSection.columns.length + 1, 4),
                    ),
                  )
                }
                onRemoveColumn={() =>
                  setSectionColumns(
                    selectedSection.id,
                    equalWidths(
                      Math.max(selectedSection.columns.length - 1, 1),
                    ),
                  )
                }
                onReverse={() => reverseSectionColumns(selectedSection.id)}
                onColumnWidthChange={(index, value) => {
                  const next = selectedSection.columns.map((item) =>
                    Number(item.width.desktop),
                  );
                  next[index] = toNumber(
                    value,
                    Number(selectedSection.columns[index]?.width.desktop || 25),
                  );
                  setSectionColumns(selectedSection.id, normalizeWidths(next));
                }}
              />
            </Card>

            <Card>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <Text as="p" fontWeight="semibold">
                  Section Styling
                </Text>
                <BackgroundSettings
                  color={getBreakpointValue(
                    selectedSection.settings.backgroundColor,
                    activeBreakpoint,
                    "#ffffff",
                  )}
                  imageUrl={selectedSection.settings.backgroundImage}
                  fullWidth={selectedSection.settings.fullWidth}
                  onColorChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      backgroundColor: setBreakpointValue(
                        selectedSection.settings.backgroundColor,
                        activeBreakpoint,
                        value,
                      ),
                    })
                  }
                  onImageUrlChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      backgroundImage: value || null,
                    })
                  }
                  onFullWidthChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      fullWidth: value,
                    })
                  }
                />
                <SpacingSettings
                  title="Padding"
                  top={getBreakpointValue(
                    selectedSection.settings.paddingTop,
                    activeBreakpoint,
                    40,
                  )}
                  bottom={getBreakpointValue(
                    selectedSection.settings.paddingBottom,
                    activeBreakpoint,
                    40,
                  )}
                  left={getBreakpointValue(
                    selectedSection.settings.paddingLeft,
                    activeBreakpoint,
                    20,
                  )}
                  right={getBreakpointValue(
                    selectedSection.settings.paddingRight,
                    activeBreakpoint,
                    20,
                  )}
                  onTopChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      paddingTop: setBreakpointValue(
                        selectedSection.settings.paddingTop,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.paddingTop,
                            activeBreakpoint,
                            40,
                          ),
                        ),
                      ),
                    })
                  }
                  onBottomChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      paddingBottom: setBreakpointValue(
                        selectedSection.settings.paddingBottom,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.paddingBottom,
                            activeBreakpoint,
                            40,
                          ),
                        ),
                      ),
                    })
                  }
                  onLeftChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      paddingLeft: setBreakpointValue(
                        selectedSection.settings.paddingLeft,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.paddingLeft,
                            activeBreakpoint,
                            20,
                          ),
                        ),
                      ),
                    })
                  }
                  onRightChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      paddingRight: setBreakpointValue(
                        selectedSection.settings.paddingRight,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.paddingRight,
                            activeBreakpoint,
                            20,
                          ),
                        ),
                      ),
                    })
                  }
                />
                <SpacingSettings
                  title="Margin"
                  top={getBreakpointValue(
                    selectedSection.settings.marginTop,
                    activeBreakpoint,
                    0,
                  )}
                  bottom={getBreakpointValue(
                    selectedSection.settings.marginBottom,
                    activeBreakpoint,
                    0,
                  )}
                  onTopChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      marginTop: setBreakpointValue(
                        selectedSection.settings.marginTop,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.marginTop,
                            activeBreakpoint,
                            0,
                          ),
                        ),
                      ),
                    })
                  }
                  onBottomChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      marginBottom: setBreakpointValue(
                        selectedSection.settings.marginBottom,
                        activeBreakpoint,
                        toNumber(
                          value,
                          getBreakpointValue(
                            selectedSection.settings.marginBottom,
                            activeBreakpoint,
                            0,
                          ),
                        ),
                      ),
                    })
                  }
                />
                <BorderSettings
                  radius={selectedSection.settings.borderRadius}
                  width={selectedSection.settings.borderWidth}
                  color={selectedSection.settings.borderColor}
                  style={selectedSection.settings.borderStyle}
                  onRadiusChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      borderRadius: toNumber(
                        value,
                        selectedSection.settings.borderRadius,
                      ),
                    })
                  }
                  onWidthChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      borderWidth: toNumber(
                        value,
                        selectedSection.settings.borderWidth,
                      ),
                    })
                  }
                  onColorChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      borderColor: value,
                    })
                  }
                  onStyleChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      borderStyle: value,
                    })
                  }
                />
                <AnimationSettingsControl
                  value={selectedSection.settings.animation}
                  onChange={(animation) =>
                    updateSectionSettings(selectedSection.id, {
                      animation: {
                        ...selectedSection.settings.animation,
                        ...animation,
                      },
                    })
                  }
                />
                <TextField
                  label="Custom class"
                  autoComplete="off"
                  value={selectedSection.settings.customClass}
                  onChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      customClass: value,
                    })
                  }
                />
                <TextField
                  label="Custom ID"
                  autoComplete="off"
                  value={selectedSection.settings.customId}
                  onChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      customId: value,
                    })
                  }
                />
                <TextField
                  label="Custom CSS"
                  autoComplete="off"
                  multiline={6}
                  value={selectedSection.settings.customCss}
                  onChange={(value) =>
                    updateSectionSettings(selectedSection.id, {
                      customCss: value,
                    })
                  }
                />
              </div>
            </Card>
          </>
        )}

        {selectedElement && (
          <>
            <Card>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <Text as="p" fontWeight="semibold">
                  Block
                </Text>
                <div
                  style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}
                >
                  Editing <strong>{selectedElement.type}</strong> inside{" "}
                  <strong>{selectedSection?.name}</strong>.
                </div>

                <TextField
                  label="Block name"
                  autoComplete="off"
                  value={selectedElement.name}
                  onChange={(value) =>
                    updateElement(selectedElement.id, { name: value })
                  }
                />

                {renderElementContentControls(
                  selectedElement as any,
                  updateElement,
                  activeBreakpoint,
                )}
              </div>
            </Card>

            <Card>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <Text as="p" fontWeight="semibold">
                  Block Styling
                </Text>
                <TextField
                  label="Width"
                  autoComplete="off"
                  value={getBreakpointValue(
                    selectedElement.settings.width,
                    activeBreakpoint,
                    "100%",
                  )}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        width: setBreakpointValue(
                          selectedElement.settings.width,
                          activeBreakpoint,
                          value,
                        ),
                      },
                    })
                  }
                />
                <TextField
                  label="Max width"
                  autoComplete="off"
                  value={getBreakpointValue(
                    selectedElement.settings.maxWidth,
                    activeBreakpoint,
                    "100%",
                  )}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        maxWidth: setBreakpointValue(
                          selectedElement.settings.maxWidth,
                          activeBreakpoint,
                          value,
                        ),
                      },
                    })
                  }
                />
                <Select
                  label="Text align"
                  options={[
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                  ]}
                  value={getBreakpointValue(
                    selectedElement.settings.textAlign,
                    activeBreakpoint,
                    "left",
                  )}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        textAlign: setBreakpointValue(
                          selectedElement.settings.textAlign,
                          activeBreakpoint,
                          value as "left" | "center" | "right",
                        ),
                        display: setBreakpointValue(
                          selectedElement.settings.display,
                          activeBreakpoint,
                          getBreakpointValue(
                            selectedElement.settings.display,
                            activeBreakpoint,
                            "block",
                          ),
                        ),
                      },
                    })
                  }
                />
                <Select
                  label="Visibility"
                  options={[
                    { label: "Show block", value: "block" },
                    { label: "Hide block", value: "none" },
                  ]}
                  value={getBreakpointValue(
                    selectedElement.settings.display,
                    activeBreakpoint,
                    "block",
                  )}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        display: setBreakpointValue(
                          selectedElement.settings.display,
                          activeBreakpoint,
                          value as "block" | "none",
                        ),
                      },
                    })
                  }
                />
                <ColorPicker
                  label="Background color"
                  value={selectedElement.settings.backgroundColor}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        backgroundColor: value,
                      },
                    })
                  }
                />
                <BorderSettings
                  radius={selectedElement.settings.borderRadius}
                  width={selectedElement.settings.borderWidth}
                  color={selectedElement.settings.borderColor}
                  style={selectedElement.settings.borderStyle}
                  onRadiusChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        borderRadius: toNumber(
                          value,
                          selectedElement.settings.borderRadius,
                        ),
                      },
                    })
                  }
                  onWidthChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        borderWidth: toNumber(
                          value,
                          selectedElement.settings.borderWidth,
                        ),
                      },
                    })
                  }
                  onColorChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        borderColor: value,
                      },
                    })
                  }
                  onStyleChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        borderStyle: value,
                      },
                    })
                  }
                />
                <SpacingSettings
                  title="Margin"
                  top={getBreakpointValue(
                    selectedElement.settings.marginTop,
                    activeBreakpoint,
                    0,
                  )}
                  bottom={getBreakpointValue(
                    selectedElement.settings.marginBottom,
                    activeBreakpoint,
                    15,
                  )}
                  left={getBreakpointValue(
                    selectedElement.settings.marginLeft,
                    activeBreakpoint,
                    0,
                  )}
                  right={getBreakpointValue(
                    selectedElement.settings.marginRight,
                    activeBreakpoint,
                    0,
                  )}
                  onTopChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        marginTop: setBreakpointValue(
                          selectedElement.settings.marginTop,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.marginTop,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onBottomChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        marginBottom: setBreakpointValue(
                          selectedElement.settings.marginBottom,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.marginBottom,
                              activeBreakpoint,
                              15,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onLeftChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        marginLeft: setBreakpointValue(
                          selectedElement.settings.marginLeft,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.marginLeft,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onRightChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        marginRight: setBreakpointValue(
                          selectedElement.settings.marginRight,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.marginRight,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                />
                <SpacingSettings
                  title="Padding"
                  top={getBreakpointValue(
                    selectedElement.settings.paddingTop,
                    activeBreakpoint,
                    0,
                  )}
                  bottom={getBreakpointValue(
                    selectedElement.settings.paddingBottom,
                    activeBreakpoint,
                    0,
                  )}
                  left={getBreakpointValue(
                    selectedElement.settings.paddingLeft,
                    activeBreakpoint,
                    0,
                  )}
                  right={getBreakpointValue(
                    selectedElement.settings.paddingRight,
                    activeBreakpoint,
                    0,
                  )}
                  onTopChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        paddingTop: setBreakpointValue(
                          selectedElement.settings.paddingTop,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.paddingTop,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onBottomChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        paddingBottom: setBreakpointValue(
                          selectedElement.settings.paddingBottom,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.paddingBottom,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onLeftChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        paddingLeft: setBreakpointValue(
                          selectedElement.settings.paddingLeft,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.paddingLeft,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                  onRightChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        paddingRight: setBreakpointValue(
                          selectedElement.settings.paddingRight,
                          activeBreakpoint,
                          toNumber(
                            value,
                            getBreakpointValue(
                              selectedElement.settings.paddingRight,
                              activeBreakpoint,
                              0,
                            ),
                          ),
                        ),
                      },
                    })
                  }
                />
                <TextField
                  label="Opacity"
                  type="number"
                  autoComplete="off"
                  value={String(selectedElement.settings.opacity ?? 1)}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        opacity: Math.max(
                          0,
                          Math.min(
                            1,
                            toNumber(
                              value,
                              Number(selectedElement.settings.opacity ?? 1),
                            ),
                          ),
                        ),
                      },
                    })
                  }
                />
                <AnimationSettingsControl
                  value={selectedElement.settings.animation}
                  onChange={(animation) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        animation: {
                          ...selectedElement.settings.animation,
                          ...animation,
                        },
                      },
                    })
                  }
                />
                <TextField
                  label="Custom class"
                  autoComplete="off"
                  value={selectedElement.settings.customClass}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        customClass: value,
                      },
                    })
                  }
                />
                <TextField
                  label="Custom ID"
                  autoComplete="off"
                  value={selectedElement.settings.customId}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        customId: value,
                      },
                    })
                  }
                />
                <TextField
                  label="Custom CSS"
                  autoComplete="off"
                  multiline={6}
                  value={selectedElement.settings.customCss}
                  onChange={(value) =>
                    updateElement(selectedElement.id, {
                      settings: {
                        ...selectedElement.settings,
                        customCss: value,
                      },
                    })
                  }
                />
              </div>
            </Card>

            {selectedElement.type === "liquid" && (
              <Card>
                <Text as="p" fontWeight="semibold">
                  Native Theme Section Shortcut
                </Text>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Once a native section exists in the theme, you can reference
                  it from a Liquid block using:
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

function renderElementContentControls(
  selectedElement: any,
  updateElement: (elementId: string, updates: Record<string, unknown>) => void,
  activeBreakpoint: "desktop" | "tablet" | "mobile",
) {
  function updateContent(content: Record<string, unknown>) {
    updateElement(selectedElement.id, { content });
  }

  switch (selectedElement.type) {
    case "heading":
      return (
        <>
          <TextField
            label="Heading text"
            autoComplete="off"
            value={selectedElement.content?.text || ""}
            onChange={(value) => updateContent({ text: value })}
          />
          <LinkPicker
            label="Heading"
            url={selectedElement.content?.linkUrl || ""}
            target={selectedElement.content?.linkTarget || "_self"}
            onUrlChange={(value) => updateContent({ linkUrl: value })}
            onTargetChange={(value) => updateContent({ linkTarget: value })}
          />
          <TypographySettings
            title="Heading Style"
            tag={selectedElement.content?.tag || "h2"}
            size={getBreakpointValue(
              selectedElement.content?.fontSize,
              activeBreakpoint,
              32,
            )}
            color={selectedElement.content?.color || "#111111"}
            align={getBreakpointValue(
              selectedElement.settings?.textAlign,
              activeBreakpoint,
              "left",
            )}
            onTagChange={(value) => updateContent({ tag: value })}
            onSizeChange={(value) =>
              updateContent({
                fontSize: setBreakpointValue(
                  selectedElement.content?.fontSize,
                  activeBreakpoint,
                  toNumber(
                    value,
                    getBreakpointValue(
                      selectedElement.content?.fontSize,
                      activeBreakpoint,
                      32,
                    ),
                  ),
                ),
              })
            }
            onColorChange={(value) => updateContent({ color: value })}
            onAlignChange={(value) =>
              updateElement(selectedElement.id, {
                settings: {
                  ...selectedElement.settings,
                  textAlign: setBreakpointValue(
                    selectedElement.settings.textAlign,
                    activeBreakpoint,
                    value as "left" | "center" | "right",
                  ),
                },
              })
            }
          />
          <TextField
            label="Font weight"
            autoComplete="off"
            value={String(selectedElement.content?.fontWeight || "700")}
            onChange={(value) => updateContent({ fontWeight: value })}
          />
          <TextField
            label="Line height"
            autoComplete="off"
            value={String(selectedElement.content?.lineHeight || 1.2)}
            onChange={(value) =>
              updateContent({
                lineHeight: toNumber(
                  value,
                  selectedElement.content?.lineHeight || 1.2,
                ),
              })
            }
          />
        </>
      );

    case "text":
      return (
        <>
          <TextField
            label="HTML content"
            autoComplete="off"
            multiline={8}
            value={selectedElement.content?.html || ""}
            onChange={(value) => updateContent({ html: value })}
          />
          <TypographySettings
            title="Text Style"
            size={getBreakpointValue(
              selectedElement.content?.fontSize,
              activeBreakpoint,
              16,
            )}
            color={selectedElement.content?.color || "#475569"}
            align={getBreakpointValue(
              selectedElement.settings?.textAlign,
              activeBreakpoint,
              "left",
            )}
            onSizeChange={(value) =>
              updateContent({
                fontSize: setBreakpointValue(
                  selectedElement.content?.fontSize,
                  activeBreakpoint,
                  toNumber(
                    value,
                    getBreakpointValue(
                      selectedElement.content?.fontSize,
                      activeBreakpoint,
                      16,
                    ),
                  ),
                ),
              })
            }
            onColorChange={(value) => updateContent({ color: value })}
            onAlignChange={(value) =>
              updateElement(selectedElement.id, {
                settings: {
                  ...selectedElement.settings,
                  textAlign: setBreakpointValue(
                    selectedElement.settings.textAlign,
                    activeBreakpoint,
                    value as "left" | "center" | "right",
                  ),
                },
              })
            }
          />
          <TextField
            label="Line height"
            autoComplete="off"
            value={String(selectedElement.content?.lineHeight || 1.6)}
            onChange={(value) =>
              updateContent({
                lineHeight: toNumber(
                  value,
                  selectedElement.content?.lineHeight || 1.6,
                ),
              })
            }
          />
        </>
      );

    case "button":
      return (
        <>
          <TextField
            label="Button text"
            autoComplete="off"
            value={selectedElement.content?.text || ""}
            onChange={(value) => updateContent({ text: value })}
          />
          <LinkPicker
            label="Button"
            url={selectedElement.content?.url || ""}
            target={selectedElement.content?.target || "_self"}
            onUrlChange={(value) => updateContent({ url: value })}
            onTargetChange={(value) => updateContent({ target: value })}
          />
          <Select
            label="Button style"
            options={[
              { label: "Filled", value: "filled" },
              { label: "Outline", value: "outline" },
            ]}
            value={selectedElement.content?.style || "filled"}
            onChange={(value) => updateContent({ style: value })}
          />
          <Select
            label="Button size"
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
            value={selectedElement.content?.size || "medium"}
            onChange={(value) => updateContent({ size: value })}
          />
          <TextField
            label="Font size"
            type="number"
            autoComplete="off"
            value={String(
              getBreakpointValue(
                selectedElement.content?.fontSize,
                activeBreakpoint,
                16,
              ),
            )}
            onChange={(value) =>
              updateContent({
                fontSize: setBreakpointValue(
                  selectedElement.content?.fontSize,
                  activeBreakpoint,
                  toNumber(
                    value,
                    getBreakpointValue(
                      selectedElement.content?.fontSize,
                      activeBreakpoint,
                      16,
                    ),
                  ),
                ),
              })
            }
          />
          <ColorPicker
            label="Button background"
            value={selectedElement.content?.backgroundColor || "#111111"}
            onChange={(value) => updateContent({ backgroundColor: value })}
          />
          <ColorPicker
            label="Button text color"
            value={selectedElement.content?.textColor || "#ffffff"}
            onChange={(value) => updateContent({ textColor: value })}
          />
          <ColorPicker
            label="Button border color"
            value={selectedElement.content?.borderColor || "#111111"}
            onChange={(value) => updateContent({ borderColor: value })}
          />
        </>
      );

    case "image":
      return (
        <>
          <ImagePicker
            label="Image URL"
            value={selectedElement.content?.src || ""}
            onChange={(value) => updateContent({ src: value })}
          />
          <TextField
            label="Alt text"
            autoComplete="off"
            value={selectedElement.content?.alt || ""}
            onChange={(value) => updateContent({ alt: value })}
          />
          <LinkPicker
            label="Image"
            url={selectedElement.content?.linkUrl || ""}
            target={selectedElement.content?.linkTarget || "_self"}
            onUrlChange={(value) => updateContent({ linkUrl: value })}
            onTargetChange={(value) => updateContent({ linkTarget: value })}
          />
          <Select
            label="Image fit"
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
            ]}
            value={selectedElement.content?.objectFit || "cover"}
            onChange={(value) => updateContent({ objectFit: value })}
          />
        </>
      );

    case "video":
      return (
        <>
          <TextField
            label="Video URL"
            autoComplete="off"
            value={selectedElement.content?.url || ""}
            onChange={(value) => updateContent({ url: value })}
          />
          <ImagePicker
            label="Poster image URL"
            value={selectedElement.content?.posterImage || ""}
            onChange={(value) => updateContent({ posterImage: value })}
          />
          <Select
            label="Aspect ratio"
            options={[
              { label: "16:9", value: "16:9" },
              { label: "4:3", value: "4:3" },
              { label: "1:1", value: "1:1" },
              { label: "21:9", value: "21:9" },
            ]}
            value={selectedElement.content?.aspectRatio || "16:9"}
            onChange={(value) => updateContent({ aspectRatio: value })}
          />
        </>
      );

    case "map":
      return (
        <>
          <TextField
            label="Map query"
            autoComplete="off"
            value={selectedElement.content?.query || ""}
            onChange={(value) => updateContent({ query: value })}
            helpText="Try a city, full address, or store location name."
          />
          <TextField
            label="Map height"
            type="number"
            autoComplete="off"
            value={String(
              getBreakpointValue(
                selectedElement.content?.height,
                activeBreakpoint,
                420,
              ),
            )}
            onChange={(value) =>
              updateContent({
                height: setBreakpointValue(
                  selectedElement.content?.height,
                  activeBreakpoint,
                  toNumber(
                    value,
                    getBreakpointValue(
                      selectedElement.content?.height,
                      activeBreakpoint,
                      420,
                    ),
                  ),
                ),
              })
            }
          />
        </>
      );

    case "icon":
      return (
        <>
          <Select
            label="Icon"
            options={[
              { label: "Star", value: "star" },
              { label: "Circle", value: "circle" },
              { label: "Heart", value: "heart" },
              { label: "Check", value: "check" },
            ]}
            value={selectedElement.content?.icon || "star"}
            onChange={(value) => updateContent({ icon: value })}
          />
          <TextField
            label="Icon size"
            type="number"
            autoComplete="off"
            value={String(
              getBreakpointValue(
                selectedElement.content?.size,
                activeBreakpoint,
                40,
              ),
            )}
            onChange={(value) =>
              updateContent({
                size: setBreakpointValue(
                  selectedElement.content?.size,
                  activeBreakpoint,
                  toNumber(
                    value,
                    getBreakpointValue(
                      selectedElement.content?.size,
                      activeBreakpoint,
                      40,
                    ),
                  ),
                ),
              })
            }
          />
          <ColorPicker
            label="Icon color"
            value={selectedElement.content?.color || "#111111"}
            onChange={(value) => updateContent({ color: value })}
          />
          <LinkPicker
            label="Icon"
            url={selectedElement.content?.linkUrl || ""}
            target={selectedElement.content?.linkTarget || "_self"}
            onUrlChange={(value) => updateContent({ linkUrl: value })}
            onTargetChange={(value) => updateContent({ linkTarget: value })}
          />
        </>
      );

    case "testimonial":
      return (
        <>
          <TextField
            label="Testimonials"
            autoComplete="off"
            multiline={6}
            helpText="One testimonial per line in this format: quote|author|role"
            value={serializeLineItems(selectedElement.content?.items || [], [
              "quote",
              "author",
              "role",
            ])}
            onChange={(value) =>
              updateContent({
                items: parseLineItems(value, ["quote", "author", "role"]),
              })
            }
          />
          <TextField
            label="Columns"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.columns?.desktop || 3)}
            onChange={(value) =>
              updateContent({
                columns: setBreakpointValue(
                  selectedElement.content?.columns,
                  activeBreakpoint,
                  Math.max(1, Math.min(4, toNumber(value, 3))),
                ),
              })
            }
          />
          <Select
            label="Show rating"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showRating === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showRating: value === "true" })
            }
          />
          <Select
            label="Show avatar"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showAvatar ? "true" : "false"}
            onChange={(value) =>
              updateContent({ showAvatar: value === "true" })
            }
          />
        </>
      );

    case "accordion":
      return (
        <TextField
          label="Accordion items"
          autoComplete="off"
          multiline={6}
          helpText="One item per line in this format: question|answer"
          value={serializeLineItems(selectedElement.content?.items || [], [
            "question",
            "answer",
          ])}
          onChange={(value) =>
            updateContent({
              items: parseLineItems(value, ["question", "answer"]),
            })
          }
        />
      );

    case "tabs":
      return (
        <TextField
          label="Tabs"
          autoComplete="off"
          multiline={6}
          helpText="One tab per line in this format: label|HTML content"
          value={serializeLineItems(selectedElement.content?.tabs || [], [
            "label",
            "content",
          ])}
          onChange={(value) =>
            updateContent({ tabs: parseLineItems(value, ["label", "content"]) })
          }
        />
      );

    case "countdown":
      return (
        <>
          <TextField
            label="Target date"
            autoComplete="off"
            value={selectedElement.content?.targetDate || ""}
            onChange={(value) => updateContent({ targetDate: value })}
          />
          <ColorPicker
            label="Number color"
            value={selectedElement.content?.numberColor || "#111111"}
            onChange={(value) => updateContent({ numberColor: value })}
          />
          <ColorPicker
            label="Label color"
            value={selectedElement.content?.labelColor || "#888888"}
            onChange={(value) => updateContent({ labelColor: value })}
          />
          <TextField
            label="Expired text"
            autoComplete="off"
            value={selectedElement.content?.expiredText || ""}
            onChange={(value) => updateContent({ expiredText: value })}
          />
        </>
      );

    case "form":
      return (
        <>
          <TextField
            label="Form fields"
            autoComplete="off"
            multiline={6}
            helpText="One field per line: type|label|placeholder|required"
            value={serializeFormFields(selectedElement.content?.fields || [])}
            onChange={(value) =>
              updateContent({ fields: parseFormFields(value) })
            }
          />
          <TextField
            label="Submit text"
            autoComplete="off"
            value={selectedElement.content?.submitText || ""}
            onChange={(value) => updateContent({ submitText: value })}
          />
          <TextField
            label="Success message"
            autoComplete="off"
            value={selectedElement.content?.successMessage || ""}
            onChange={(value) => updateContent({ successMessage: value })}
          />
          <TextField
            label="Email recipient"
            autoComplete="off"
            value={selectedElement.content?.emailRecipient || ""}
            onChange={(value) => updateContent({ emailRecipient: value })}
            helpText="Optional destination for leads or notifications."
          />
          <ColorPicker
            label="Input border color"
            value={selectedElement.content?.inputBorderColor || "#d1d5db"}
            onChange={(value) => updateContent({ inputBorderColor: value })}
          />
          <ColorPicker
            label="Button color"
            value={selectedElement.content?.buttonColor || "#111111"}
            onChange={(value) => updateContent({ buttonColor: value })}
          />
          <ColorPicker
            label="Button text color"
            value={selectedElement.content?.buttonTextColor || "#ffffff"}
            onChange={(value) => updateContent({ buttonTextColor: value })}
          />
        </>
      );

    case "slider":
      return (
        <>
          <TextField
            label="Slides"
            autoComplete="off"
            multiline={6}
            helpText="One slide per line: heading|text|imageUrl"
            value={serializeLineItems(selectedElement.content?.slides || [], [
              "heading",
              "text",
              "image",
            ])}
            onChange={(value) =>
              updateContent({
                slides: parseLineItems(value, ["heading", "text", "image"]),
              })
            }
          />
          <Select
            label="Autoplay"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.autoplay === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ autoplay: value === "true" })
            }
          />
          <Select
            label="Show dots"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showDots === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showDots: value === "true" })
            }
          />
          <TextField
            label="Autoplay speed (ms)"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.autoplaySpeed || 5000)}
            onChange={(value) =>
              updateContent({
                autoplaySpeed: Math.max(1200, toNumber(value, 5000)),
              })
            }
          />
          <TextField
            label="Slider height"
            type="number"
            autoComplete="off"
            value={String(
              getBreakpointValue(
                selectedElement.content?.height,
                activeBreakpoint,
                420,
              ),
            )}
            onChange={(value) =>
              updateContent({
                height: setBreakpointValue(
                  selectedElement.content?.height,
                  activeBreakpoint,
                  Math.max(
                    180,
                    toNumber(
                      value,
                      getBreakpointValue(
                        selectedElement.content?.height,
                        activeBreakpoint,
                        420,
                      ),
                    ),
                  ),
                ),
              })
            }
          />
        </>
      );

    case "social_icons":
      return (
        <>
          <TextField
            label="Social icons"
            autoComplete="off"
            multiline={6}
            helpText="One icon per line: platform|url"
            value={serializeLineItems(selectedElement.content?.icons || [], [
              "platform",
              "url",
            ])}
            onChange={(value) =>
              updateContent({
                icons: parseLineItems(value, ["platform", "url"]),
              })
            }
          />
          <TextField
            label="Icon size"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.iconSize || 24)}
            onChange={(value) =>
              updateContent({
                iconSize: toNumber(
                  value,
                  selectedElement.content?.iconSize || 24,
                ),
              })
            }
          />
          <TextField
            label="Gap"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.gap || 12)}
            onChange={(value) =>
              updateContent({
                gap: Math.max(0, toNumber(value, selectedElement.content?.gap || 12)),
              })
            }
          />
          <ColorPicker
            label="Icon color"
            value={selectedElement.content?.iconColor || "#111111"}
            onChange={(value) => updateContent({ iconColor: value })}
          />
          <Select
            label="Icon style"
            options={[
              { label: "Logo", value: "logo" },
              { label: "Filled", value: "filled" },
            ]}
            value={selectedElement.content?.iconStyle || "logo"}
            onChange={(value) => updateContent({ iconStyle: value })}
          />
          <Select
            label="Alignment"
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            value={selectedElement.content?.alignment || "center"}
            onChange={(value) => updateContent({ alignment: value })}
          />
        </>
      );

    case "product_card":
      return (
        <>
          <TextField
            label="Product handle"
            autoComplete="off"
            value={selectedElement.content?.productHandle || ""}
            onChange={(value) => updateContent({ productHandle: value })}
          />
          <Select
            label="Layout"
            options={[
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ]}
            value={selectedElement.content?.layout || "vertical"}
            onChange={(value) => updateContent({ layout: value })}
          />
          <Select
            label="Image ratio"
            options={[
              { label: "Square", value: "square" },
              { label: "Portrait", value: "portrait" },
              { label: "Landscape", value: "landscape" },
            ]}
            value={selectedElement.content?.imageRatio || "square"}
            onChange={(value) => updateContent({ imageRatio: value })}
          />
          <Select
            label="Show title"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showTitle === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showTitle: value === "true" })
            }
          />
          <Select
            label="Show vendor"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showVendor ? "true" : "false"}
            onChange={(value) =>
              updateContent({ showVendor: value === "true" })
            }
          />
          <Select
            label="Show price"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showPrice === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showPrice: value === "true" })
            }
          />
          <Select
            label="Show add to cart"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showAddToCart === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showAddToCart: value === "true" })
            }
          />
        </>
      );

    case "product_grid":
      return (
        <>
          <TextField
            label="Collection handle"
            autoComplete="off"
            value={
              selectedElement.content?.collectionHandle ||
              selectedElement.content?.collectionId ||
              ""
            }
            onChange={(value) =>
              updateContent({
                collectionHandle: value,
                collectionId: value,
              })
            }
          />
          <TextField
            label="Columns"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.columns?.desktop || 3)}
            onChange={(value) =>
              updateContent({
                columns: setBreakpointValue(
                  selectedElement.content?.columns,
                  activeBreakpoint,
                  Math.max(1, Math.min(4, toNumber(value, 3))),
                ),
              })
            }
          />
          <TextField
            label="Item limit"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.limit || 6)}
            onChange={(value) =>
              updateContent({ limit: Math.max(1, toNumber(value, 6)) })
            }
          />
          <Select
            label="Show pagination"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showPagination ? "true" : "false"}
            onChange={(value) =>
              updateContent({ showPagination: value === "true" })
            }
          />
          <Select
            label="Sort order"
            options={[
              { label: "Best selling", value: "best-selling" },
              { label: "Newest", value: "created-descending" },
              { label: "Price low to high", value: "price-ascending" },
              { label: "Price high to low", value: "price-descending" },
            ]}
            value={selectedElement.content?.sortBy || "best-selling"}
            onChange={(value) => updateContent({ sortBy: value })}
          />
        </>
      );

    case "collection":
      return (
        <>
          <TextField
            label="Collection handle"
            autoComplete="off"
            value={
              selectedElement.content?.collectionHandle ||
              selectedElement.content?.collectionId ||
              ""
            }
            onChange={(value) =>
              updateContent({
                collectionHandle: value,
                collectionId: value,
              })
            }
          />
          <TextField
            label="Columns"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.columns?.desktop || 3)}
            onChange={(value) =>
              updateContent({
                columns: setBreakpointValue(
                  selectedElement.content?.columns,
                  activeBreakpoint,
                  Math.max(1, Math.min(4, toNumber(value, 3))),
                ),
              })
            }
          />
          <TextField
            label="Collection limit"
            type="number"
            autoComplete="off"
            value={String(selectedElement.content?.limit || 6)}
            onChange={(value) =>
              updateContent({ limit: Math.max(1, toNumber(value, 6)) })
            }
          />
          <Select
            label="Show title"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showTitle === false ? "false" : "true"}
            onChange={(value) =>
              updateContent({ showTitle: value === "true" })
            }
          />
          <Select
            label="Show product count"
            options={BOOLEAN_SELECT_OPTIONS}
            value={selectedElement.content?.showProductCount ? "true" : "false"}
            onChange={(value) =>
              updateContent({ showProductCount: value === "true" })
            }
          />
          <Select
            label="Image ratio"
            options={[
              { label: "Square", value: "square" },
              { label: "Portrait", value: "portrait" },
              { label: "Landscape", value: "landscape" },
            ]}
            value={selectedElement.content?.imageRatio || "square"}
            onChange={(value) => updateContent({ imageRatio: value })}
          />
        </>
      );

    case "html":
      return (
        <TextField
          label="Custom HTML"
          autoComplete="off"
          multiline={8}
          value={selectedElement.content?.html || ""}
          onChange={(value) => updateContent({ html: value })}
          helpText="HTML is rendered live in the canvas, so inline styles will show here."
        />
      );

    case "liquid":
      return (
        <TextField
          label="Liquid code"
          autoComplete="off"
          multiline={8}
          value={selectedElement.content?.liquid || ""}
          onChange={(value) => updateContent({ liquid: value })}
          helpText="Paste raw Liquid or a section include tag here."
        />
      );

    default:
      return (
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
          This block type still saves and publishes, and you can style it with
          the generic fields below.
        </div>
      );
  }
}
