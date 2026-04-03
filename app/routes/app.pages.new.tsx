import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { useState } from "react";
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
  const title =
    String(body.get("title") || body.get("name") || "Untitled section").trim() ||
    "Untitled section";
  const templateId = String(body.get("templateId") || "");
  const requestedHandle = String(body.get("handle") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const generatedHandle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const handle = requestedHandle || generatedHandle || `section-${Date.now()}`;

  const shop = await ensureShopRecord(session);

  const template = templateId
    ? await db.template.findFirst({
        where: {
          id: templateId,
          OR: [{ isPublic: true }, { shopId: shop.id }],
        },
      })
    : null;

  try {
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

    return redirect(`/app/pages/${page.id}`);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "That handle already exists for this shop." };
    }

    throw error;
  }
}

export default function NewPage() {
  const { template } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const actionData = useActionData() as any;
  const [title, setTitle] = useState(template?.name ? `${template.name}` : "");

  return (
    <Page title="Create new section">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                {template && (
                  <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    Creating a section workspace from <strong>{template.name}</strong>.
                  </div>
                )}
                {template ? (
                  <input type="hidden" name="templateId" value={template.id} />
                ) : null}
                <TextField
                  label="Section name"
                  name="name"
                  autoComplete="off"
                  value={title}
                  onChange={setTitle}
                  helpText="We generate the internal handle automatically."
                />
                {actionData?.error && (
                  <div style={{ color: "#d82c0d", fontSize: 13 }}>{actionData.error}</div>
                )}
                <Button submit variant="primary">
                  Open builder
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

