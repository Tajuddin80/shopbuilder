import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { useEffect } from "react";
import { useBuilderStore } from "~/store/builderStore";
import { BuilderToolbar } from "~/components/builder/BuilderToolbar";
import { BuilderWorkspace } from "~/components/builder/BuilderWorkspace";
import { SettingsPanel } from "~/components/builder/SettingsPanel";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { pageId } = params as { pageId: string };

  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
  });
  if (!shop) throw new Response("Shop not found", { status: 404 });

  if (pageId === "new") {
    return { page: null, shop };
  }

  const page = await db.page.findFirst({
    where: { id: pageId, shopId: shop.id },
  });

  if (!page) throw new Response("Page not found", { status: 404 });
  return { page, shop };
}

export default function PageEditor() {
  const { page } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { setPageContent } = useBuilderStore();

  useEffect(() => {
    if (page?.content) setPageContent(page.content as any);
  }, [page?.id, setPageContent]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <BuilderToolbar pageId={page?.id} />
      <div
        style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, minWidth: 0 }}
      >
        <BuilderWorkspace />
        <SettingsPanel />
      </div>
    </div>
  );
}
