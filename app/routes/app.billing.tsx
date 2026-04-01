import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { Card, Layout, Page, Text } from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}

export default function Billing() {
  return (
    <Page title="Billing">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p" tone="subdued">
              Billing page scaffolding (Shopify Billing API helpers live in `app/lib/billingApi.server.ts`).
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

