import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { syncLocalThemeSections } from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);

  await db.shop.upsert({
    where: { shopDomain: session.shop },
    update: { accessToken: session.accessToken, installedAt: new Date() },
    create: {
      shopDomain: session.shop,
      accessToken: session.accessToken ?? "",
      plan: "FREE",
    },
  });

  try {
    await syncLocalThemeSections(admin);
  } catch (error) {
    console.error("Failed to sync local theme sections during install", error);
  }

  return new Response(null, { status: 302, headers: { Location: "/app" } });
}

export default function AuthCallback() {
  return null;
}
