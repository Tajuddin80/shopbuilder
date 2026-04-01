import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IndexTable,
  Layout,
  Page,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    include: { pages: { orderBy: { updatedAt: "desc" } } },
  });

  return { pages: shop?.pages || [], plan: shop?.plan || "FREE" };
}

export default function Dashboard() {
  const { pages, plan } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pages);

  return (
    <Page
      title="Your Pages"
      primaryAction={{
        content: "Create new page",
        onAction: () => navigate("/app/pages/new"),
      }}
    >
      <Layout>
        {plan === "FREE" && pages.length >= 3 && (
          <Layout.Section>
            <Card>
              <Text as="p">
                You&apos;ve reached the free plan limit of 3 pages.{" "}
                <Button variant="plain" onClick={() => navigate("/app/billing")}>
                  Upgrade to Pro
                </Button>{" "}
                for unlimited pages.
              </Text>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          {pages.length === 0 ? (
            <EmptyState
              heading="Build your first page"
              action={{ content: "Create page", onAction: () => navigate("/app/pages/new") }}
              secondaryAction={{
                content: "Browse templates",
                onAction: () => navigate("/app/templates"),
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Use the drag-and-drop editor to create beautiful pages without any code.</p>
            </EmptyState>
          ) : (
            <Card padding="0">
              <IndexTable
                resourceName={{ singular: "page", plural: "pages" }}
                itemCount={pages.length}
                selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Title" },
                  { title: "Type" },
                  { title: "Status" },
                  { title: "Updated" },
                  { title: "Actions" },
                ]}
              >
                {pages.map((p: any, idx: number) => (
                  <IndexTable.Row
                    id={p.id}
                    key={p.id}
                    selected={selectedResources.includes(p.id)}
                    position={idx}
                  >
                    <IndexTable.Cell>
                      <Text as="span" fontWeight="semibold">
                        {p.title}
                      </Text>
                      <br />
                      <Text as="span" tone="subdued">
                        /{p.handle}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge>{p.pageType}</Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={p.status === "PUBLISHED" ? "success" : "attention"}>
                        {p.status}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{new Date(p.updatedAt).toLocaleDateString()}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Button size="slim" onClick={() => navigate(`/app/pages/${p.id}`)}>
                        Edit
                      </Button>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

