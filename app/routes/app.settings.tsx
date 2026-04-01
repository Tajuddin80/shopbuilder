import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { Card, Layout, Page, Text } from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}

export default function Settings() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p" tone="subdued">
              Settings page scaffolding.
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

