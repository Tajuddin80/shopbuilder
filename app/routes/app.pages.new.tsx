import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { ensureShopRecord } from "~/lib/shop.server";
import { Button, Card, FormLayout, Layout, Page, TextField } from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const templateId = url.searchParams.get("templateId");

  if (!templateId) {
    return { template: null };
  }

  const shop = await ensureShopRecord(session);

  const template = shop
    ? await db.template.findFirst({
        where: {
          id: templateId,
          OR: [{ isPublic: true }, { shopId: shop.id }],
        },
        select: { id: true, name: true, category: true },
      })
    : null;

  return { template };
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const body = await request.formData();
  const title = String(body.get("title") || "Untitled page");
  const templateId = String(body.get("templateId") || "");
  const handle = String(body.get("handle") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!handle) return { error: "Handle is required" };

  const shop = await ensureShopRecord(session);

  const template = templateId
    ? await db.template.findFirst({
        where: {
          id: templateId,
          OR: [{ isPublic: true }, { shopId: shop.id }],
        },
      })
    : null;

  const page = await db.page.create({
    data: {
      shopId: shop.id,
      title,
      handle,
      pageType: "LANDING",
      status: "DRAFT",
      content: (template?.content as any) || {
        version: "1.0",
        globalStyles: {
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          maxWidth: 1200,
          customCss: "",
        },
        sections: [],
      },
      templateId: template?.id || null,
    },
  });

  return { pageId: page.id };
}

export default function NewPage() {
  const { template } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
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
                {template && (
                  <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    Creating a page from the template <strong>{template.name}</strong>.
                  </div>
                )}
                {template ? (
                  <input type="hidden" name="templateId" value={template.id} />
                ) : null}
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

