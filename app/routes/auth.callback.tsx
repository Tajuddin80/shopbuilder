import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { ensureShopRecord } from "~/lib/shop.server";
import { syncLocalThemeSections } from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin, redirect } = await authenticate.admin(request);

  await ensureShopRecord(session);

  try {
    await syncLocalThemeSections(admin);
  } catch (error) {
    console.error("Failed to sync local theme sections during install", error);
  }

  return redirect("/app");
}

export default function AuthCallback() {
  return null;
}
