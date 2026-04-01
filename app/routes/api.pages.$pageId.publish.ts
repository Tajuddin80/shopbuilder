import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { compileLiquid } from "~/lib/liquidCompiler.server";
import { writeThemePage } from "~/lib/themeApi.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const { pageId } = params as { pageId: string };

  const shop = await db.shop.findUnique({ where: { shopDomain: session.shop } });
  if (!shop) {
    return new Response(JSON.stringify({ error: "Shop not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const page = await db.page.findFirst({ where: { id: pageId, shopId: shop.id } });
  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { liquid, css } = compileLiquid(page.content as any);

  const result = await writeThemePage(admin, {
    handle: page.handle,
    title: page.title,
    liquidContent: liquid,
    cssContent: css,
    themePageId: page.themePageId,
  });

  await db.page.update({
    where: { id: pageId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      themePageId: result.pageId,
    },
  });

  return new Response(JSON.stringify({ success: true, previewUrl: result.previewUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}

