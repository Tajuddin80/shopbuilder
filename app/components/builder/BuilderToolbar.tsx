import { Button, InlineStack, Text } from "@shopify/polaris";
import { useState } from "react";
import { useBuilderStore } from "~/store/builderStore";
import { BreakpointToggle } from "./BreakpointToggle";

export function BuilderToolbar({ pageId }: { pageId?: string }) {
  const [saving, setSaving] = useState(false);
  const {
    hasUnsavedChanges,
    pageContent,
    pageMeta,
    setHasUnsavedChanges,
    bumpLibraryRefreshNonce,
    previewMode,
    setPreviewMode,
  } = useBuilderStore();

  async function save() {
    if (!pageId || saving) return;

    setSaving(true);

    try {
      const pagePayload: Record<string, unknown> = { content: pageContent };

      if (
        pageMeta.title ||
        pageMeta.handle ||
        pageMeta.seoTitle ||
        pageMeta.seoDescription
      ) {
        pagePayload.meta = pageMeta;
      }

      const pageResponse = await fetch(`/api/pages/${pageId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagePayload),
      });

      if (!pageResponse.ok) return;

      const sectionResponse = await fetch("/api/section-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "save_page_sections",
          sections: pageContent.sections,
          containerWidth: pageContent.globalStyles.maxWidth,
        }),
      });

      if (!sectionResponse.ok) return;

      setHasUnsavedChanges(false);
      bumpLibraryRefreshNonce();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ borderBottom: "1px solid #e1e3e5" }}>
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <InlineStack gap="400" align="start" blockAlign="center">
          <div>
            <Text as="p" fontWeight="semibold">
              Section Builder
            </Text>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Build reusable sections first, then grow into full pages.
            </div>
          </div>
          <BreakpointToggle />
        </InlineStack>

        <InlineStack gap="200">
          <Button
            pressed={previewMode}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit View" : "Preview View"}
          </Button>
          <Button
            onClick={save}
            loading={saving}
            disabled={!pageId || saving || !hasUnsavedChanges}
            variant="primary"
          >
            Save
          </Button>
        </InlineStack>
      </div>
    </div>
  );
}
