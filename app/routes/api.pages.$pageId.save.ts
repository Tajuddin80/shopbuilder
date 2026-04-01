import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { pageContentSchema } from "~/lib/pageSchema";

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { pageId } = params as { pageId: string };
  const body = await request.json();

  const parsed = pageContentSchema.safeParse(body.content);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid page content", details: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const shop = await db.shop.findUnique({ where: { shopDomain: session.shop } });
  if (!shop) {
    return new Response(JSON.stringify({ error: "Shop not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const existingPage = await db.page.findFirst({ where: { id: pageId, shopId: shop.id } });
  if (existingPage) {
    await db.pageVersion.create({
      data: { pageId, content: existingPage.content as any },
    });
    const versions = await db.pageVersion.findMany({
      where: { pageId },
      orderBy: { createdAt: "desc" },
      skip: 20,
    });
    if (versions.length > 0) {
      await db.pageVersion.deleteMany({
        where: { id: { in: versions.map((v: { id: string }) => v.id) } },
      });
    }
  }

  const page = await db.page.update({
    where: { id: pageId },
    data: {
      content: parsed.data as any,
      title: body.meta?.title,
      handle: body.meta?.handle,
      seoTitle: body.meta?.seoTitle,
      seoDescription: body.meta?.seoDescription,
    },
  });

  return new Response(JSON.stringify({ success: true, page }), {
    headers: { "Content-Type": "application/json" },
  });
}

