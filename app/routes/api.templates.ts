import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  const templates = await db.template.findMany({
    where: {
      isPublic: true,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
  });

  return new Response(JSON.stringify({ templates }), {
    headers: { "Content-Type": "application/json" },
  });
}

