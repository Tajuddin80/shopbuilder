import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import {
  listLocalThemeSections,
  listSavedSections,
} from "~/lib/themeSectionLibrary.server";
import {
  Badge,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  const [templates, savedSections, themeSections] = await Promise.all([
    db.template.findMany({
      where: { isPublic: true },
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
    shop ? listSavedSections(shop.id) : [],
    listLocalThemeSections(),
  ]);

  return { templates, savedSections, themeSections };
}

export default function Templates() {
  const { templates, savedSections, themeSections } =
    useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();

  return (
    <Page
      title="Templates & Section Library"
      primaryAction={{
        content: "Create new page",
        onAction: () => navigate("/app/pages/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Text as="h2" variant="headingMd">
                Build with saved sections and native Liquid
              </Text>
              <div style={{ color: "#5c6a79", fontSize: 14, lineHeight: 1.7 }}>
                Public templates can start a full page. Saved builder sections
                can also start a new page and are already synced as native
                Shopify sections. Your own hand-written Liquid files should live
                in <code>theme-sections/</code> so the app can sync them into
                the active theme.
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingMd">
                  Public Templates
                </Text>
                <Badge>{String(templates.length)}</Badge>
              </InlineStack>

              {templates.length === 0 ? (
                <Text as="p" tone="subdued">
                  No public templates are available yet.
                </Text>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  {templates.map((template: any) => (
                    <div
                      key={template.id}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 14,
                        padding: 14,
                        background: "#ffffff",
                      }}
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="p" fontWeight="semibold">
                          {template.name}
                        </Text>
                        <Badge tone="info">{template.category}</Badge>
                      </InlineStack>
                      <div
                        style={{
                          marginTop: 8,
                          minHeight: 44,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {template.description || "Reusable starter layout."}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <Button
                          onClick={() =>
                            navigate(`/app/pages/new?templateId=${template.id}`)
                          }
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingMd">
                  Saved Builder Sections
                </Text>
                <Badge tone="success">{String(savedSections.length)}</Badge>
              </InlineStack>

              <div style={{ color: "#5c6a79", fontSize: 13, lineHeight: 1.6 }}>
                These come from the builder&apos;s top-right save flow. Each one
                is reusable in the builder and also available in Shopify theme
                customization as a native <code>sections/*.liquid</code> asset.
              </div>

              {savedSections.length === 0 ? (
                <Text as="p" tone="subdued">
                  Save a section from the builder to see it here.
                </Text>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  {savedSections.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 14,
                        padding: 14,
                        background: "#ffffff",
                      }}
                    >
                      <Text as="p" fontWeight="semibold">
                        {item.name}
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        Theme handle: <code>{item.handle}</code>
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        Columns: {item.section.columns.length}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <Button
                          onClick={() =>
                            navigate(`/app/pages/new?templateId=${item.id}`)
                          }
                        >
                          Start Page With This Section
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingMd">
                  Local Native Liquid Sections
                </Text>
                <Badge tone="attention">{String(themeSections.length)}</Badge>
              </InlineStack>

              <div style={{ color: "#5c6a79", fontSize: 13, lineHeight: 1.7 }}>
                Save your own Shopify section files in <code>theme-sections/</code>.
                After install or sync, merchants can add them directly in theme
                customization. You can also reference them inside the builder
                with a Liquid block using <code>{`{% section 'handle' %}`}</code>.
              </div>

              {themeSections.length === 0 ? (
                <Text as="p" tone="subdued">
                  No local Liquid section files found yet.
                </Text>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  {themeSections.map((item) => (
                    <div
                      key={item.handle}
                      style={{
                        border: "1px solid #dbe2ea",
                        borderRadius: 14,
                        padding: 14,
                        background: "#ffffff",
                      }}
                    >
                      <Text as="p" fontWeight="semibold">
                        {item.name}
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        File: <code>{item.fileName}</code>
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        Handle: <code>{item.handle}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
