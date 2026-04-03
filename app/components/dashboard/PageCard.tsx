import { Badge, Button, Card, InlineStack, Text } from "@shopify/polaris";

export function PageCard({ page, onEdit }: { page: any; onEdit: () => void }) {
  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InlineStack align="space-between" blockAlign="start">
          <div>
            <Text as="p" fontWeight="semibold">
              {page.title}
            </Text>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
              /{page.handle}
            </div>
          </div>
          <Badge tone={page.status === "PUBLISHED" ? "success" : "attention"}>
            {page.status}
          </Badge>
        </InlineStack>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge>Workspace</Badge>
          <Badge tone="info">{`Updated ${new Date(page.updatedAt).toLocaleDateString()}`}</Badge>
        </div>

        <div style={{ fontSize: 13, color: "#5c6a79", lineHeight: 1.6 }}>
          Open this section workspace to refine the layout, save it into the
          theme, and reuse it anywhere later.
        </div>

        <InlineStack align="space-between" blockAlign="center">
          <div style={{ fontSize: 12, color: "#64748b" }}>
            ID: {String(page.id).slice(0, 8)}
          </div>
          <Button size="slim" onClick={onEdit}>
            Open Builder
          </Button>
        </InlineStack>
      </div>
    </Card>
  );
}
