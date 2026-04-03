import { Button, InlineStack, Text } from "@shopify/polaris";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { appBridgeFetch } from "~/lib/appBridgeFetch";
import { useBuilderStore } from "~/store/builderStore";
import { BreakpointToggle } from "./BreakpointToggle";

export function BuilderToolbar({ pageId }: { pageId?: string }) {
  const [saving, setSaving] = useState(false);
  const shopify = useAppBridge();
  const {
    hasUnsavedChanges,
    pageContent,
    pageMeta,
    setHasUnsavedChanges,
    previewMode,
    setPreviewMode,
    bumpLibraryRefreshNonce,
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

      const pageResponse = await appBridgeFetch(
        shopify,
        `/api/pages/${pageId}/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pagePayload),
        },
      );

      if (!pageResponse.ok) {
        shopify.toast.show("Could not save this builder draft.", {
          isError: true,
        });
        return;
      }

      setHasUnsavedChanges(false);

      const sectionSyncResponse = await appBridgeFetch(
        shopify,
        "/api/section-library",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "save_page_sections",
            sections: pageContent.sections,
            containerWidth: pageContent.globalStyles.maxWidth,
          }),
        },
      );

      if (!sectionSyncResponse.ok) {
        const payload = await sectionSyncResponse.json().catch(() => null);
        shopify.toast.show(
          payload?.error ||
            "Draft saved, but Shopify could not sync the reusable sections yet.",
          {
            isError: true,
          },
        );
        return;
      }

      bumpLibraryRefreshNonce();
      shopify.toast.show(
        pageContent.sections.length === 0
          ? "Draft saved."
          : pageContent.sections.length === 1
          ? "Section saved and synced to the library."
          : "Draft saved and sections synced to the library.",
      );
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
              Save stores this draft and refreshes the ShopBuilder sections you can add by name in Theme Editor.
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
