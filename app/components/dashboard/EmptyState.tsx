import { Button, Card, InlineStack, Text } from "@shopify/polaris";

export function EmptyState({
  onCreate,
  onBrowseTemplates,
}: {
  onCreate: () => void;
  onBrowseTemplates: () => void;
}) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 4,
        }}
      >
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%)",
            border: "1px solid #dbeafe",
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Start Here
          </div>
          <Text as="h2" variant="headingLg">
            Build your first reusable section
          </Text>
          <div
            style={{
              marginTop: 10,
              maxWidth: 620,
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.7,
            }}
          >
            Start with a section preset, customize the layout, save it to the
            theme, and reuse it later. That gives you a solid section builder
            foundation before we expand into full-page composition.
          </div>
        </div>

        <InlineStack gap="200">
          <Button variant="primary" onClick={onCreate}>
            Create section
          </Button>
          <Button onClick={onBrowseTemplates}>Browse sections</Button>
        </InlineStack>
      </div>
    </Card>
  );
}
