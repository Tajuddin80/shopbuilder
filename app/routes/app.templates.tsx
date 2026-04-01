import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { Card, Layout, Page, Text } from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const templates = await db.template.findMany({
    where: { isPublic: true },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
  return { templates, shop: session.shop };
}

export default function Templates() {
  const { templates } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return (
    <Page title="Templates">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p" tone="subdued">
              Template library scaffolding. ({templates.length} templates)
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

