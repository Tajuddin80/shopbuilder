import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { Button, Card, FormLayout, Layout, Page, TextField } from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const body = await request.formData();
  const title = String(body.get("title") || "Untitled page");
  const handle = String(body.get("handle") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!handle) return { error: "Handle is required" };

  const shop = await db.shop.findUnique({ where: { shopDomain: session.shop } });
  if (!shop) return { error: "Shop not found. Reinstall the app." };

  const page = await db.page.create({
    data: {
      shopId: shop.id,
      title,
      handle,
      pageType: "LANDING",
      status: "DRAFT",
      content: {
        version: "1.0",
        globalStyles: {
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          maxWidth: 1200,
          customCss: "",
        },
        sections: [],
      },
    },
  });

  return { pageId: page.id };
}

export default function NewPage() {
  const actionData = useActionData() as any;
  const navigate = useNavigate();

  if (actionData?.pageId) {
    navigate(`/app/pages/${actionData.pageId}`);
  }

  return (
    <Page title="Create new page">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <TextField label="Title" name="title" autoComplete="off" />
                <TextField label="Handle" name="handle" helpText="e.g. summer-sale" autoComplete="off" />
                {actionData?.error && (
                  <div style={{ color: "#d82c0d", fontSize: 13 }}>{actionData.error}</div>
                )}
                <Button submit variant="primary">
                  Create
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

