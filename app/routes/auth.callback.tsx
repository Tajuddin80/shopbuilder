import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  await db.shop.upsert({
    where: { shopDomain: session.shop },
    update: { accessToken: session.accessToken, installedAt: new Date() },
    create: {
      shopDomain: session.shop,
      accessToken: session.accessToken ?? "",
      plan: "FREE",
    },
  });

  return new Response(null, { status: 302, headers: { Location: "/app" } });
}

export default function AuthCallback() {
  return null;
}

