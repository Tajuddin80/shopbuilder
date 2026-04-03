import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { ensureShopRecord } from "~/lib/shop.server";
import {
  listLocalThemeSections,
  listSavedSections,
  syncLocalThemeSections,
  syncSavedSectionsToThemes,
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
import { SavedSectionPreview } from "~/components/dashboard/SavedSectionPreview";
import { ThemeSectionStorefrontPreview } from "~/components/dashboard/ThemeSectionStorefrontPreview";

function buildStorefrontSectionPreviewUrl(shopDomain: string, handle: string) {
  const url = new URL(`https://${shopDomain}/apps/shopbuilder/section`);
  url.searchParams.set("handle", handle);
  return url.toString();
}

function buildThemeAppBlockEditorUrl(shopDomain: string, template = "index") {
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!apiKey) return null;

  const url = new URL(`https://${shopDomain}/admin/themes/current/editor`);
  url.searchParams.set("template", template);
  url.searchParams.set("addAppBlockId", `${apiKey}/shopbuilder-saved-section`);
  url.searchParams.set("target", "newAppsSection");
  return url.toString();
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await ensureShopRecord(session);

  try {
    await syncLocalThemeSections(admin);
    await syncSavedSectionsToThemes(admin, shop.id);
  } catch (error) {
    console.error("Failed to sync section library for templates page", error);
  }

  const [templates, savedSections, themeSections] = await Promise.all([
    db.template.findMany({
      where: { isPublic: true },
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
    shop ? listSavedSections(shop.id) : [],
    listLocalThemeSections(),
  ]);

  return {
    templates,
    savedSections,
    themeSections,
    shopDomain: session.shop,
    appBlockEditorUrl: buildThemeAppBlockEditorUrl(session.shop),
  };
}

export default function Templates() {
  const { templates, savedSections, themeSections, shopDomain, appBlockEditorUrl } =
    useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();

  function openThemeEditor(url: string | null) {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_top");
  }

  return (
    <Page
      title="Templates & Section Library"
      primaryAction={{
        content: "Create new section",
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
                Public templates can start a new builder workspace. Saved
                builder sections can also start a new workspace and are the
                supported path for adding ShopBuilder content to your store from
                <code> Add section -&gt; Apps</code>. Hand-written Liquid files in
                <code>theme-sections/</code> are shown below as local preview
                examples for development.
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
                          Start From Template
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
                Builder sections are collected here automatically when you click
                <strong> Save</strong> in the editor. Each one can be reopened
                in the builder and added by name from the ShopBuilder app section
                inside theme customization.
              </div>

              {savedSections.length === 0 ? (
                <Text as="p" tone="subdued">
                  Open a section in the builder and click Save to see it here.
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
                      <div style={{ marginBottom: 12 }}>
                        <SavedSectionPreview
                          section={item.section}
                          previewKey={`saved-section-${item.id}`}
                        />
                      </div>

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
                        Columns: {item.section.columns.length}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: "#5c6a79",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        Add the <strong>ShopBuilder section</strong> in Theme
                        Editor, then choose this saved section by name.
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <InlineStack gap="200" wrap>
                          <Button
                            onClick={() =>
                              navigate(`/app/pages/new?templateId=${item.id}`)
                            }
                          >
                            Start Builder With This Section
                          </Button>
                          {appBlockEditorUrl && (
                            <Button
                              onClick={() => openThemeEditor(appBlockEditorUrl)}
                            >
                              Add In Theme Editor
                            </Button>
                          )}
                        </InlineStack>
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
                  Local Liquid Section Previews
                </Text>
                <Badge tone="attention">{String(themeSections.length)}</Badge>
              </InlineStack>

              <div style={{ color: "#5c6a79", fontSize: 13, lineHeight: 1.7 }}>
                Save your own Shopify section files in <code>theme-sections/</code>.
                The cards below show a live preview so you can see what each
                local Liquid section looks like while building. Direct theme-file
                syncing is available only when this app has Shopify&apos;s
                protected theme file access.
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
                      <div style={{ marginBottom: 12 }}>
                        <ThemeSectionStorefrontPreview
                          src={buildStorefrontSectionPreviewUrl(
                            shopDomain,
                            item.handle,
                          )}
                          title={`${item.name} preview`}
                        />
                      </div>
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
                        Previewed through ShopBuilder
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
