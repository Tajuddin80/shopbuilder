import { Button, ButtonGroup } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { useBuilderStore } from "~/store/builderStore";

export function BuilderToolbar({ pageId }: { pageId?: string }) {
  const fetcher = useFetcher();
  const { activeBreakpoint, setBreakpoint, hasUnsavedChanges, pageContent, pageMeta } =
    useBuilderStore();

  const saving = fetcher.state !== "idle";

  function save() {
    if (!pageId) return;
    fetcher.submit(
      { content: JSON.stringify(pageContent), meta: JSON.stringify(pageMeta) } as any,
      { method: "post", action: `/api/pages/${pageId}/save`, encType: "application/json" } as any,
    );
  }

  return (
    <div style={{ borderBottom: "1px solid #e1e3e5" }}>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ButtonGroup>
          <Button pressed={activeBreakpoint === "desktop"} onClick={() => setBreakpoint("desktop")}>
            Desktop
          </Button>
          <Button pressed={activeBreakpoint === "tablet"} onClick={() => setBreakpoint("tablet")}>
            Tablet
          </Button>
          <Button pressed={activeBreakpoint === "mobile"} onClick={() => setBreakpoint("mobile")}>
            Mobile
          </Button>
        </ButtonGroup>

        <Button
          onClick={save}
          loading={saving}
          disabled={!pageId || saving || !hasUnsavedChanges}
          variant="primary"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

